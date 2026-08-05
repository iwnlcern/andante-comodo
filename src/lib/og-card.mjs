import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';

const WIDTH = 1200;
const HEIGHT = 630;
const DISPLAY_FONT = 'source-assets/fonts/BodoniModaSC-Regular.ttf';

export function ogCardTree({ title, kicker, detail, name }) {
  const titleSize = title.length > 72 ? 54 : title.length > 45 ? 62 : 72;
  return {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 72px',
        backgroundColor: '#130f0a',
        backgroundImage: 'radial-gradient(circle at 88% 10%, #38291b 0%, #130f0a 44%)',
        color: '#f1ece0',
        fontFamily: 'Bodoni Moda SC',
        border: '2px solid #5a4938',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#caa574',
              fontSize: 24,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            },
            children: [
              { type: 'div', props: { children: kicker } },
              { type: 'div', props: { children: name } },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: 28,
              maxWidth: 1020,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: titleSize,
                    lineHeight: 1.02,
                    letterSpacing: '-0.02em',
                    textWrap: 'balance',
                  },
                  children: title,
                },
              },
              detail
                ? {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        color: '#b8aa98',
                        fontSize: 26,
                        letterSpacing: '0.02em',
                      },
                      children: detail,
                    },
                  }
                : null,
            ].filter(Boolean),
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              width: 180,
              height: 4,
              backgroundColor: '#b87938',
            },
          },
        },
      ],
    },
  };
}

export async function renderOgCard({ title, kicker, detail, name }) {
  const font = await readFile(path.join(process.cwd(), DISPLAY_FONT));
  const card = ogCardTree({ title, kicker, detail, name });
  const svg = await satori(card, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [{ name: 'Bodoni Moda SC', data: font, weight: 400, style: 'normal' }],
  });
  return new Resvg(svg, { background: '#130f0a' }).render().asPng();
}
