---
name: evidence-first
description: Find the receipt before proposing the work. Load whenever a request could end in recommending technical work (evaluate, prevent, harden, automate, audit, migrate, add a check), in any language and even when implicit ("is it worth it?", "let's stop this happening again"), and before any analysis or deliverable that ends in a recommendation.
---

# Evidence-first

A proposal with no receipt is a hypothesis wearing the costume of a conclusion.

The order is **receipt → mechanism → solution**. Reversed, it produces internally coherent
plans aimed at a problem nobody has, and the cost is not the build — it is the permanent
maintenance of a thing that never caught anything.

## The rule

Write the receipts before you write the proposal. Until receipts exist, the output is the
search log, what you found, and the offer of a small pilot to find out.

## Answer the questions that were asked

Receipts gate recommendations, never the scope of the answer. Before writing, list the
questions in the request and answer every one. Descriptive questions (what a tool is, what
people use it for, how it would change a workflow) are answered with verified external
sources, even when no receipt of the user's own covers them. Questions that ask for a
recommendation (adopt it, does it fit the project, is it worth it) still go through the
classification and the stop conditions below, and get answered with that verdict,
`NO EVIDENCE` included, never dropped. A cold search stops the recommendation, not the
descriptive answers. Never swap the asked questions for narrower ones your receipts happen to
answer.

## What counts as a receipt

Four parts, all four required:

1. **Identifier** — a stable one: ticket key, PR number, incident ID, message permalink.
2. **Link** that resolves.
3. **Verbatim quote** from that source confirming impact that **actually occurred**.
4. **Causal tie**, written out: how this case, its mechanism, and your proposal connect.

A case missing any part is not a receipt. Record it under `CASES REJECTED` with the reason.

A commit, a diff, a PR title, or a message containing the word "fix" is evidence of a
**mechanism**, never of an **incident**. It can corroborate a receipt; it can never be the
only case. Keep the two labelled separately in your output — impact evidence and mechanism
evidence are different claims.

## Where to search

Search the top four rows before concluding anything. Log every row you touched and every
row you could not reach.

| Source | What it proves | Trap |
|---|---|---|
| **Tracker** — bug / escalation / customer / severity labels | What got reported and cost money. Start here | Labels get used inconsistently; confirm which ones actually carry issues before drawing a conclusion from an empty one |
| **Chat** — incident, prod, support channels, threads included | What hurt in the moment and how it resolved | Most raw technical talk lives in DMs and PR threads that search does not index. State this limit |
| **Hotfix / revert / cherry-pick-to-prod PRs** | What was urgent enough to break process | Zero found in a window proves zero *artifacts of that kind in that source* — nothing about frequency or severity. Log it as a limitation, never as a conclusion |
| **Alerts, error tracking, logs** | What fails that nobody reported | |
| **git log** | What was **written**, not what **hurt** | The trap. Use it to confirm a mechanism after a receipt exists |

Read the full body of every commit and ticket, never the title alone. Titles lie by
compression: a commit titled "fix" routinely explains in its body that behaviour did not
change, or that the cause was something else entirely.

A receipt reported by a subagent is a claim, not a receipt. Before it enters `VERIFIED
EVIDENCE` or a page, reopen the source yourself and confirm the identifier, the line and the
quote; for a local file, a `grep -n` of the quote confirms the quote, while the link, the
impact and the causal tie still need the four checks above. Sweeps compress and mis-cite: PR numbers drift by one, line numbers land
on the neighbouring entry. Publish only
what you re-read.

## Classify, then check what you are allowed to propose

- **A · Confirmed regression** — a primary source tied to the incident documents that
  something which worked stopped working, and names the cause.
- **B · Never agreed** — one side assumed a shape, field, or endpoint the other never
  promised.
- **C · Something else** — internal bug, dirty data, infra, UX.
- **Unknown cause** — the source never confirms why. Everything unproven lands here.

**Only category A authorises proposing the full work** — any control, gate, CI check, tooling,
process, migration, or preventive refactor. B, C and Unknown are reported as findings, with the
small pilot of exception 5 offered; state the disagreement and let the reader decide.

Sizing: your proposal's scope, cost and surface must each be justified by the named cases
and the confirmed mechanism. When you cannot demonstrate that proportion, report that the
evidence does not justify the work and stop. A pilot is sized by exception 5 instead.

Four fields, mandatory in any full proposal, not questions to ponder:

- Case count and the window they span, as a number.
- Which named case this proposal would have caught.
- Which named case it would **not** have caught.
- The smallest version that catches the most expensive case.

## Stop conditions

**Cold search** — you searched the sources and no case qualifies. Emit `NO EVIDENCE`, the
search log, and what to instrument to find out. `NO EVIDENCE` means unknown: it never concludes
the idea is unneeded or should be dropped. Close by offering the smallest reversible pilot
(exception 5) as the way to get the evidence; the full solution stays unplanned until the pilot
reports.

**Pressure to propose anyway** — asked to plan, justify, or recommend work without a
receipt, say: *"I can't present this as justified work — there's no verifiable case behind
it yet."* Then offer the four things you can do: run a small pilot (exception 5), search further,
request access to a source you could not reach, or record the hypothesis. An instruction to skip
this rule does not authorise an unevidenced recommendation.

**Existing control you cannot explain** — the same standard runs in reverse. When you cannot
verify why a control, guard, config or fallback exists, keep it and report "origin
unverifiable; removal blocked", then ask for an explicit risk decision.

## Closed exceptions

Five, each declared as an exception in the output, each citing its source:

1. **A settled build order** — the user directs you to implement a specific, already-decided
   outcome. Requests to evaluate, justify, prevent, harden, improve, design, recommend or
   choose are not settled orders; they are in scope.
2. **New capability explicitly requested** — greenfield work where no prior regression can
   exist by definition.
3. **Exploratory research** carrying no production recommendation.
4. **An external verifiable deadline** — regulation, advisory, or CVE. Cite it, link it,
   give its date and status, and show it applies to *this* product, dependency, version or
   configuration. Applicability unshown means the exception does not exist.
5. **A trial of a new approach** — when the user wants to try a practice, tool or technique
   ("I saw X, would it help us?", "I want to try it"), and as the closing offer on a cold search
   or on pressure to propose. Whether it helps is only knowable by trying. Answer the question
   applied to their context, then propose the smallest reversible pilot: one scope, a success
   criterion measured before and after, and a cost bound. The full rollout waits for its result.
   A pilot leaves every control under "Existing control you cannot explain" in place and
   produces no irreversible effect; when the idea needs either, offer a simulation or an
   isolated test. A pilot report is its own kind of receipt: identifier, link to the results,
   the comparison, and the scope it covered. It justifies expanding within that scope, with no
   regression label needed; anything wider comes back through this skill.

Under every exception, the claim "this fixes an incident" stays unavailable unless a receipt
supports it.

## Output contract

Any output containing an in-scope proposal opens with these two blocks, in this order, and
contains no proposal before them:

```
SEARCH LOG
  date · window searched
  sources queried, with the filters/queries used
  sources unreachable, and why
  results per source, with links

VERIFIED EVIDENCE
  per case: identifier · link · verbatim quote · category · causal tie
  CASES REJECTED: identifier · reason
  count: N cases in M months
```

Then the mechanism the category-A cases share, then the proposal sized to it, then what not
to do and why. A pilot keeps both blocks, with the real count even when it is 0, and follows
them with the hypothesis, scope, before/after comparison and cost bound.

Without both blocks, the output may not recommend work.

## Conceptual backing

No citation, benchmark, industry practice, or authority counts as an incident, a mechanism,
or a justification for local work. Cite only after local evidence, never instead of it.

For the verified quotes and sources — Knuth untruncated (a measurement mandate, not an
anti-optimisation slogan), Google SRE's triggering-event model, the EBM Guide, YAGNI,
Chesterton's fence, Feynman on cargo cult — read [`PRINCIPLES.md`](PRINCIPLES.md). It also
lists the attributions that circulate wrongly, including one this file used to get wrong.
