# Campus Life Architect

**Campus Life Architect** is a browser-based school management + student life simulation game. You build and operate a school as its principal/founder, then switch into **Life Sim** mode and directly control one admitted student.

V0.1 is a static **HTML + CSS + JavaScript** release designed to run without a backend and publish directly through **GitHub Pages**.

## V0.1 gameplay

- Create a school by choosing its type, ownership, curriculum, starting location, and difficulty.
- Build on a **40×30 tile campus** with floor, walls, doors, paths, objects, and room presets.
- Complete room requirements so an incomplete room becomes functional.
- Admit both **day students** and **boarding students**.
- Generate staff applicants and hire school staff.
- Edit the school timetable; overlapping periods are rejected.
- Watch students and staff receive schedule destinations and move with A* pathfinding.
- Use **Management Mode** for construction and administration or **Life Sim Mode** to control one student.
- Track student Energy, Hunger, Stress, and Mood; use nearby interactions such as Eat, Study, Sit, Talk, and Inspect.
- Run a basic daily finance loop for tuition/funding, salaries, and boarding costs.
- Save to three local browser slots with IndexedDB and resume a saved school from the title screen.
- Export and import compatible student characters as JSON files.

The approved long-term design also covers deeper academics, social relationships, discipline, clubs, health, staff careers, family life, and expansion from the initial small town into a larger city. Those systems are intentionally beyond the V0.1 playable slice.

## Controls

| Input | Action |
| --- | --- |
| WASD / Arrow keys | Move the active student in Life Sim |
| Shift + movement | Move faster |
| Left click | Build in Management Mode / click-to-move in Life Sim |
| E | Use the first available nearby interaction |
| Right click | Open nearby interaction choices |
| Esc | Pause the simulation |
| Pause / 1× / 2× / 4× / 8× | Change simulation speed from the HUD |

## Run locally

No build step is required. From the repository root:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/` in a modern browser.

Opening `index.html` directly with `file://` is not recommended because browser ES-module security rules can block module loading.

## Tests

The automated suite uses Node's built-in test runner and has no npm package dependencies:

```bash
npm test
```

The release checklist is in [`docs/manual-smoke-test.md`](docs/manual-smoke-test.md).

## Save data

Save slots are stored in the browser's **IndexedDB** database named `school-life-sim`. Save data is local to that browser/profile and is not uploaded to a server. The most recently used slot is remembered through `localStorage` so **Continue saved school** can resume it from the title screen.

Character sharing uses versioned JSON (`school-life-character`, version 1). Unsupported or malformed character files are rejected rather than replacing the current game state.

## GitHub Pages

A Pages workflow is included at `.github/workflows/pages.yml` and deploys the repository as a static site after a push to the `main` branch (or a manual workflow run).

All runtime assets use relative URLs, so the game can load from a repository subpath such as:

```text
https://USERNAME.github.io/REPOSITORY/
```

In GitHub, enable **Settings → Pages → Source: GitHub Actions** if Pages is not already configured that way.

## Project structure

```text
index.html
styles.css
src/
  academics/     timetable and schedule intent
  build/         construction and room validation
  core/          game state, events, simulation clock
  data/          curricula, rooms, names, staff roles
  entities/      students, staff, NPC movement
  life/          player input and interactions
  management/    finance loop
  save/          save codecs, IndexedDB, character sharing
  ui/            title screen, HUD, management panels
  world/         tile map, A* pathfinding, canvas renderer
tests/            automated logic tests
docs/             approved design, plan, and smoke checklist
```

## Current limitations

V0.1 is a foundation release. It does not yet simulate the full expandable town, enterable family homes, advanced clubs, deep social relationships, full discipline cases, detailed staff careers, graduation/alumni progression, or every curriculum-specific rule described in the long-term design. The current art is intentionally functional and lightweight so the simulation systems can be tested before a larger visual asset pass.
