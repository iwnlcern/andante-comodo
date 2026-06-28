# Asset Credits

This demo ships public-domain and openly licensed Gustav Mahler material so the template is buildable before you replace the identity layer.

Replace these assets before publishing a real personal site.

## Images

- `portrait.jpg`
  - Source: Wikimedia Commons, `File:Photo of Gustav Mahler by Moritz Naehr 01.jpg`
  - URL: https://commons.wikimedia.org/wiki/File:Photo_of_Gustav_Mahler_by_Moritz_N%C3%A4hr_01.jpg
  - Author: Moritz Naehr
  - Date: 1907
  - License basis: Public domain mark; published before 1931 in the United States, author died in 1945.
- `og-image.png`
  - Source: generated locally from `portrait.jpg`.
  - License basis: Same as `portrait.jpg`.
- `favicon.svg`, `favicon.png`
  - Source: generated locally for this template.
  - License basis: Template-authored.
- `adagietto-opening.png`
  - Source: page 1 of `scores/mahler-5-score.pdf` (Symphony No. 5, IV. Adagietto), rasterized to PNG for the Markdown-extension showcase figure.
  - License basis: Public domain — same source/basis as `scores/mahler-5-score.pdf` below.

## Scores

- `scores/mahler-5-score.pdf`
  - Source file: `IMSLP111956-SIBLEY1802.15647.1cc7-39087009398233score.pdf`
  - Work: Gustav Mahler, Symphony No. 5, GMW 44
  - URL: https://imslp.org/wiki/Symphony_No.5%2C_GMW_44_%28Mahler%2C_Gustav%29
  - License basis: Public domain score scan as marked by IMSLP.
  - Processing: IV. Adagietto, source PDF pages 176–180. Pages rasterized to grayscale JPEG and re-wrapped (the original JBIG2-compressed scan does not render in browser pdf.js).
- `scores/mahler-2-score.pdf`
  - Source file: `IMSLP415748-PMLP49406-GMahler_Symphony_No.2_fe_UE_reprint_RSL1.pdf`
  - Work: Gustav Mahler, Symphony No. 2, GMW 30
  - URL: https://imslp.org/wiki/Symphony_No.2%2C_GMW_30_%28Mahler%2C_Gustav%29
  - License basis: Public domain score scan as marked by IMSLP.
  - Processing: I. Allegro maestoso (opening excerpt), source PDF pages 3–8. Pages rasterized to grayscale JPEG and re-wrapped (the original JBIG2-compressed scan does not render in browser pdf.js).
- `scores/mahler-9-i-score.pdf`
  - Source file: `IMSLP20988-PMLP48640-Symphony_No._9_-_I.pdf`
  - Work: Gustav Mahler, Symphony No. 9, GMW 50
  - URL: https://imslp.org/wiki/Symphony_No.9%2C_GMW_50_%28Mahler%2C_Gustav%29
  - License basis: Public domain score scan as marked by IMSLP.
  - Processing: I. Andante comodo (complete movement), source PDF pages 1–58. Pages rasterized to grayscale JPEG and re-wrapped (the original JBIG2-compressed scan does not render in browser pdf.js). Kept in full to match the complete-movement audio (the namesake "andante comodo").

## Audio

- `audio/mahler-5-adagietto-peabody.mp3`
  - Source file: `IMSLP1038539-PMLP08063-04.PSO020103-Mahler-5-IV.mp3`
  - Performer: Peabody Symphony Orchestra
  - Source: https://archive.org/details/Mahler_Symphony_5/04.PSO020103-Mahler-5-IV.mp3
  - License basis: CC0 1.0 / public-domain dedication as mirrored on Wikimedia Commons.
  - Processing: Excerpt — first ~90s (lossless MP3 frame cut). CC0 permits any use.
- `audio/mahler-2-i-dupage.mp3`
  - Source file: `IMSLP79942-PMLP49406-dso-2004-05-22_1.mp3`
  - Performer: DuPage Symphony Orchestra
  - Source: https://imslp.org/wiki/Symphony_No.2%2C_GMW_30_%28Mahler%2C_Gustav%29
  - License: Creative Commons Attribution-ShareAlike 3.0.
  - Processing: Excerpt — first ~90s (lossless MP3 frame cut). BY-SA permits excerpting; attribution and ShareAlike are retained (this excerpt remains CC BY-SA 3.0).
- `audio/mahler-9-i-chicago-orchestra.mp3`
  - Source file: `IMSLP83003-PMLP48640-uso-20070303-01_mahler9-mvtI_vbr.mp3`
  - Performer: U. of Chicago Orchestra; Barbara Schubert, conductor
  - Source: https://imslp.org/wiki/Symphony_No.9%2C_GMW_50_%28Mahler%2C_Gustav%29
  - License: Creative Commons Attribution-NonCommercial-NoDerivatives 3.0.
  - Distribution note: shipped whole and unmodified. Replace for commercial use or any modified use.

## Fonts

Self-hosted under `public/fonts/`. Full license texts: `public/fonts/OFL.txt` (the three OFL faces) plus the Comic Mono MIT link below.

- `BodoniStd-Roman.woff2` — **Bodoni Moda** (display face: titles and headings). The filename is retained so the bundled `@font-face` resolves it without a rename; the file's embedded metadata is Bodoni Moda's.
  - Author: The Bodoni Moda Project Authors (https://github.com/indestructible-type/Bodoni)
  - License: SIL Open Font License 1.1 — see `public/fonts/OFL.txt`.
- `EBGaramond-Variable.woff2`, `EBGaramond-Italic-Variable.woff2` — **EB Garamond** (body text).
  - Author: The EB Garamond Project Authors (https://github.com/octaviopardo/EBGaramond12)
  - License: SIL Open Font License 1.1.
- `Inter-Variable.woff2` — **Inter** (résumé page).
  - Author: The Inter Project Authors (https://github.com/rsms/inter)
  - License: SIL Open Font License 1.1.
- `ComicMono.ttf`, `ComicMono-Bold.ttf` — **Comic Mono** (code).
  - Author: dtinth
  - License: MIT — https://github.com/dtinth/comic-mono-font/blob/master/LICENSE

## UI icons

- `public/img/dangerous-bend.svg`, `info.svg`, `lightbulb.svg` — admonition icons, template-authored.
