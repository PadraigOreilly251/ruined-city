# Design Judgement — The Ruined City

Date: 2026-07-19. Method: 13 headless Chromium captures across cameras (hero/aerial/river/lake/tower/street/meadow),
times (09:13 / 11:13 / 13:16 / 18:52 / 20:13 / 22:13 / 23:47 / 00:14) and all six weathers, plus a line-level audit of
`ruined-city.src.html`. Shots in `/tmp/rc5/` (spring, golden, dusk, night, streetnight, aerial, river, lake, tower,
fog, meadowspring, winter2, rain, storm, wrap).

Scale: score out of 10. 8+ = keep as is, 6–7.9 = improve, <6 = rework.

---

## 1. Sky & day/night — **8.5**
System: 9-keyframe canvas gradient (top/mid/horizon + sun/moon/amb/hemi/fog per key, `SKY_KEYS` line 1984),
sun/moon glow, overcast gray + snow wash overlays, star layer, fog color tracks sky.
**Good:** keyframes include warm dawn (6.3, horizon `#e8a868`) and dusk (18.6, `#f0a050`); overcast/storm/snow
all read distinctly; night sky with stars and moon glow is calm.
**Issue:** the golden window is ~1.6 in-game hours (~4 real min) and the *light* on the city never goes warm —
sun intensity falls 0.60→0.05 across 18.6→20.2 while the hemisphere stays cool, so at 18:52 the sky is pink
but the city is already purple-cool (see `golden.png`). The city never catches the golden hour.
**Fix (small):** hold the warm key longer (18.6 → ~19.7) and keep `sunI` ≥ 0.45 through the warm span; optionally
warm the hemi light 10–15% in the 18–20 band.

## 2. Buildings — **7.5**
System: 6 concrete tones (`#9a9184…#736d63`) + per-seed HSL jitter + light lerp (`concColor`, line 251); stepped
collapsed rooflines, rebar, moss, ivy, roof trees; ~90 buildings.
**Good:** palette variety reads well at every distance; ruined roof detail (missing quadrants, slanted slabs,
rebar) is the scene's signature and it earns it.
**Issues:**
- *Flat skyline.* Almost all buildings are 3–9 storeys; the aerial (`aerial.png`) shows a uniform roofline with
  only the clock tower breaking it. No 10–14-storey anchor towers, so the city has no vertical hierarchy.
- *Uniform window rhythm.* Regular dark window rows on most facades; a few facades get one row only. Fine per
  building, monotonous across 90 of them.
- *Clock face too small.* The face is four 1.6-unit quadrant quads on the belfry (line ~659) with 0.07-unit hands —
  unreadable at street distance; the big 10×10×15 shaft has no face at all.
**Fixes (small–med):** 1–3 tall anchor towers (one half-collapsed, concrete core exposed) in the dense center;
a large face (≈4×4) with ticks + hands on the shaft's north side, belfry quads kept as accent; give ~20% of
buildings an irregular window grid (offset rows, missing windows).

## 3. Trees & forest — **7**
System: `tree()` — twin tapered trunk boxes + 4–9 leaf-box cluster (`LEAF_G`, 5 greens, line 260); seasonal
palette eases over 40s; winter turns brown.
**Good:** the voxel-canopy style is charming; seasonal eases (spring→summer→autumn rust→winter brown) verified
in captures; roof trees sell "nature reclaimed".
**Issues:** every tree shares one silhouette (wide cluster on a stump). From aerial/river distance the forest
band is a uniform dotted texture; winter forests are brown dots — no bare/dead trees, no tall conifers, no
dead-branch variation.
**Fix (small):** add a conifer type (stacked shrinking leaf boxes, dark green) at ~30% of forest trees, and a
dead-tree type (bare trunk + 2–3 branch stubs, gray-brown, leafless year-round) at ~15%. Both are pure `cells`
work; register the conifer/dead sets in `seasonFoliage` appropriately (dead = static).

## 4. Roads — **8**
System: grid + avenue, asphalt darkens when wet, dashed centerlines, crosswalks, sidewalk bands.
**Good:** reads cleanly day/night; wet darkening + rain streaks make the wet state feel real (see `rain.png`);
tram line with moving tram is a nice moving detail.
**Issue (minor):** uniform road width everywhere; the grid is a touch regular — one street could be a
one-way with parked cars on a single side, or a slightly wider boulevard, to break rhythm. Low priority.

## 5. Landmarks — **8.5**
Lighthouse (banded rust rings, gallery, rust dome — `lake.png` is the best single shot in the scene), clock tower,
church w/ broken spire, town hall (columns + waving flag), water tower, radio tower, Ferris wheel (rust red —
pops in aerial), gas station, school with dead playground, boat graveyard in the lake.
**Issues:**
- The broken church spire reads as a plain dark chimney stub from distance (top of `tower.png`); no jagged
  rebar/tile shards.
- Lighthouse is excellent but the water around it (see §6) undermines the shot.
**Fix (small):** 3–4 thin dark shards (rz-tilted) crowning the spire; optionally a few bent rebar loops at its
midpoint.

## 6. Water — **6.5** ← biggest gap
System: one flat `MeshLambertMaterial` plane (opacity 0.72, color lerps with night); per-row vertex ripples (two
sine waves, amp 0.05/0.04) + 26 drifting foam streaks with flicker — present all along, just too subtle to see in
stills (my initial 5.5 judged from screenshots, corrected after code audit).
**Issues (confirmed in `river.png`, `lake.png`):** ripple amplitude too small to register at distance — the water
still reads flat; no specular life (sun/moon glint); hard straight shoreline against the ground; zero reflection;
boats float like stickers.
**Fixes (med):**
- *Stronger ripples:* raise amplitude ~20% and add a slow third swell term (period ~14s, amp 0.035) so the water
  surface visibly undulates at distance.
- *Sun/moon glint:* small additive-blended discs on the river and lake, opacity flickering with `dayF`/`nightF`,
  warm by day / blue by night — sells light on the water.
- *Shoreline:* jitter the shoreline edge by a few voxel steps instead of a straight line (the lake edge is a
  hard straight cut in `lake.png`). — deferred (lake edge is the map boundary; far-hill ring, §12, is the cleaner fix).

## 7. Weather & atmosphere — **8.5**
Six states; layered distance fog (`Fog(0xd8d2ba, 90, 480)` + fogF multiplier); storm with lightning flashes;
per-drop rain variance; snow with accumulation/footprints.
**Good:** the fog shot (`fog.png`) is genuinely atmospheric — depth layering, distant towers ghosting in,
sky gradient staying soft. Storm darkening + slanted rain reads well.
**Issues (minor):** base fog is a bit heavy for the "fog" state — the whole distant city disappears (`fog.png`
09:13); softening `fogF` ~15–20% would keep depth readable. Cloud blocks are flat pale boxes — acceptable in
day, slightly cartoonish at night (visible in `dusk.png`); could tint clouds with the sky mid color at night.

## 8. Wildlife — **8**
Deer (west meadow), foxes (nocturnal, city), rabbits, crows wheeling/perching, hawk, starlings, trams.
**Good:** proportions read right at scale (meadow shot); the deer + flowers + big meadow trees composition is
the emotional core of the intro copy and the scene delivers it; foxes only after dark is a lovely touch.
**Issue (minor):** nothing to fix functionally; if tree silhouettes get variety (§3), the forest the deer live
in gains life for free.

## 9. Props & detail — **7**
Streetlamps with ground light pools (the night street shot is strong), traffic lights, rusted parked cars,
signs, gas pumps, benches, mushrooms, flowers.
**Issues:**
- *Bush size:* the instanced bushes (line ~1800) allow flat variants up to ≈3.4×1×1.9 — the meadow's dominant
  "vegetation" is a big green box (`meadowspring.png` bottom right). It reads as a toy block, not a shrub.
  **Fix (small):** cap flat-variant size at ~2.0 wide and/or stack two offset boxes for a lumpy silhouette.
- *Fallen logs:* 0.34×0.34 cross-section (line 1972) reads as a thin pole at distance. **Fix (small):**
  bump to 0.5–0.7, add a darker end cap.
- *Night readability:* bright green bush/grass boxes read as alien blocks against the black facades
  (`streetnight.png`). Acceptable, but a slightly desaturated night variant of the bush palette (lerp toward
  gray by `nightF*0.3`) would settle it.

## 10. HUD / UI — **8.5**
Serif title + intro (top-left), `time · weather · season` pill (top-right), controls pill (bottom-center),
sound toggle.
**Good:** type and pills match the mood; season in the pill (this session) is a clean addition.
**Issue:** at night the dark serif text over the dark sky loses contrast (top-left block in `night.png` is
barely legible). **Fix (small):** tint HUD text by `dayF` (light at day, warm-gray at night) or add a faint
translucent backing plate behind the title block.

## 11. Camera & composition — **7.5**
Seven named cameras + free orbit/walk; hero intro view.
**Good:** named cams are good tour stops; hero composition is solid.
**Issues (minor):** the idle intro is a static frame — a very slow camera drift (subtle orbit sway, ±2° over
~30s, disabled as soon as the user drags) would make the first 10 seconds cinematic. The aerial cam's fixed
high angle is fine.

## 12. Map edge / horizon — **7**
No backdrop wall by design ("only a city lost in the hills").
**Issue:** the terrain edge is visible as a pale cliff band at the horizon in `lake.png` (the ridge ends flat).
Fog mostly hides it, but on clear days looking east you can see the map boundary.
**Fix (small):** a ring of darker, lower far-hills just inside the edge, or a gentle extra-fog band at range —
keeps the no-backdrop philosophy while hiding the cut.

---

## Priority list (impact ÷ effort)

| # | Item | Effort | Impact |
|---|------|--------|--------|
| 1 | Water: stronger ripples + sun/moon glints | small | high |
| 2 | Clock face: large shaft face with ticks + hands | small | high |
| 3 | Bush size cap + lumpy shape | small | med |
| 4 | Warm dusk held longer, warm light on city | small | med |
| 5 | HUD night contrast | small | med |
| 6 | Conifer + dead-tree silhouettes | small | med |
| 7 | 1–3 tall anchor towers (one half-collapsed) | med | med |
| 8 | Broken spire shards | small | small |
| 9 | Log thickness + end caps | small | small |
| 10 | Fog state softened ~15–20% | small | small |
| 11 | Idle cinematic camera drift | small | small |
| 12 | Map-edge far-hill ring | small | small |

Top 4 items are the real wins; items 1–2 together would change how the two best shots (lake, tower) look.
Nothing here is a rework — the scene's design (palette, ruined detail, weather depth, wildlife staging) holds
up; the gaps are in *water motion*, *vertical hierarchy*, and *one too-small detail* (clock).

---

## Round 2 — resolution log (all items implemented)

| # | Item | Done | Evidence (headless capture) |
|---|------|------|------------------------------|
| 1 | Water: ripples +20%, third swell (14 s), sun/moon glints | ✓ | `v_lake.png` — glint disc on the lake |
| 2 | Clock face: big north-shaft dial, ticks, hands at 4:17 | ✓ | `v_face4.png` — reads as a real clock at street level |
| 3 | Bush cap 3.4 → 1.7 wide + lumpy top box | ✓ | `v_meadow2.png` |
| 4 | Golden hour held to 19.7, sun floor 0.78 | ✓ | `v_golden2.png` — amber key on city at 19:28 |
| 5 | HUD night contrast (cream text + dark halo past 0.45 night) | ✓ | `v_night_hud.png` — title fully legible at 21:09 |
| 6 | Forest silhouette mix: ~62% broadleaf / ~22% conifer / ~16% dead | ✓ | `v_forest.png` — 3-tier pines + bare leaning grey trunks distinct |
| 7 | Spire shards: 4 chunks at the break + 3 slabs leaning the walls | ✓ | `v_spire3.png` / `v_spire4.png` — clean break, no z-fight |
| 8 | Logs 0.34 → 0.5–0.72 diameter | ✓ | code |
| 9 | Fog base 90/480 → 78/408 (−15%) | ✓ | `v_horizon.png` — horizon ridge reads through clear-day air |
| 10 | Far-hill ring (28 peaks past the map edge, r 330–440) | ✓ | `v_horizon.png` — terrain cliff gone from the horizon |

Also exposed: `window.__RC_CAM__` (camera + OrbitControls) so the headless harness can
aim the camera at any landmark (`rc5.mjs <url> <out> <wait> "<script>"`).

New presets: `church`, `forest`, `horizon`.

## Round 3 — anchor towers (item 7) + window-side fix

| # | Item | Done | Evidence (headless capture) |
|---|------|------|------------------------------|
| 7 | Three anchor towers breaking the flat 3–9-storey skyline | ✓ | `t_aerial.png` — all three read from the aerial; `t_anchorA2.png` — 14-storey "The Anchor" (60,60): stepped 11+3 storeys, chipped corner, leaning antenna, full window grid; `t_anchorB4.png` — (-20,-20): 11 storeys sheared to a stair-step (7 full + 6×12 + 4.5×7 fragments, tilted last slab, dark cut-floor shadow, rebar along the shear, slab fallen against the shear face, tree on the cut floor, rubble field); `t_anchorA2.png` right — (20,60): 9 storeys + stair core, 4×4 hole in the roof with tree through it |
| — | **Found en route:** window quads were FrontSide-only, so every south & west facade in the city rendered blank | ✓ | both window materials (dark + lit) now `DoubleSide`; `t_hero2.png` — south/west faces carry window grids, no z-fighting |

Notes:
- Towers sit on reserved lots (CLEAR_ZONES r15 at the block centres (60,60), (−20,−20), (20,60)) so the
  procedural `ruin()` loop and lot trees stay off them; `BLOCKS` entries keep vegetation out of the footprints.
- Heights: A ≈ 43 m + 4.6 m antenna, B ≈ 31 m, C ≈ 28 m + 3.2 m core vs. the usual 9–28 m — clear vertical
  hierarchy; A's ~13% lit-window share glows at night (`t_night.png`).
- Snow caps on all surviving roofs follow the existing `snowCells` system.
- New presets: `anchorA`, `anchorB`.
