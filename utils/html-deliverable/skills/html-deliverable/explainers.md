# Explainers

Read when the page explains an outside source to a reader who has not read it.


The reader is a developer who never opened the source. Explain what the SOURCE
proposes (its metric, mechanism, claim), not what a test, a PR or CI is.
Checked before opening the file:

- **The source's own concept comes first, in plain words**: 2 or 3 sentences
  on the mechanism, middle register leaning simple. Developer vocabulary stays
  unexplained (test, PR, merge, CI, staging, coverage); the source's mechanism
  is told without formulas, variable names or untranslated acronyms. Right:
  "it combines two things: how many paths the code has and how much test
  coverage; many paths and little coverage score high, the line is at 30".
  Too hard: "cyclomatic complexity squared times missing coverage cubed". Too
  easy: "automated tests, which are small programs that...".
- **What gets one clause of explanation, the first time only**: the source's
  own terms, the project's bots and file names, acronyms that are not
  universal.
- **Desktop layout when the reader reads on desktop**: a container around
  1400 px, chapters in two columns (prose left, headline number and decision
  right). Never a narrow 800 px column in the middle of a wide screen, and
  never shrink the layout when shortening the text.
- **A number never stands alone**: what it measures, out of what total, what
  it means. "53" is noise; "53 of 4,848 methods, 28 in the payroll sync" is
  information.
- **One headline number per chapter**, in display size, at most one secondary
  in smaller type. Never a table where every number carries the same visual
  weight: the reader cannot tell what matters.
- **Hard length budget for source explainers: about 450 words of prose on the
  whole page**, one screen per source at most, no glossary. Cut sentences
  before cutting numbers.
