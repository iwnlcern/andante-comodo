import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { canonicalizeListmonkEnv, getApiResults } from '#lib/newsletter/listmonk.mjs';
import { derivePostPath } from '#lib/newsletter/newsletter-redirect.mjs';
import { primaryFeedCollection } from '#lib/content/collection-registry.mjs';
import { site } from '#config/site.mjs';
import { siteUrl, isSiteOrigin } from '#lib/config/site.mjs';

const SITE_ORIGIN = site.url;
const { postPrefix: POST_PREFIX } = derivePostPath(primaryFeedCollection());

export function postFallbackHref(prefix = POST_PREFIX) {
  return prefix ? `${SITE_ORIGIN}${prefix}` : siteUrl('/');
}

function getEnv(name, fallback = '') {
  const value = process.env[name];
  return typeof value === 'string' ? value.trim() : fallback;
}

function requireEnv(name) {
  const value = getEnv(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function decodeEntities(input) {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripCdata(input) {
  return input
    .replace(/^<!\[CDATA\[/, '')
    .replace(/\]\]>$/, '')
    .trim();
}

function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  if (!match) return '';
  return decodeEntities(stripCdata(match[1]));
}

function parseItems(rssXml) {
  const itemMatches = rssXml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];
  return itemMatches.map((itemXml) => {
    const title = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link');
    const guid = extractTag(itemXml, 'guid') || link || title;
    const description = extractTag(itemXml, 'description');
    const pubDate = extractTag(itemXml, 'pubDate');
    return { title, link, guid, description, pubDate };
  });
}

function listmonkAuthHeaders(user, token) {
  const basic = Buffer.from(`${user}:${token}`).toString('base64');
  return {
    Authorization: `Basic ${basic}`,
  };
}

async function parseJsonResponse(response) {
  const raw = await response.text();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`Expected JSON but got: ${raw.slice(0, 300)}`);
  }
}

async function apiFetchJson(baseUrl, user, token, path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...listmonkAuthHeaders(user, token),
      ...(init.headers ?? {}),
    },
  });

  const payload = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(
      `Listmonk API ${response.status} on ${path}: ${JSON.stringify(payload).slice(0, 500)}`,
    );
  }
  return payload;
}

async function resolveListId(baseUrl, user, token, listIdFromEnv, listUuidFromEnv) {
  if (listIdFromEnv) {
    const numeric = Number(listIdFromEnv);
    if (!Number.isFinite(numeric)) {
      throw new Error(`LISTMONK_LIST_ID is not a number: ${listIdFromEnv}`);
    }
    return numeric;
  }

  if (!listUuidFromEnv) {
    throw new Error('Set LISTMONK_LIST_ID or LISTMONK_LIST_UUID');
  }

  const payload = await apiFetchJson(baseUrl, user, token, '/api/lists?per_page=200&page=1');
  const lists = getApiResults(payload);
  const match = lists.find((list) => String(list.uuid ?? '').trim() === listUuidFromEnv);
  if (!match) {
    throw new Error(`Could not find list UUID ${listUuidFromEnv} in /api/lists`);
  }

  const numericId = Number(match.id);
  if (!Number.isFinite(numericId)) {
    throw new Error(`Resolved list ID is invalid for UUID ${listUuidFromEnv}`);
  }
  return numericId;
}

async function alreadySent(baseUrl, user, token, dedupeTag) {
  for (let page = 1; page <= 50; page++) {
    const payload = await apiFetchJson(
      baseUrl,
      user,
      token,
      `/api/campaigns?per_page=100&page=${page}`,
    );
    const campaigns = getApiResults(payload);
    if (campaigns.length === 0) return false;
    const hit = campaigns.some((campaign) => {
      const tags = Array.isArray(campaign.tags) ? campaign.tags.map(String) : [];
      const name = String(campaign.name ?? '');
      return tags.includes(dedupeTag) || name.includes(dedupeTag);
    });
    if (hit) return true;
  }
  return false;
}

export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function safeHref(link, prefix = POST_PREFIX) {
  try {
    const u = new URL(String(link));
    if (u.protocol !== 'https:' || !isSiteOrigin(u.href)) return postFallbackHref(prefix);
    return escapeHtml(u.toString());
  } catch {
    return postFallbackHref(prefix);
  }
}

// Keep the legacy blog helper names for low churn; POST_PREFIX is the primary-feed source of truth.
export function isBlogItem(item, prefix = POST_PREFIX) {
  if (!prefix) return false;
  try {
    const u = new URL(String(item?.link));
    return u.protocol === 'https:' && isSiteOrigin(u.href) && u.pathname.startsWith(prefix);
  } catch {
    return false;
  }
}

export function selectBlogItem(items, prefix = POST_PREFIX) {
  return items.find((item) => isBlogItem(item, prefix)) ?? null;
}

export function formatPubDate(pubDate) {
  const parsed = new Date(pubDate);
  if (Number.isNaN(parsed.getTime())) return pubDate;
  // Feed pubDates carry no real time-of-day (frontmatter dates render as
  // midnight GMT), so emit the date portion only: "Fri, 10 Jul 2026".
  return parsed.toUTCString().slice(0, 16);
}

export function buildCampaignBody(item) {
  const dateRow = item.pubDate
    ? `<p style="margin:0 0 10px 0; color:#a1a1a1; font-size:12px;">${escapeHtml(formatPubDate(item.pubDate))}</p>`
    : '';
  const safeTitle = escapeHtml(item.title || 'New post');
  const href = safeHref(item.link);
  const safeDescription = item.description
    ? `<p style="margin:0;">${escapeHtml(item.description)}</p>`
    : '<p style="margin:0;">A new item is available from the primary feed.</p>';

  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0f0f0f; border:1px solid #262626; border-radius:12px;">
  <tr>
    <td style="padding:20px; font-family:'EB Garamond', 'Iowan Old Style', Georgia, serif;">
      ${dateRow}
      <h2 style="margin:0 0 12px 0; color:#fafafa; font-family:'Bodoni Std', 'Bodoni 72', Didot, Georgia, serif; font-size:26px; line-height:32px; font-weight:400;">
        ${safeTitle}
      </h2>
      <div style="margin:0 0 18px 0; color:#a1a1a1; font-size:17px; line-height:25px;">
        ${safeDescription}
      </div>
      <a href="${href}" target="_blank" style="display:inline-block; padding:12px 18px; border-radius:8px; background:#ffffff; color:#0a0a0a; text-decoration:none; font-size:15px; font-weight:600; border:1px solid #e5e5e5;">
        Read the post
      </a>
    </td>
  </tr>
</table>`.trim();
}

async function main() {
  const rssFeedUrl = getEnv('RSS_FEED_URL') || siteUrl('/rss-blog.xml');
  const { baseUrl } = canonicalizeListmonkEnv([process.env], { emptyStringFallsThrough: true });
  const user = requireEnv('LISTMONK_USER');
  const token = requireEnv('LISTMONK_TOKEN');
  const fromEmail = requireEnv('LISTMONK_FROM_EMAIL');
  const listIdFromEnv = getEnv('LISTMONK_LIST_ID');
  const listUuidFromEnv = getEnv('LISTMONK_LIST_UUID');
  const templateIdRaw = getEnv('LISTMONK_TEMPLATE_ID');
  const templateId = templateIdRaw ? Number(templateIdRaw) : null;
  const tagPrefix = getEnv('LISTMONK_CAMPAIGN_TAG_PREFIX', 'rss-auto');

  if (!baseUrl) {
    throw new Error('Set LISTMONK_BASE_URL or LISTMONK_BASE');
  }

  const rssResponse = await fetch(rssFeedUrl);
  if (!rssResponse.ok) {
    throw new Error(`RSS fetch failed: ${rssResponse.status} ${rssResponse.statusText}`);
  }
  const rssXml = await rssResponse.text();
  const items = parseItems(rssXml);
  if (items.length === 0) {
    console.log('No RSS items found. Exiting.');
    return;
  }

  const item = selectBlogItem(items);
  if (!item) {
    console.log('No primary-feed items found in feed. Exiting.');
    return;
  }
  const dedupeSource = item.guid || `${item.title}|${item.link}`;
  const dedupeHash = crypto.createHash('sha1').update(dedupeSource).digest('hex').slice(0, 12);
  const dedupeTag = `${tagPrefix}:${dedupeHash}`;

  const alreadyExists = await alreadySent(baseUrl, user, token, dedupeTag);
  if (alreadyExists) {
    console.log(`Skipping. Campaign with tag ${dedupeTag} already exists.`);
    return;
  }

  const listId = await resolveListId(baseUrl, user, token, listIdFromEnv, listUuidFromEnv);

  const payload = {
    name: `RSS: ${item.title || 'New post'} [${dedupeTag}]`,
    subject: item.title || 'New post',
    lists: [listId],
    from_email: fromEmail,
    content_type: 'richtext',
    messenger: 'email',
    body: buildCampaignBody(item),
    tags: ['rss', dedupeTag],
    ...(templateId && Number.isFinite(templateId) ? { template_id: templateId } : {}),
  };

  const created = await apiFetchJson(baseUrl, user, token, '/api/campaigns', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const campaignId = Number(created?.data?.id ?? created?.id);
  if (!Number.isFinite(campaignId)) {
    throw new Error(`Unable to read campaign ID from response: ${JSON.stringify(created)}`);
  }

  console.log(`Created draft campaign ${campaignId}: ${item.title}. Review and send from Listmonk.`);
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (invokedDirectly) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
