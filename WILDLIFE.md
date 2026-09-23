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

## Resolution log — Batch 1 (T1 + T2 + T3 + T5 + T6)

Built, verified headless (Chrome CDP, `#time/#day/#wx/#cam` params), zero console errors on every run.

| Item | Evidence |
|---|---|
| T1 deer | cam 8 u from deer0 → 3 flee, 4 alert (herd radius 30 u works), distant deer keeps grazing. Head rot: graze 1.06 vs alert/flee 0.08–0.13 (head up). `w_deer_flee4.png` |
| T1 deer direction | first build fled *toward* the player (faceYaw sign). Fixed: flee dir = `faceYaw + π`. Re-verified: movement vector now opposite the cam (`w_deer_flee4.png`, t0 vs post) |
| T1 fox | cam 10.6 u at dusk → state `stare`, stationary (pos unchanged over 3 s), head locked (headY 0), eye 0.58. `w_fox_stare.png` |
| T1 fox bolt | now picks farthest of next-4 waypoints instead of `wi+2` (could run toward the player) |
| T1 rabbit | cam 4.5 u → freeze → bolt; moved 9.4 u **away** (same faceYaw bug as deer, fixed with `+ π`). Ears flattened in `w_rab_bolt.png` |
| T1 cat / squirrels | head-lock + route jump / dash wired; verified in code paths (cat hidden at 13 h by schedule) |
| T2 fox loop | jitter + dwell + skip in `updateFox`; loop still terminates (wp advance on arrival) |
| T3 starlings | `#time=23`: all 3 starlings `visible:false` (roost), hawk hidden, 4 crows airborne |
| T3 isHawk bug | `b.speed < 0.1` caught the two **negative-speed crows** (−0.17/−0.27) → they vanished at night since forever. Fixed: `b === hawk`. `w_night2.png` |
| T3 spire perch | `perch.transit` 0→1 (2.5 s ease), bird pos lands **exactly** on the broken shard (−57.2, 26.9, 43.4); perch swaps 80–140 s (observed bird 0 → 3 → 1 across runs). `w_spire6.png` — crow silhouette on the tip |
| T5 winter | `#day=3`: rabbit[1] scale→0.01 hidden, all deer scale 0.95, pollinators hidden. `w_winter.png` (bare trees, dusted ground) |
| T5 storm | `#wx=storm` 20 h: both foxes `den`, cat hidden. Deer graze→stand at timer expiry (gradual, intended). `w_storm.png` |
| T5 pollinators | summer-only gate: all 5 hidden in spring (`w_base.png` run, `pollinators:[false×5]`) |
| T6 eye-shine | state: `emissiveIntensity` 0.53–0.76 on fleeing deer at 19.45 h, 0 by day. Visually ~1–2 px at 1280 px — state is the right proof level; effect is a close-range human-viewer detail |
| T7 audio | deferred to Batch 3 |

Notes:

- Headless sim runs < real time (dt clamp 0.05 + software GL); state dumps are authoritative, wall-clock waits are generous.
- `DAY_ANIMALS/NIGHT_ANIMALS/ALWAYS_ANIMALS` arrays are legacy dead code (pushed, never read) — left as-is.
- Firefly season gate was already correct (`dayF<0.35 && season===1`); probe initially misread `.visible` (gate is material opacity).

## Resolution log — Batch 2 (T4)

Built, verified headless (Chrome CDP, `#time=18.73` → sim lands in the dayF 0.35–0.55 dusk
overlap window at pre-shot time), zero console errors on every run.

| Item | Evidence |
|---|---|
| T4 trigger | natural fire: hunt.t forced 0, fox trotting 7.2 u from hopping rabbit → next frame `phase 1`, outcome `dash` picked by the 60/40 roll, fox `state 'hunt'`, rabbit `freeze`. Guards confirmed: trigger requires fox `trot` + rabbit `hop` + scale ≥ 0.5 + dist < 10 + dayF 0.35–0.55 + rain < 0.5 |
| T4 stare | fox halts in place (pos fixed at (−98, 24) across the 1.2 s phase), body rotates onto the rabbit (yaw lerp), rabbit frozen with ears laid back. Both animals in frame at dusk — `h_stare2.png` |
| T4 dash 60% | fox chases at 6.5 u/s re-aiming each frame; rabbit bolts at 10.4 u/s (1.8 × its 5.8 bolt) straight away from the fox. Mid-chase: fox (−102.1, 21.3), rabbit (−110.6, 15.8), gap 7.2 → 10.1 u and widening — the fox **just misses**, as designed. `h_dash.png` |
| T4 peel 40% | fox yaw 0.85 ≈ target 0.98 (turn *away* from the rabbit, not toward), rabbit stays frozen ears-back the whole time. `h_peel.png` |
| T4 release | after the sequence: `phase 0`, cooldown ≈ 199 (200 s city-wide), hunt refs nulled, fox back to `trot` resuming its jittered route, rabbit settles `freeze` at its **new home** (x0/z0 = final pos, moved 19 u SW), final gap 19 u — clean escape |
| T4 ownership | `hunt.fox`/`hunt.rab` guards in `updateFox`/`updateRabbits` — the hunted pair is excluded from T1 (player stare/freeze) for the ~4 s commitment; eye-shine line still runs for the fox |

Notes:

- Headless dt runs ~0.25× wall clock (rAF + software GL): the 3.6 s sequence takes ~15 wall s; state dumps timed accordingly.
- The dusk window is short in sim time (dayF 0.35–0.55 ≈ h 18.76–19.00 ≈ 14 sim min ≈ 3.5 wall min at 4-min days) — with a 200 s cooldown and 2 foxes × 2 rabbits the hunt stays a rare "the city is a wild place" moment, not a loop.
- `window._hunt` exposed for CDP (consistent with `_deer`/`_perch` debug hooks).

## Resolution log — Batch 3 (T7 — proximity audio)

Built and verified headless (Chrome CDP + WebAudio analyser tap, `--autoplay-policy=
no-user-gesture-required`, 48 kHz), zero console errors on every run.

Design: three distance-gated one-shots reusing the `birdChirp()` pattern (transient
nodes → master gain, zero assets). Volume is distance-scaled at the call site,
same `clamp01(1 - d/R)` model as the water bed.

| Item | Evidence |
|---|---|
| T7 rabbit thump (synth) | `rabbitThump(0.4)` direct call: peak **0.232** vs wind baseline 0.07 (3.3×), decays to baseline by +300 ms (labfinal envelope). Per-pulse taps prove all 3 pulses fire (0.116 / 0.239 ≈ expected 0.328 / 0.256, phase-attenuated) |
| T7 rabbit thump (natural) | camera parked 4.5 u from hopping rabbit 1 → bolt at +0.1 s → thump spikes **0.355 @ +0.1 s, 0.240 @ +0.2 s** — first spike exactly equals the computed volume `clamp01(1 − 4.5/40) × 0.4 = 0.355`. Rabbit moved home 8.3 u after the bolt (`x0/z0` updated). `thumpT` cooldown visible decaying (−0.05 at run end) |
| T7 crow caw (synth) | `crowCaw(0.25)` direct call: peak **0.153** vs baseline 0.07 (2.2×), 2.5 kHz saw through bandpass Q 2.5, 2–3 bursts at 170–250 ms spacing. Scheduled from `updateAudio` on a 4–11 s timer, nearest airborne crow within 50 u, probability 0.35→1.0 with distance, skipped when rain ≥ 0.6 |
| T7 deer rustle (synth) | `deerRustle(0.2)` direct call: peak **0.095** vs baseline 0.07 (1.4×) — deliberately the quietest: flee trigger is < 9 u, so this is background texture, not an event. Bandpass noise 1.4–2.2 kHz, 350–600 ms, two-shuffle envelope |
| T7 hunt thump | the T4 dash transition (`phase 1→2`, outcome `dash`) fires the thump with `clamp01(1 − hpd/45) × 0.45` — the set piece keeps its ears when the player watches from up to 45 u away. No cooldown (the 200 s hunt gate is sufficient) |
| T7 herd anti-stinger | deer flee rustle gated `Math.random() < 0.4` + 1.5 s per-deer cooldown — a 7-deer panic reads as 2–3 rustles, not a machine-gunning |
| T7 bug caught | `a.thumpT <= 0` / `a.rustleT <= 0` with the fields **undefined** on first use: `undefined <= 0` is false → the first bolt/flee of every animal would have been silent. Fixed with `(a.thumpT \|\| 0) <= 0`. The direct-call lab test cannot see this (bypasses the gate) — the natural trigger test caught it |
| T7 decay check | silence window after all one-shots: 0.056–0.067 = wind baseline — no leaking nodes |

Notes:

- Headless WebAudio renders **~250 ms behind the JS clock**; a 1024-sample (2.7 ms) analyser window under-measures 80 Hz pulses by up to 4×. All measurements use a 16384-sample (343 ms) window + dense 100 ms reads, taking the max over the burst.
- `__audio.energy` getter (small window) added for quick checks; the 343 ms tap is probe-side.
- Mute (`#mute` / 🔊) and the autoplay gesture gate are inherited — the one-shots no-op when `!audio || muted`.
- Verified-by-hearing: open `ruined-city.html` in a real browser, click once (unlocks audio), walk toward the meadow at dusk. Expected: crow caws from the sky, deer rustle when the herd bolts, three rabbit thumps when one bolts (louder if you watch the hunt).

---

# Round 2 — the herd has somewhere to be

Operator ask: *"look into animals again — could we make their behavior more
interesting/realistic? Migrating herds, even?"*

The Round 1 deer were reactive but place-bound: hard-coded pen at `x[-130,-88]`,
`|z| ≤ 60`, cohesion = steer at random toward the centroid. Reactive, not
ecological. The change: **the herd owns a seasonal route, and the pen is gone.**

## T8 — Seasonal migration

One home range per season (`index === season`), each picked off the real map for
the reason a real herd picks it. Coordinates verified against terrain, water and
reserved lots, not guessed:

| Season | Range | Centre | r | Why there |
|---|---|---|---|---|
| Spring | the west meadow | `(-115, 20)` | 30 | calving cover, current spawn, low ground, sightlines break early |
| Summer | the north fairground | `(-38, -118)` | 36 | open grazing directly against the ferris wheel — the herd under the wheel |
| Autumn | the oak pasture | `(-150, -20)` | 34 | mast + browse under scattered oaks |
| Winter | the city lee | `(-95, 55)` | 26 | a **deer yard** in the wind-shadow of the ruins; flat, sheltered, feedline of rubble-adjacent grass |

Winter-in-the-ruins is the payoff: it makes the old "deer graze the old fields"
narrative literally true on the same tiles the city is ruined on, and it is a
place you can walk up to and find them at.

### Mechanism

- **Crepuscular travel.** `herdTravel()` only advances the centre when `dayF` is
  in 0.18–0.82 and `wx.rain < 0.6`. Otherwise the herd beds up and the walk
  waits. That single gate is what makes a migration take a couple of days instead
  of snapping when the season flips.
- **Settle time.** `HERD.rest` (45 s on arrival, 15 s on load) blocks the next
  departure, so the herd actually *lives* in a range rather than instantly
  leaving it.
- **Centre → animals.** `rangePull()` is zero inside 70% of the radius and ramps
  outside it; `out` (past the hard edge) turns a bedded deer into a walking one,
  and a deer that ends a flee outside the range walks home instead of stopping in
  the open.
- **On the move the herd lengthens its stride:** walk speed × 1.5 while
  `HERD.moving`.
- **Boids over the adults** (`herdFlock`): separation 2.7 u, neighbour radius
  13 u, cohesion + alignment. This is what sells "a herd" rather than N animals
  near each other. Fawns still follow their dam, and flee overrides everything.
- **Water is a wall.** Every step is validated against `groundH` before it is
  taken (`dryDir` for heading, explicit `> WATER_Y + 0.5` check on the move), so
  neither migration nor a panic can walk a deer into the cove.

Full annual circuit ≈ **440 m** of centre travel; the longest single leg (fairground
→ oak pasture) is 158 m.

## Verification

Headless CDP (`tools/cdp.mjs`, raw WebSocket, no deps). Deterministic: `__RC_HERD__.fastForward()`
drives `updateDeer` at a fixed `dt`, so a whole season walk runs in ~1 s.

`tools/probes/migrate.js`, one full cycle, every range checked at +120/+320/+560 sim-s:

| Check | Result |
|---|---|
| Reaches each of the 4 ranges | `idx` matches target every time: `(-83,-37) → (-38,-118)`, `(-94,-69) → (-150,-20)`, `(-106,40) → (-95,55)`, back to `(-115,20)` |
| Herd stays together | max animal-to-centre distance **15–32 m** across the whole cycle, never exceeds the range radius |
| `outside=` (animals past the hard edge) | **0** at every sample |
| `wet=` (animals on submerged ground) | **0** at every sample |
| Separation (min pair distance) | **2.77–3.93 m** — no animal standing inside another (Round 1 could overlap) |
| Cost | `updateDeer` = **0.022 ms/frame** median (5 runs, 2000 frames each, 9 animals) = **0.13% of a 60 fps frame** |
| Console | clean, no exceptions, on every shot and probe |

## Bugs caught in Round 2

All four of these were invisible without the fast-forward probe — watching at wall
speed in a software-rendered page tells you nothing.

1. **The test itself lied first.** Headless sim time runs ~10× slower than wall
   clock, so the 15 s settle never elapsed and `moving` stayed false — it looked
   like the feature was dead. Fixed by exposing `__RC_HERD__.fastForward(simSeconds, dt)`
   and testing on the sim clock, not the wall clock.
2. **Straight-line forever.** Direction was only computed at the *start* of a
   walk (fine when a pen wall stopped them; with the pen removed the deer held the
   line and reached **2.6 km** from home and kept going). Fixed: adults re-steer
   every frame in the walk state.
3. **Wet deer.** One animal finished the autumn leg standing under water —
   `dryDir` chose headings but the position update never validated the step.
   Fixed with a pre-move ground check that turns instead of stepping in.
4. **Load straight into winter.** The herd is *built* in the spring meadow. Load
   the page with `#day=3` and the range is the city lee, but there is no season
   flip to pull anyone, so the whole herd stood in the wrong field. Caught only by
   screenshotting the winter load (the probe's own init masked it). Fixed by
   translating the herd with its range once at init, layout intact.

## Files

- `ruined-city.src.html` — `HERD_RANGES`, `HERD`, `angTo`, `dryDir`, `herdFlock`, `rangePull`, `herdDir`, `herdTravel`, `__RC_HERD__`
- `tools/cdp.mjs` — CDP harness (`eval` / `shot`, setup + probe scripts)
- `tools/probes/migrate.js` — full-cycle migration proof
- `tools/probes/deer_cost.js` — isolated per-frame cost
- `tools/probes/warp_and_frame.js` — warp to a season (or mid-migration with `&to=`) and frame the live herd
- `tools/probes/tarn_site.js` — ranked candidate basins for the pond (flatness, approach slope, distance from ruins)
- `tools/probes/track_test.js` — prime / water / migration / recolour / cost for the live track pool
- `tools/probes/track_census.js` — reads the instance buffers back and sorts prints by animal and region
- `tools/probes/frame_track.js` — stands the camera in the trail, looking down the line


## Batch 5 — water, and the record the animals leave

The migration exposed two holes: the herd had nowhere to drink that was not the sea,
and nothing on the ground remembered any of it.

### The tarn (-122, 52)

A shallow kettle pond on the west side, between the spring meadow and the city's
north-west edge. The site was picked by `tools/probes/tarn_site.js`, which ranked
candidate basins on flatness, approach slope, and distance from roads and ruins.

- `TARN = { x: -122, z: 52, r: 15, bank: 5.5 }`
- `tarnRadius(a)` wobbles the shore with three harmonics (±17 / ±9 / ±5 %) so it
  never reads as a circle at a glance
- `tarnEdge(x, z)` is the single signed distance used by **both** the terrain carve
  and the water ribbon — the shoreline cannot drift out of step with the water
- carve: bowl to ~2.2 m, banks blended over 5.5 m into natural ground
- reeds and cattails at the margin; shore stones pushed up the bank, because a
  stone sitting at the waterline and seen from a shallow angle looks like it is
  floating on the pond

### Geese that actually migrate

`gooseHomeFor(s)` puts the flock at the tarn in spring and summer, and at the
north-west bay of the southern lake in autumn and winter. `gooseSlot(k, ...)` lays
out the V (leader first, then alternating ranks 3.2 m back and 2.4 m out).

Measured, deterministic (`__RC_GEESE__.depart()` + `fastForward`):

| Check | Result |
|---|---|
| Tarn → lake (autumn) | 32 s at 8.6 m/s, cruise 32 m |
| Lake → tarn (spring) | 33 s |
| Wedge, cross-axis | 2.4 / 4.8 / 7.2 / 9.6 m — exact |
| Wedge, back axis | runs 1–3 m long through a turn, converges straight |

The back axis stretching in a turn is what a real V does: the outside birds are
covering more ground than the point.

### Live tracks

One `InstancedMesh`, 9000 prints, one draw call. The ground now keeps a record of
where the wildlife actually went.

- `stampPrint / stampStep(x, z, dir, kind)` — paired prints per stride; kinds:
  deer `0.16×0.29`, fox `0.11×0.16`, goose `0.30×0.46`
- `trackWalk(animal, kind, stride)` back-projects each pair onto the step actually
  taken, so a hitching frame cannot smear the trail to the far side of the stride
- **what gets written**: deer only in `walk`/`flee` (1.7 m migrating, 2.6 m
  spooked), fox while trotting (1.15 m), geese only when on land (2.4 m).
  Grazing never prints — a field pitted with prints reads as panic, not pasture
- **nothing writes into water**: prints below `WATER_Y + 0.25` are dropped
- `trackSurf()` = snow or one of three dry-season earths. When the surface changes
  the whole live pool is repainted, because a track in snow is not a track in dust
- `primeCorridors()` wears the network in before you arrive: a line between each
  pair of seasonal ranges, relaxed six times and pushed out of the city on each
  pass — the way a path mines the cheapest line and bends around what will not be
  crossed
- `renderOrder = 2`, above the ground-snow overlay at 1, or the snow paints the
  tracks back out again; `depthWrite: false` + polygon offset so the prints sit on
  the terrain instead of fighting it

### Tuning (three passes, all driven by screenshots)

The first version worked and looked wrong. What moved it:

| | v1 | final | why |
|---|---|---|---|
| Deer print | `0.16×0.29` | `0.10×0.24` | at 16 cm wide the pair merged into one slab |
| Pair offset | `0.22` | `0.19` | separated enough to read as two hooves |
| Thickness | `0.030` | `0.008` | a 3 cm lip is what made them look like laid tile |
| Spacing | 1.35 m | ~0.74 m | sparse prints read as scattered debris, not a trail |
| Winter hue | `0x8b9aab` | `0xc6d0da` | high contrast against snow = objects, not depressions |
| Rotation | exact | ±0.11 rad jitter | a perfectly symmetric trail never happens |

Judged from standing height (`h=1.7`, 6 m behind the nearest print). Face-level
framing (`h=1.3`, 2 m back) makes a 24 cm print fill a fifth of the frame and
look like a paving slab — a probe artifact, not a scene bug.

Pool: 9000 prints ≈ 10 minutes of continuous migration before the ring buffer
starts overwriting the oldest prints. Long enough to follow a trail across the map;
deliberately not permanent, or every session would end with the ground paved.

| Check (`tools/probes/track_test.js`) | Result |
|---|---|
| Primed prints at load | 617 |
| Prints under the waterline | 0 |
| Live prints after 180 s of migration | 2610 |
| Recolour on season change | brown → pale blue-grey, yes |
| 60 s of herd sim, tracks off / on | 90.9 ms / 76.6 ms (delta inside noise) |
| Deer prints inside the city | 3 — the tail of the winter corridor, i.e. the deer yard in the ruins' wind-shadow, as intended |

### Bugs caught in Round 3

1. **TDZ on `B`.** `const B = (a,b,c) => new THREE.BoxGeometry(...)` is declared at
   line 5531; the track block at 5390 used `B(1,1,1)` and killed the page at boot
   with `Cannot access 'B' before initialization`. Use the constructor directly in
   code that lives above it.
2. **The API object escaped its block.** `window.__RC_TRACKS__ = { mesh, ... }` sat
   *outside* the `{}` that declares `mesh`, so a module-scope `mesh` shadow picked
   up the wrong thing and the property came back `undefined`. `mesh: TRACK.mesh`
   instead.
3. **The harness could not say why the page was dead.** It waits on
   `__RC_READY__` and reported only a timeout. `Runtime.exceptionThrown` was
   already being collected — now the failure message includes it, which is how (1)
   was found in one run instead of five.
4. **The probe tried to set a module-scoped `let`.** `season = 3` in a CDP eval
   writes a *global*, not the module binding, and silently does nothing. Use the
   exposed `setSeason()`.
