# receipts — "Green means nothing"

**A slide show for a general audience, from the user's point of view.**

Open `index.html` in a browser. Arrow keys, space, or click. `f` for
fullscreen. The videos are inline — no network needed.

## What it is for

Casey's fleet has spent weeks finding out that the things which *say* they
work often do not: a CI badge with zero jobs behind it, a test corpus
checking a stale copy of the code, a package that installs cleanly and
then throws. **None of this is interesting to an engineer who already knows.**
It is very interesting to everyone else, and to anyone who has ever shipped
at 2am on the strength of a green tick.

So this deck is the *user's* version. It is organised around three
questions a normal person has:

1. **What would make you believe a badge?** → *a receipt you can re-derive*
2. **How do you know a test is real?** → *break it and watch the number move*
3. **What do you do when the answer is unclear?** → *say "undecided"*

## The shape of it

| slides | beat | video |
|---|---|---|
| 1–3 | you, at 2am, believing things | — |
| 4–6 | **the green light that was never connected** | `videos/green-light.mp4` |
| 7–9 | **131,499 boxes nobody opened** | `videos/boxes.mp4` |
| 10–12 | break it, and watch the number move | **a live animation** (see below) |
| 13–15 | the judge and the die; asking twice | — |
| 16–18 | what you get; the two questions | `videos/superinstance-intro.mp4` |

**The two generated videos sit on the two hardest ideas** — an empty badge,
and a corpus testing a copy — because those are the ones a diagram cannot
carry.

**The third one is an animation, and it is better than a video.** "Break it
and watch the number move" is *literally* a number moving, so slide 10
builds it live in the browser: a grid of 131,499 mutations, red where the
suite caught the break, and — one in seventeen — a mutation that was
**missed**, which is the point of the slide. The MiniMax token plan hit its
credit limit partway through, so rather than ship a black rectangle at the
exact moment the audience is supposed to be paying attention, the third
beat is the real thing: a number that goes up and down.

## Every number in the deck is measured

| slide | claim | where it came from |
|---|---|---|
| 1 | "182 tests" | `SuperInstance/AI-Writings` `AGENTS.md` — exactly right, and the 182 could not run |
| 5 | four ways a badge goes green | the CI-bypass census, 2,318 workflow files |
| 8 | 131,499 mutations; 14,611 phantom disagreements; the real code never exercised | the mutation corpus, after the copy was replaced by the real port |
| 11 | 28/250 → 250/250 caught | same run, before and after |
| 13 | the judge picked the first option 9/9; a poisoned note dragged 0.99 → 0.60 | `SuperInstance/jev-lab` |
| 14 | UNDECIDED 6/6; AGREE 5/5 | `SuperInstance/arbiter` |
| 16 | 455 versions, 131 bad entry points, 5,298 repos, 161 unfailable steps | the three censuses, in `SuperInstance/gitpp-reading-room` |

**If a number here is wrong, it is wrong in the open, with a link.** That is
the point of the deck as much as its content.

## The videos

- `green-light.mp4`, `boxes.mp4` — generated with MiniMax
  (`MiniMax-Hailuo-02`), prompted for visuals that carry the idea without
  any text, because a video model asked to render words renders them badly.
  The third prompt (`break-move`) is **in `video_jobs.json` and ready** — it
  just could not be submitted, because the MiniMax token plan hit its credit
  limit (`status_code 2056`) partway through the run. `python3 -m
  videos.mkvid` will pick it up when there is credit.
- `superinstance-intro.mp4` — Casey Mezzoforte's original, from
  `SuperInstance/AI-Writings/videos/`.

Regenerate the three with:

```bash
python3 -m videos.mkvid          # needs MINIMAX_KEY and credit
```

**Note:** `api.minimax.chat` REJECTS the key (`status_code 2049, "invalid
api key"`). The working host is **`api.minimax.io`**. That cost one
misdirected request.

## Presenting it

The deck is written to be *told*, not read — the longest slide is four
lines. Two suggested beats:

- **Slide 5** is where the room laughs: "the corpus was empty and the
  comparison agreed, perfectly, about nothing."
- **Slide 14** is where the room goes quiet: asking twice, and being
  willing to say "undecided."
