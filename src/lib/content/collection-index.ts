export interface IndexItem {
  title: string;
  href: string;
  external?: boolean;
  date?: Date;
  description?: string;
  tags?: string[];
  accent?: string;
  meta?: string;
  rating?: number;
  highlight?: boolean;
  media?: { audio?: string };
}

export type SectionVariant = 'rows' | 'cards';

export interface IndexSection {
  label?: string;
  variant: SectionVariant;
  items: IndexItem[];
  scope?: string;
}

export interface CollectionIndexProps {
  title: string;
  description?: string;
  sections: IndexSection[];
  emptyText?: string;
  // When true, wrap all sections in one outer data-tag-filter-scope and expose a
  // `controls` slot above them (filter UI mounts there). Backward-compatible.
  filterable?: boolean;
  filterScope?: string;
}

type Dated = { data: { date: Date } };
type WorkDated = { data: { year: string | number } };

/** Newest-first, capped at n. For date-bearing collections. */
export function recent<T extends Dated>(entries: T[], n: number): T[] {
  return [...entries]
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .slice(0, n);
}

export function workSortKey(year: string | number): number {
  const s = String(year).toLowerCase();
  if (s.includes('ongoing')) return Infinity;
  const match = s.match(/(\d{4})\s*$/);
  return match ? parseInt(match[1], 10) : parseInt(s.slice(0, 4), 10);
}

export function recentWorks<T extends WorkDated>(entries: T[], n: number): T[] {
  return [...entries]
    .sort((a, b) => workSortKey(b.data.year) - workSortKey(a.data.year))
    .slice(0, n);
}
