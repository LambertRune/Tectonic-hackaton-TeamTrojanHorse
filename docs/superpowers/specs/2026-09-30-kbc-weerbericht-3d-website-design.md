# KBC Weerbericht 3D website: design

Pitch landing page for the KBC Weerbericht concept (Tectonic hackathon, Team Trojan Horse).
Techniques borrowed from phiosk.be (fixed WebGL canvas, Blender `world.glb`, scroll stations,
HTML anchored to 3D points). Look follows the KBC app dark theme.

## Concept: "De maand van Lotte als landschap"

- Balance = height. October is a row of 29 day pillars. Pillar height = Lotte's balance that day,
  computed with the same `forecast()` rules as the app (ported to `website/src/forecast.js`).
- Sea level = EUR 0. Dark water plane. When the path dips under it, water and pillars turn red.
- Weather above each day (sun, cloud, rain, thunder, storm, rainbow), same rules as the app.
- Storm: euro coins fall like rain.
- Lighthouse = Kate as guardian. Scene 5 (Jos, code rood): beam turns red.
- Floating 3D phone shows real app screenshots, swapped per section.
- Paper plane flies toward a small Lisbon island; progress follows the savings goal.
- TV weather broadcast layer: "LIVE" bug and a bottom ticker with the forecast.
- A small cloud follows the pointer.

## Sections (scroll stations, camera flies between them)

1. Hero: "Jouw geld heeft een weerbericht."
2. Probleem: money apps show the past; Lotte wants to know tomorrow.
3. Hoe het werkt: balance = height, 0 = sea level, weather = what a day costs.
4. Scene 1 Zonnig: EUR 24 free per day.
5. Scene 2 Uitgaan: thunder, then rainbow; Kate reshuffles the week (push + chat).
6. Scene 3 Gsm: storm on 10/10, path sinks under water from 27/10. Kate offers to postpone.
7. Scene 4 Lissabon: EUR 25 each Friday, plane flies.
8. Scene 5 Code rood: Jos (74), EUR 2.450 fraud blocked, lighthouse red, Els notified.
9. Probeer zelf: three toggles rebuild the landscape live.
10. Team + disclaimer.

## Stack

`website/`: Vite, three.js, GSAP + ScrollTrigger, Lenis. Static build.
Blender scene `KBC_Website` exports `website/public/models/world.glb` (props only; pillars are
instanced in three.js from the forecast data).

## Quality bar

- Dark KBC tokens (#111315, #1A9FE4, Nunito Sans).
- `prefers-reduced-motion`: no camera flight, static layout, content always visible.
- Mobile: phone-width layout, lower pixel ratio, fewer particles.
- Content never hidden if WebGL fails (fallback class after timeout).
- Disclaimer: concept mockup, no official KBC app, fictional people and amounts.
