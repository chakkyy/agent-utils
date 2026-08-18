# Principles — verified quotes and sources

Reach for these only **after** local evidence is on the page. None of them justifies work on
its own; they frame a case that already stands.

Verification legend: ✅ read at a primary or near-primary source · ⚠️ confirmed only in a
secondary source · ❌ the common attribution is wrong.

---

## Knuth, 1974 — the strongest of the set ✅

Almost always quoted truncated, and the truncation reverses half the argument. Full passage:

> "We should forget about small efficiencies, say about 97% of the time: premature
> optimization is the root of all evil. Yet we should not pass up our opportunities in that
> critical 3%. A good programmer will not be lulled into complacency by such reasoning, he
> will be wise to look carefully at the critical code; **but only after that code has been
> identified. It is often a mistake to make a priori judgments about what parts of a program
> are really critical, since the universal experience of programmers who have been using
> measurement tools has been that their intuitive guesses fail.**"

*Structured Programming with `go to` Statements*, ACM Computing Surveys 6(4), December 1974,
p. 268. PDF: https://pic.plover.com/knuth-GOTO.pdf

Not an anti-optimisation principle: a **measurement mandate**, with an empirical claim
attached — intuitive guesses about where the problem lives fail. Knuth defends the critical
3% in the same breath, and two sentences earlier defends a 12% gain as non-marginal.

## Google SRE — Postmortem Culture ✅

The closest operational precedent to this skill's rule. Improvement work is authorised by a
**named triggering event**: user-visible downtime past a threshold, data loss, an on-call
intervention, resolution time exceeded, or a monitoring gap that forced manual discovery.
Action items derive from a real incident's root-cause analysis.

> "A postmortem is a written record of an incident, its impact, the actions taken to mitigate
> or resolve it, the root cause(s), and the follow-up actions to prevent the incident from
> recurring."

https://sre.google/sre-book/postmortem-culture/ — When you cannot fill in "the incident was
___ on ___", there is no postmortem and no action item.

## Evidence-Based Management Guide, Scrum.org, May 2024 ✅

> "Beliefs in what is valuable are merely assumptions until they are validated by customers."

> "Every feature and every requirement really represents a hypothesis about value. One of the
> goals of an empirical approach is to make these hypotheses explicit and to consciously
> design experiments that explicitly test the value."

https://www.scrum.org/resources/evidence-based-management-guide (CC BY-SA 4.0) — State the
proposal as an explicit hypothesis and name the cheapest test that could disprove it.

## YAGNI — Martin Fowler, 2015 ✅

Coined by **Kent Beck** on the Chrysler C3 project, replying to Chet Hendrickson.

> "There's an obvious cost of the presumptive feature — the cost of build: all the effort
> spent on analyzing, programming, and testing this now useless feature."

https://martinfowler.com/bliki/Yagni.html — Carries a limit that gets dropped in retelling:
YAGNI applies to speculative **capabilities**, not to effort that makes the code easier to
modify.

## Genchi genbutsu — Toyota ✅

> "Go and see the location or process where the problem exists in order to solve that problem
> more quickly and efficiently."

https://mag.toyota.co.uk/genchi-genbutsu/ — *Genchi* = actual place, *genbutsu* = actual
thing. The point is to work from facts and strip the bias that reports introduce. Do not
propose from a ticket description: open the logs, reproduce the failure, read the code path,
and quote what you found there.

## Chesterton, *The Thing*, 1929 ✅ — the reverse guard

> "If you don't see the use of it, I certainly won't let you clear it away. Go away and think.
> Then, when you can come back and tell me that you do see the use of it, I may allow you to
> destroy it."

Chapter "The Drift from Domesticity". Chesterton wrote the parable; **"Chesterton's Fence" is
a later label, not his phrase.**

## Feynman, Caltech commencement, 1974 ✅

> "They're doing everything right. The form is perfect. It looks exactly the way it looked
> before. But it doesn't work. No airplanes land."

> "The first principle is that you must not fool yourself — and you are the easiest person to
> fool."

https://calteches.library.caltech.edu/51/2/CargoCult.htm — Copying a CI gate you saw in
another repo is the perfect form with no airplanes. Show the failure it would have caught
*here*. ("Cargo cult programming" is a later derivative with no single author; cite Feynman.)

## Morozov, *To Save Everything, Click Here*, 2013 ✅

Solutionism recasts complex situations as "neatly defined problems with definite, computable
solutions". His sharper point: the causation runs backwards — new infrastructure makes
certain solutions possible, and *then* we redefine things as problems because doing so "seems
natural and inevitable".

https://www.publicbooks.org/the-folly-of-technological-solutionism-an-interview-with-evgeny-morozov/
— That your capability makes a proposal easy is not evidence the problem exists.

## Gall, *Systemantics*, 1975 ⚠️

> "A complex system that works is invariably found to have evolved from a simple system that
> worked. A complex system designed from scratch never works and cannot be patched up to make
> it work."

https://en.wikiquote.org/wiki/John_Gall — sourcing metadata verified, not the physical book.

## Hickey, *Simple Made Easy*, 2011 ⚠️

> "We can only hope to make reliable those things we can understand."

https://www.infoq.com/presentations/Simple-Made-Easy/ (transcript is community-maintained) —
Adding a mechanism whose behaviour you cannot explain makes the system less reliable, even
when the mechanism is itself a safety mechanism.

---

## Attributions that circulate wrongly — do not repeat these

- ❌ **"In God we trust, all others bring data" is not Deming.** First documented use: Edwin R.
  Fisher, testifying to a U.S. House subcommittee, 7 September 1978 — and he already called it
  a well-recognised cliché. The Deming link appears years later with no support, probably
  contaminated by a variant printed unattributed in Mary Walton's 1986 book.
  https://quoteinvestigator.com/2017/12/29/god-data/ — Cite it as anonymous or not at all.
- ❌ **YAGNI was not coined by Ron Jeffries.** Fowler credits Kent Beck. Jeffries wrote the
  1998 article and the sibling line about never implementing what you merely foresee — a
  different contribution.
- ⚠️ **KISS: "popularised by" Kelly Johnson, not "coined by".** A "Keep it Short and Simple"
  variant is attested in the Minneapolis Star in 1938, two decades before Johnson.
- ⚠️ **Ohno's Five Whys** — universally attributed to *Toyota Production System* (1978), but
  every rendering found is secondary. Cite the book; claim no page.
- ⚠️ **Kent Beck, "make the change easy, then make the easy change"** (tweet, 25 Sep 2012) —
  real and widely cited, but x.com blocks retrieval. Present as widely cited, not verified.
- ❌ **"A solution in search of a problem" / "no problem is the problem"** have no traceable
  author. Use Morozov's solutionism, which has a book, a date, and his own words.
