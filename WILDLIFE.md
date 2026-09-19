# WILDLIFE — improvement plan

Status: **planned** (2026-07-21). Code facts below verified against `ruined-city.src.html` as of commit `fffc4b1`.
Method follows the judgement cycle: item → evidence → fix → headless capture proof.

## Current inventory (all code-verified)

| System | N | Home | Active | Behaviour | Player-aware |
|---|---|---|---|---|---|
| Deer adults | 7 | west meadow (x −124…−94) | dayF > 0.35 | graze / stand / walk, leg swing | ✗ |
| Deer fawns | 2 | follow mother | same | follow `a.target`, radius 3 | ✗ |
| Foxes | 2 | city streets | dayF < 0.55 | **fixed 11/9-waypoint loop**, bounding gait, den rest | ✗ |
| Rabbits | 2 | west meadow | dayF > 0.35 | freeze / hop, 12 u radius from home | ✗ |
| Squirrels | 2 | two fixed trees | dayF > 0.3 | climb / sit / dash at trunk base | ✗ |
| Stray cat | 1 | night streets | dayF < 0.5 | **fixed 11-waypoint loop**, glow eye strip | ✗ |
| Crows | 4 | city ellipses | **always** | fixed elliptical loops | ✗ |
| Starlings | 3 | low ellipses | **always — fly at night ✗** | fast darts | ✗ |
| Hawk | 1 | r 70, h 44 | dayF > 0.35 | slow glide (sleeps at night ✓) | ✗ |
| Bats | 4 | night loops | dayF < 0.4 | loops | ✗ |
| Fireflies | 70 pts | meadow + city pockets | summer night only ✓ | per-fly flicker | ✗ |
| Butterflies | 3 | meadow flowers | dayF > 0.4 — **no season gate ✗** | small fixed ellipses | ✗ |
| Bees | 2 | meadow flowers | same ✗ | fast small ellipses | ✗ |
| Tumbleweed | 1 | z = 0 avenue | always | rolls, bounces, wraps | ✗ |
| Snow footprints | 2 trails | meadow + avenue | snow only | static decals | n/a |

## The verdict

The **visuals** are solid (16 systems, day/night gating, season gates where they exist,
leg/tail/flap animation). The gap is **behaviour**: the wildlife is a diorama, not a living world.
Nothing in the city notices the wanderer exists — the title feature of the piece is wandering *through*
something that ignores you.

Priority order: **awareness > loop-breaking > ecology bugs > set-pieces > ambience**.
No new species — population is fine; behaviour per animal is not.

---

## T1 — Player awareness (the headline feature)

**Evidence:** no animal update function references `camera.position`; deer graze calmly 4 m from
the camera; the cat walks past you on rails.

**Fix** (one shared helper, ~150 lines):

- `playerDist(a)` = horizontal distance camera → animal group.
- **Deer** — two new states:
  - `alert` (dist < 14): stop, head up (headT → 0.1), ears back, 0.4 s reaction delay (real deer don't startle
    instantly); whole herd shares one alert trigger (a herd alerts together).
  - `flee` (dist < 9): sprint 4.5 u/s away from player, fawn follow-weight tightens (3 → 1.2 u),
    after 6–10 s and dist > 25 → `stand`, then back to graze. Herd cohesion: adults stay within 30 u of the
    herd centroid (currently they can scatter 40 u apart and the "herd" stops reading as a herd).
- **Rabbits** — extend existing `freeze`: player < 10 → freeze extended, ears rotate back (0.35), head still
  (kill the head sway); player < 5 → bolt at hop speed × 1.8 directly away, reset `x0/z0` home to the landing
  point (they move house after a spook — real rabbits do this).
- **Fox** — `stare` state: while trotting, player < 18 → halt, head locked to player (yaw + pitch), 1.5–4 s
  (the classic "it's looking at you"). Then: player < 8 → flee to next-next waypoint at full speed; else resume.
- **Cat** — player < 12 → head locked; if the player walks toward it, jump `wi` ahead by 2–3 waypoints
  (a cat will not be cornered).
- **Squirrels** — player < 8 of either tree → force `dash` state.

**Verify:** `__RC_CAM__`-style CDP eval: set camera beside the herd, advance sim 1–2 s, read
`window._deer` states → expect `alert`/`flee` + position delta away from camera. Screenshot pair:
calm vs spooked. Same for fox stare (aim the camera at the fox, capture the mid-stare frame).

## T2 — Loop breaking

**Evidence:** foxes (11/9 waypoints) and the cat (11 waypoints) run rigid loops; watch 3 minutes and it's
obvious. Birds fly fixed ellipses forever.

**Fix (cheap):**

- Fox/cat: per-waypoint `±3 u` jitter (reseeded each lap), random dwell 0–8 s at waypoints, occasional
  waypoint skip (10 %), per-individual route re-shuffled when the loop restarts.
- Birds: slow per-bird sinusoid on `rx/rz/h` (period 90–180 s, amplitude ±15 %) so the "loop" is a drifting
  figure rather than a circle.
- Pollinators: already jittery enough — leave.

**Verify:** position trace of a fox over a 3-min headless sim (sample every 10 s, assert no repeat of
consecutive-segment direction pairs).

## T3 — Ecology bugs (found in the survey)

1. **Starlings fly at night** — `updateBirds` scales only the hawk to 0. Starlings roost: scale → 0 when
   `dayF < 0.4` (they should be in eaves by then; simplest correct answer).
2. **Crows promise a perch, never deliver** — comment says "crows (loop + perch)", no perch code exists.
   Add: one crow perches on the church spire tip (~13, 27, 7 — spire top) or the Anchor antenna; perched crow
   takes off every 80–140 s, loops once, another crow takes the perch (swap). This is a signature shot —
   the `church`/`anchorA` presets exist exactly for this.
3. **Snow trail says "deer, meadow into town"** but deer bounds stop at x −88 and they never enter town.
   Fix the story, not the herd: re-route trail 1 to the southern meadow edge, or let one deer (the lead)
   occasionally walk the south meadow strip toward town (x −88…−60, z 20–40, no buildings there per
   CLEAR_ZONES check) and back.
4. **Butterflies/bees have no season gate** — `setAnimalScale(p, dt, dayF > 0.4 ? 1 : 0)`; they fly in winter.
   Gate on `season === 1` (summer) like the fireflies already do.
5. **Bats at 4** — fine, leave.

**Verify:** night shot → no starlings; `church` preset at noon → perched crow on spire, close-up capture;
winter + day shot → no butterflies; snow shot → trail 1 consistent with actual deer range.

## T4 — The hunt (set piece)

**Evidence:** intro copy promises "foxes hunt after dark". Nothing hunts: fox and rabbit overlap at dusk
(dayF 0.35–0.55 — real overlap exists) but never interact.

**Fix (scripted encounter, ~60 lines):** when a fox within 10 u of a rabbit, in the overlap window, rabbit
not already frozen:
- rabbit → `freeze` (ears back),
- fox halts, head to rabbit, 1.2 s,
- then 60 %: fox dashes (rabbit bolts the other way at × 1.8, escape), 40 %: fox peels off (turns away, resumes),
- cooldown 200 s city-wide so it stays a moment, not a loop.

This is the single best 10-second sequence the piece can offer — the "the city is a wild place" beat.

**Verify:** CDP: force fox + rabbit positions + dayF 0.45, advance sim, assert state sequence + capture the
stare frame with `__RC_CAM__`.

## T5 — Season & weather sensitivity

**Fix (cheap gates, variables all exist):**

- **Winter:** rabbit 2 of 2 hides (scale 0); deer graze probability down (thin in winter), scale 0.95.
- **Autumn:** deer walk probability up (restlessness — the migration feel).
- **Rain (wx.rain > 0.5):** deer graze → stand; fox skips the trot (stays at den); cat stays off the streets
  (scale 0 in storms).
- Fireflies summer-only ✓ already correct.

**Verify:** `#season=winter&wx=storm` headless captures; assert `_foxes[0].state` stays `den` in storm.

## T6 — Night eye-shine (cheap presence)

Deer + fox + rabbit heads: two 0.03 u emissive dots, `emissiveIntensity = (1 − dayF) × clamp(1 − dist/15)`.
The cat already has the glow strip. Classic "two points of light in the dark" detail for the night shots.

**Verify:** night meadow close-up capture.

## T7 — Audio proximity (optional, last)

Ambient engine already has `birdChirp()`. Add distance-gated: crow caw (rough 2.5 kHz saw burst + decay)
when any crow < 50 u of the player; deer rustle (filtered noise burst) on flee; rabbit thump (low sine
thud × 3) on bolt. Reuses the existing procedural-audio pattern.

**Verify:** audio-only, listen once in-browser; no headless capture possible — mark verified-by-hearing.

---

## Out of scope (deliberate)

- New species — 16 systems is plenty; behaviour > population.
- Pathfinding / building avoidance — `groundH` snapping at these speeds is sufficient.
- Collisions / physics between animals.

## Batching

- **Batch 1** (one build + verify pass): T1 + T2 + T3 + T5 + T6 — the "living world" batch.
- **Batch 2**: T4 — the set piece, isolated build + capture.
- **Batch 3** (optional): T7 — audio.

Each batch ends with: `node build-standalone.mjs`, zero console errors, CDP capture proof per item,
JUDGEMENT-style resolution log appended here, commit, push.
