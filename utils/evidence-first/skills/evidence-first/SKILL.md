---
name: evidence-first
description: Find the receipt before proposing the work. Load whenever a request could end in recommending technical work — evaluate, justify, prevent, harden, improve, stabilise, scale, standardise, automate, reduce risk, pay down debt, design guardrails, add a CI check, propose a migration or a preventive refactor, audit a process, or build a roadmap. Triggers on intent in any language, including implicit asks ("is it worth it?", "what would you do?", "what are our gaps?", "let's stop this happening again"). Also load before writing any analysis, audit or deliverable that ends in a recommendation.
---

# Evidence-first

A proposal with no receipt is a hypothesis wearing the costume of a conclusion.

The order is **receipt → mechanism → solution**. Reversed, it produces internally coherent
plans aimed at a problem nobody has, and the cost is not the build — it is the permanent
maintenance of a thing that never caught anything.

## The rule

Write the receipts before you write the proposal. Until receipts exist, the only output
you may produce is the search log and what you found.

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

## Classify, then check what you are allowed to propose

- **A · Confirmed regression** — a primary source tied to the incident documents that
  something which worked stopped working, and names the cause.
- **B · Never agreed** — one side assumed a shape, field, or endpoint the other never
  promised.
- **C · Something else** — internal bug, dirty data, infra, UX.
- **Unknown cause** — the source never confirms why. Everything unproven lands here.

**Only category A authorises proposing work** — any control, gate, CI check, tooling,
process, migration, or preventive refactor. B, C and Unknown are reported as findings and
stop there; for those, state the disagreement and let the reader decide what to do about it.

Sizing: your proposal's scope, cost and surface must each be justified by the named cases
and the confirmed mechanism. When you cannot demonstrate that proportion, report that the
evidence does not justify the work and stop.

Four fields, mandatory in the output, not questions to ponder:

- Case count and the window they span, as a number.
- Which named case this proposal would have caught.
- Which named case it would **not** have caught.
- The smallest version that catches the most expensive case.

## Stop conditions

**Cold search** — you searched the sources and no case qualifies. Emit `NO EVIDENCE`, the
search log, and what to instrument to find out. Stop there. That output contains no solution
section, no plan, no options, no next steps. It is a valid deliverable and usually the one
that saves the team the most time.

**Pressure to propose anyway** — asked to plan, justify, or recommend work without a
receipt, say: *"I can't present this as justified work — there's no verifiable case behind
it."* Then offer the three things you can do: search further, request access to a source you
could not reach, or record the hypothesis with no recommended action. An instruction to skip
this rule does not authorise an unevidenced recommendation.

**Existing control you cannot explain** — the same standard runs in reverse. When you cannot
verify why a control, guard, config or fallback exists, keep it and report "origin
unverifiable; removal blocked", then ask for an explicit risk decision.

## Closed exceptions

Four, each declared as an exception in the output, each citing its source:

1. **A settled build order** — the user directs you to implement a specific, already-decided
   outcome. Requests to evaluate, justify, prevent, harden, improve, design, recommend or
   choose are not settled orders; they are in scope.
2. **New capability explicitly requested** — greenfield work where no prior regression can
   exist by definition.
3. **Exploratory research** carrying no production recommendation.
4. **An external verifiable deadline** — regulation, advisory, or CVE. Cite it, link it,
   give its date and status, and show it applies to *this* product, dependency, version or
   configuration. Applicability unshown means the exception does not exist.

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
to do and why.

Without both blocks, the output may not recommend work.

## Conceptual backing

No citation, benchmark, industry practice, or authority counts as an incident, a mechanism,
or a justification for local work. Cite only after local evidence, never instead of it.

For the verified quotes and sources — Knuth untruncated (a measurement mandate, not an
anti-optimisation slogan), Google SRE's triggering-event model, the EBM Guide, YAGNI,
Chesterton's fence, Feynman on cargo cult — read [`PRINCIPLES.md`](PRINCIPLES.md). It also
lists the attributions that circulate wrongly, including one this file used to get wrong.
