# LIIBRA DARK — Boss Demo

Browser RPG built with Phaser 3. Dark fantasy, 90s aesthetic.

---

## Project Structure

```
liibra-dark/
├── index.html
├── package.json
└── src/
    ├── main.js                        # Entry point, Phaser config
    ├── scenes/
    │   └── GameScene.js               # Main orchestrator
    ├── entities/
    │   ├── Player.js                  # Movement, input, animation
    │   ├── Boss.js                    # Graphics + draw logic
    │   ├── BossAI.js                  # State machine (idle/charge/orbs/sweep/enrage)
    │   ├── ProjectileManager.js       # Red + blue orbs, player slashes
    │   ├── ParticleSystem.js          # Particle pool
    │   └── HUD.js                     # All UI bars and overlays
    └── utils/
        └── constants.js               # All magic numbers in one place
```

---

## Setup

```bash
npm install
npm run dev       # http://localhost:5173/dark/
npm run build     # outputs to /dist — deploy to liibra.com.br/dark
```

---

## Controls

| Key          | Action                             |
|--------------|------------------------------------|
| WASD / Arrows | Move                              |
| SPACE        | Attack / Reflect orb               |

---

## Blue Orb Mechanic

1. Boss fires **red orbs**
2. Hit a red orb with SPACE → it turns **blue** and chases the boss for 5 seconds
3. Blue orb hitting the boss → **4 damage** (more than direct slash)
4. UI shows a timer bar per active blue orb

---

## Bugs Fixed (vs original single-file version)

| # | Bug | Fix |
|---|-----|-----|
| 1 | Duplicate `}` in `updateUI()` — syntax error | Removed extra brace |
| 2 | 5 unused timers (`bossPhaseTimer` etc.) | Removed |
| 3 | Unused boss fields (`eye`, `tentacles`, `speed`, `angle`) | Removed |
| 4 | `playerHi` color declared but never used | Removed |
| 5 | `b.angle` incremented but never applied to container | Removed |
| 6 | `spread/(n-1)` division by zero when `n=1` | Fixed with `t = n > 1 ? i/(n-1) : 0.5` |
| 7 | Boss attacks on frame 1 (timer starts at 0) | Initial timer set to `1.5s` |
| 8 | Array mutated while iterating in `checkCollisions` | Deferred removal queue pattern |
| 9 | Boss flicker used player's `invincible` counter | Boss has own `hitFlash` timer |
| 10 | Blue orb bar overlapped boss HP on small viewports | Depth/position corrected |

---

## Next Steps

- [ ] Add more boss attack patterns (laser sweep, teleport)
- [ ] Player character selection (from `criar-personagem.html`)
- [ ] Room/dungeon system
- [ ] Sound effects with Phaser AudioManager
- [ ] Mobile touch controls overlay
