// ═══════════════════════════════════════════════════
//  ParticleSystem.js
// ═══════════════════════════════════════════════════

import { C, DEPTH } from '../utils/constants.js';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.pool = [];
  }

  spawn(x, y, color, life) {
    const gfx = this.scene.add.graphics();
    gfx.fillStyle(color, 1);
    gfx.fillCircle(0, 0, Phaser.Math.Between(2, 5));
    gfx.setPosition(x, y).setDepth(DEPTH.PARTICLE);

    this.pool.push({
      gfx, x, y,
      vx: (Math.random() - 0.5) * 180,
      vy: (Math.random() - 0.5) * 180 - 40,
      life,
      maxLife: life,
    });
  }

  spawnBurst(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
      this.spawn(x, y, color, 0.3 + Math.random() * 0.3);
    }
  }

  spawnDelayed(x, y, color, count, spreadRadius, baseLife) {
    for (let i = 0; i < count; i++) {
      this.scene.time.delayedCall(i * 40, () => {
        this.spawn(
          x + Phaser.Math.Between(-spreadRadius, spreadRadius),
          y + Phaser.Math.Between(-spreadRadius, spreadRadius),
          color, baseLife
        );
      });
    }
  }

  update(dt) {
    const dead = [];

    for (const p of this.pool) {
      p.x  += p.vx * dt;
      p.y  += p.vy * dt;
      p.vy += 200 * dt;  // gravity
      p.life -= dt;

      p.gfx.setPosition(p.x, p.y);
      p.gfx.setAlpha(Math.max(0, p.life / p.maxLife));

      if (p.life <= 0) dead.push(p);
    }

    for (const p of dead) {
      p.gfx.destroy();
      this.pool.splice(this.pool.indexOf(p), 1);
    }
  }

  destroyAll() {
    this.pool.forEach(p => p.gfx.destroy());
    this.pool = [];
  }
}
