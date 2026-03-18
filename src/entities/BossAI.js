// ═══════════════════════════════════════════════════
//  BossAI.js — State machine for Vel'Zar
//  States: idle | charge | orbs | sweep | enrage
// ═══════════════════════════════════════════════════

import { W, H, BOSS, CHARGE, ORB, SWEEP, C } from '../utils/constants.js';

export class BossAI {
  constructor(scene, boss) {
    this.scene = scene;
    this.boss = boss;

    this.state = 'idle';
    this.timer = 1.5;     // initial delay before first action
    this.phase = 1;

    this.homeX = boss.x;
    this.homeY = boss.y;
    this.chargeTarget = null;
  }

  update(dt, player, spawnOrbFn, spawnParticleFn, spawnEnrageParticlesFn) {
    const b = this.boss;
    this.timer -= dt;

    // ── PHASE TRANSITION ──
    if (this.phase === 1 && b.hp <= b.maxHp * BOSS.ENRAGE_PCT) {
      this.phase = 2;
      this.state = 'enrage';
      this.timer = 1.8;
      this.scene.cameras.main.shake(400, 0.015);
      spawnEnrageParticlesFn();
      return;
    }

    switch (this.state) {

      case 'idle': {
        // drift back to home position
        const dx = this.homeX - b.x;
        const dy = this.homeY - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 4) {
          b.x += (dx / dist) * 40 * dt;
          b.y += (dy / dist) * 40 * dt;
        }

        if (this.timer <= 0) {
          this._pickAction(player, spawnOrbFn, spawnParticleFn);
        }
        break;
      }

      case 'charge': {
        if (!this.chargeTarget) {
          this._goIdle(1);
          break;
        }
        const tx = this.chargeTarget.x;
        const ty = this.chargeTarget.y;
        const dx = tx - b.x;
        const dy = ty - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = this.phase === 2 ? CHARGE.SPEED_P2 : CHARGE.SPEED_P1;

        if (dist > 8) {
          b.x += (dx / dist) * speed * dt;
          b.y += (dy / dist) * speed * dt;
          if (Math.random() < 0.3) {
            spawnParticleFn(
              b.x + Phaser.Math.Between(-10, 10),
              b.y + Phaser.Math.Between(-10, 10),
              C.particle, 0.3
            );
          }
        } else {
          // reached target — update home, go idle
          this.homeX = b.x;
          this.homeY = b.y;
          this._goIdle(this.phase === 2 ? CHARGE.IDLE_AFTER_P2 : CHARGE.IDLE_AFTER_P1);
        }
        break;
      }

      case 'orbs':
      case 'sweep': {
        if (this.timer <= 0) {
          this._goIdle(this.phase === 2 ? 0.5 : 1.2);
        }
        break;
      }

      case 'enrage': {
        if (this.timer <= 0) {
          this._goIdle(0.5);
          this.homeX = W - 130;
          this.homeY = H / 2;
        }
        break;
      }
    }
  }

  // ── PRIVATE ──

  _pickAction(player, spawnOrbFn, spawnParticleFn) {
    const roll = Math.random();
    if (roll < 0.35) {
      this._enterCharge(player, spawnParticleFn);
    } else if (roll < 0.70) {
      this._enterOrbs(spawnOrbFn);
    } else {
      this._enterSweep(player, spawnOrbFn);
    }
  }

  _enterCharge(player, spawnParticleFn) {
    this.state = 'charge';
    this.timer = 2;
    this.chargeTarget = {
      x: Phaser.Math.Clamp(player.x + (Math.random() - 0.5) * CHARGE.JITTER, 30, W - 30),
      y: Phaser.Math.Clamp(player.y + (Math.random() - 0.5) * CHARGE.JITTER, 30, H - 30),
    };
    spawnParticleFn(this.boss.x, this.boss.y, C.bossEye, 0.5);
  }

  _enterOrbs(spawnOrbFn) {
    this.state = 'orbs';
    this.timer = 0.5;
    const count = this.phase === 2 ? ORB.COUNT_P2 : ORB.COUNT_P1;
    const step = (Math.PI * 2) / count;
    const offset = Math.random() * Math.PI;
    const speed = this.phase === 2 ? ORB.SPEED_P2 : ORB.SPEED_P1;

    for (let i = 0; i < count; i++) {
      const a = offset + i * step;
      spawnOrbFn(this.boss.x, this.boss.y, Math.cos(a) * speed, Math.sin(a) * speed, false);
    }
  }

  _enterSweep(player, spawnOrbFn) {
    this.state = 'sweep';
    this.timer = 1.4;

    const baseAngle = Math.atan2(player.y - this.boss.y, player.x - this.boss.x);
    const n = this.phase === 2 ? SWEEP.N_P2 : SWEEP.N_P1;
    const spread = SWEEP.SPREAD;

    for (let i = 0; i < n; i++) {
      // safe spread even when n === 1
      const t = n > 1 ? i / (n - 1) : 0.5;
      const a = baseAngle - spread / 2 + spread * t;
      const spd = SWEEP.SPD_MIN + Math.random() * SWEEP.SPD_VAR;

      this.scene.time.delayedCall(i * SWEEP.DELAY, () => {
        if (this.boss.hp <= 0) return;
        spawnOrbFn(this.boss.x, this.boss.y, Math.cos(a) * spd, Math.sin(a) * spd, true);
      });
    }
  }

  _goIdle(delay) {
    this.state = 'idle';
    this.timer = delay;
    this.chargeTarget = null;
  }

  isCharging() {
    return this.state === 'charge';
  }

  isEnraged() {
    return this.phase === 2;
  }
}
