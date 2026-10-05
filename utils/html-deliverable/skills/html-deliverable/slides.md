# Slides: the thesis pattern

Read when the user asks for slides, a presentation or a deck.


A projected slide gets the same two seconds a feed post gets: nobody reads it, it has to
land at a glance. So when the user asks for slides, a presentation or a deck, every slide
follows the **thesis pattern** (taken from giant-type social carousels, rebuilt on the
polished theme base, never their social-media look):

1. **One sentence that concludes**, ≤ 12 words, lowercase, weight 600, tracking
   `-0.04em`, line-height ~1. One phrase inside it in the accent (`<b>` recolored, same
   weight). Never a label ("Results", "Spend").
2. **The proof sits beside it or on the next slide**: the bars, the chart, the big
   number, the table. Useful information is never cut; it is split into claim → proof.
   Layout: 16:9, `container-type: inline-size`, sizes in `cqw`; split slides at ~1.15fr /
   1fr with the claim at ~5.2cqw; the opening slide has the claim alone at ~8.4cqw,
   max-width 15ch.
3. **Optional aside in parentheses** under the claim, muted and light: the human voice.
4. **The source goes in the slide footer**, small mono, beside the slide number.
5. **Say each fact once**: if the claim carries "66%", the big number beside it shows
   something else (the minutes, the runs).

Out: background photos, whole sentences in yellow/orange, decorative underlines, slides
with two claims.

**Documents (everything that is not slides):** only the page `h1` becomes the thesis
sentence with one accent phrase. Section titles stay short labels ("What's missing",
"What exists"): they are wayfinding and pill-nav entries, and a reader who already opened
the page does not need to be stopped at each section.

**Expiry clause.** The pattern works because it is rare: once everyone communicates the
same way, it stops working. If decks start to look all the same, revisit this section
instead of applying it harder.
