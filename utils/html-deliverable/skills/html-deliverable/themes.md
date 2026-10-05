# Theme recipes

Read only the recipe of the theme you picked. Every theme keeps the invariant structure and the Apple base from SKILL.md; the recipe sets format, palette and type. When the content has a brand (SKILL.md, "Brand"), the brand's accent and fonts replace the recipe's; surfaces and format stay.

## base
Default for work: kickoffs, plans, working docs, pitches.
White `#fff`, ink `#171717`, hairlines `#eaeaea`, one accent `#2148b8` · Geist + Geist Mono · working docs at weight 600 and ~2.5rem display; pitches at 800 and 3.5rem+ with huge stats. Radius 10px.

## editorial
Long reads and narrative proposals; muted, calm.
Warm paper `#f7f6f3`, off-black ink `#2b2a27`, hairlines `#e5e2dc`, accent a desaturated brown `#7a5c3e` · serif display only (Newsreader or Fraunces) + Geist body · hierarchy by opacity of one ink (100 / 70 / 45%), headings 400-600 · washed pastel tags, more leading, 8px grid.

## print
Personal reports, digests, retrospectives, postmortems: a memorable identity beats reading speed.
Paper `#E9E9E5` + exactly two inks: charcoal `#30343A` (~80%: text, rules, halftone screens) and signal red `#C83232` (~20%: section numerals, one key stat, alerts) · Archivo + IBM Plex Mono · zero radius, no cards or shadows, ruled rows and hairlines · bar fills as halftone dot screens; hero = one screened disc crossed by an oversized display word · uppercase mono microcopy and numbered section headers allowed here only · one hand-drawn circle around one number at most · dark toggle = negative plate.
Variants: B one ink (cobalt `#2148B8` on `#FAFAF7`, type-led headline); C journal (beige `#F5F1E8`, oxblood `#6E2A2A` text + green `#008A4B` graphics, Fraunces).

## tablero
Dashboards, programme status, metrics, live technical evidence: the numbers are the argument. Dark-locked.
Canvas `#0b0d10`, surfaces `#12151a` / `#181c23`, ink `#eef1f5`, hairlines `#242a33`, accent `#5b8def`, radius 14px · Space Grotesk or Geist display + JetBrains Mono numerals at `clamp(56px, 11vw, 150px)`, tabular-nums · opens with a bento of stat cells, one fact per cell, no empty tile; one cell with an accent radial, one with a dot grid, one accent-bordered, rest flat · prose only after the grid · optional staggered entry (70ms × index).

## tecnico
Dev guides, QA, setup docs, technical reviews.
Light `#f6f8fa` / surface `#fff` / ink `#1f2328` / hairlines `#d0d7de`; dark `#0d1117` / `#161b22` / `#e6edf3` / `#30363d`; accent emerald `#059669` (dark `#34d399`), radius 8px · Geist + JetBrains Mono, mono for headings of commands and paths · major sections alternate light and dark bands to pace long reading · sticky left index when there are more than 6 sections · command blocks with a copy button · **diff block** for "today vs missing": removed lines tinted red, added lines tinted the accent · steps as a vertical timeline.

## changelog
Proposing or announcing a change to a tool, rule, config or process. Light-locked, so it never reads as a dark dashboard.
Paper `#fcfcfc`, ink `#18181b`, hairlines `#e4e4e7`, code surface `#f4f4f5`, accent green `#15803d`, radius 6px · Geist + Geist Mono, body 15px · left column is a **release spine**: a vertical line with one dot per change, version and date in mono, sticky; the reading column holds one card per change: name + status pill, a diff block (caption bar, removed red, added accent), one line of why · fixed order: what broke, changes, what stays, how it is adopted, status.

## organic
Chill, friendly pages read often or for fun: personal dailies, habit trackers, notes to friends.
Warm paper `#EFE8D8`, cards `#F6F1E5`, ink `#2A221C`, hairlines `#D9CFBB`, olive `#56652F` (text `#3E4A20`) plus one playful second color used sparingly (clay `#D9623B`, coral `#FBA38B` for tints) · Fraunces with `font-variation-settings: "SOFT" 100, "WONK" 1`, weight 650-800, line-height .9-1 · Instrument Sans 15.5px body · DM Mono for labels and numbers · big soft cards, radius 28px, no borders or shadows · sections as two-column cards (220px side with kicker and display title) · links as small olive mono pills · rise 520ms `cubic-bezier(.19,1,.22,1)`, 70ms stagger · dark = forest night (`#191D13`, `#21261A`, olive `#9DB061`, clay `#E8835F`) · reference: drinkolipop.com via Inspo.

## joy
Trips, events, celebrations, anything that should feel like the activity itself. Light-locked.
Cream `#fff4d6`, ink `#1b1b1b`, at most three saturated flats: coral `#ff4f5e`, mint `#8ee3c8`, sun `#ffd23f` · Archivo 800 display, tight and big; Archivo or Geist body · neo-brutalist blocks: 2.5px ink borders, hard offset shadows `4px 4px 0 #1b1b1b`, radius 4-14px · day cards and tickets as blocks; one tag or sticker tilted -2deg per screen; one marquee band at most · a CSS-drawn hero scene or map tied to the place, never a stock photo.
