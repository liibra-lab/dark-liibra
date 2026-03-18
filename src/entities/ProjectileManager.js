// ═══════════════════════════════════════════════════
//  ProjectileManager.js
//  Handles red orbs, blue orbs, and player slashes
// ═══════════════════════════════════════════════════

import { C, DEPTH, W, H, ORB } from '../utils/constants.js';

export class ProjectileManager {
  constructor(scene) {
    this.scene = scene;
    this.orbs   = [];  // { gfx, x, y, vx, vy, homing, blue, blueLife, life }
    this.slashes = []; // { gfx, x, y, life, maxLife, hit }
  }

  // ── ORB SPAWN ──

  spawnOrb(x, y, vx, vy, homing = false) {
    const gfx = this.scene.add.graphics();
    gfx.fillStyle(C.orbGlow, 0.25); gfx.fillCircle(0, 0, 12);
    gfx.fillStyle(C.orb, 1);        gfx.fillCircle(0, 0, 7);
    gfx.fillStyle(C.orbInner, 1);   gfx.fillCircle(0, 0, 3);
    gfx.setPosition(x, y).setDepth(DEPTH.PROJECTILE);

    this.orbs.push({ gfx, x, y, vx, vy, homing, blue: false, blueLife: 0, life: ORB.LIFE });
  }

  // ── SLASH SPAWN ──

  spawnSlash(player) {
    const gfx = this.scene.add.graphics();
    gfx.lineStyle(3, C.slash, 0.9);
    gfx.beginPath();
    gfx.arc(0, 0, 28, Phaser.Math.DegToRad(-60), Phaser.Math.DegToRad(60), false);
    gfx.strokePath();
    gfx.lineStyle(2, C.slash, 0.5);
    gfx.beginPath();
    gfx.arc(0, 0, 22, Phaser.Math.DegToRad(-45), Phaser.Math.DegToRad(45), false);
    gfx.strokePath();

    const sx = player.x + player.facing * 24;
    const sy = player.y;
    gfx.setPosition(sx, sy).setDepth(DEPTH.SLASH).setScale(player.facing, 1);

    this.slashes.push({ gfx, x: sx, y: sy, life: 0.15, maxLife: 0.15, hit: false });
  }

  // ── UPDATE ──

  update(dt, bossX, bossY, playerX, playerY, now) {
    this._updateOrbs(dt, bossX, bossY, playerX, playerY, now);
    this._updateSlashes(dt);
  }

  _updateOrbs(dt, bossX, bossY, playerX, playerY, now) {
    const dead = [];

    for (const o of this.orbs) {
      if (o.blue) {
        // countdown
        o.blueLife -= dt;
        if (o.blueLife <= 0) { dead.push(o); continue; }

        // steer toward boss
        const dx = bossX - o.x, dy = bossY - o.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
          o.vx += (dx / dist) * ORB.BLUE_STEER * dt;
          o.vy += (dy / dist) * ORB.BLUE_STEER * dt;
          const spd = Math.sqrt(o.vx * o.vx + o.vy * o.vy);
          if (spd > ORB.BLUE_CAP) {
            o.vx = (o.vx / spd) * ORB.BLUE_CAP;
            o.vy = (o.vy / spd) * ORB.BLUE_CAP;
          }
        }

        // pulse alpha
        const pulse = 0.5 + 0.5 * Math.sin(now * 0.012);
        o.gfx.setAlpha(0.7 + 0.3 * pulse);

      } else {
        // red homing
        if (o.homing) {
          const dx = playerX - o.x, dy = playerY - o.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 1) {
            o.vx += (dx / dist) * ORB.HOMING_STEER * dt;
            o.vy += (dy / dist) * ORB.HOMING_STEER * dt;
            const spd = Math.sqrt(o.vx * o.vx + o.vy * o.vy);
            if (spd > ORB.HOMING_CAP) {
              o.vx = (o.vx / spd) * ORB.HOMING_CAP;
              o.vy = (o.vy / spd) * ORB.HOMING_CAP;
            }
          }
        }

        // wall bounce
        if (o.x < 24 || o.x > W - 24) { o.vx *= -0.9; o.x = Phaser.Math.Clamp(o.x, 24, W - 24); }
        if (o.y < 24 || o.y > H - 24) { o.vy *= -0.9; o.y = Phaser.Math.Clamp(o.y, 24, H - 24); }

        o.life -= dt;
        if (o.life <= 0) { dead.push(o); continue; }
      }

      o.x += o.vx * dt;
      o.y += o.vy * dt;
      o.gfx.setPosition(o.x, o.y);
    }

    this._removeOrbs(dead);
  }

  _updateSlashes(dt) {
    const dead = [];
    for (const s of this.slashes) {
      s.life -= dt;
      s.gfx.setAlpha(s.life / s.maxLife);
      if (s.life <= 0) dead.push(s);
    }
    for (const s of dead) {
      s.gfx.destroy();
      this.slashes.splice(this.slashes.indexOf(s), 1);
    }
  }

  // ── CONVERT RED → BLUE ──

  reflectOrb(orb, spawnParticleFn) {
    orb.blue = true;
    orb.blueLife = ORB.BLUE_LIFE;
    orb.homing = false;
    orb.vx *= 0.2;
    orb.vy *= 0.2;

    orb.gfx.clear();
    orb.gfx.fillStyle(C.blueOrbGlow, 0.3); orb.gfx.fillCircle(0, 0, 14);
    orb.gfx.fillStyle(C.blueOrb, 1);        orb.gfx.fillCircle(0, 0, 8);
    orb.gfx.fillStyle(C.blueOrbCore, 1);    orb.gfx.fillCircle(0, 0, 3);

    for (let i = 0; i < 10; i++) {
      spawnParticleFn(orb.x, orb.y, C.blueOrbGlow, 0.4 + Math.random() * 0.3);
    }
  }

  // ── DESTROY ──

  destroyOrb(orb) {
    orb.gfx.destroy();
    this.orbs.splice(this.orbs.indexOf(orb), 1);
  }

  _removeOrbs(list) {
    for (const o of list) {
      o.gfx.destroy();
      const idx = this.orbs.indexOf(o);
      if (idx !== -1) this.orbs.splice(idx, 1);
    }
  }

  getRedOrbs()  { return this.orbs.filter(o => !o.blue); }
  getBlueOrbs() { return this.orbs.filter(o => o.blue);  }
  getAllOrbs()   { return this.orbs; }
  getSlashes()  { return this.slashes; }

  destroyAll() {
    this.orbs.forEach(o => o.gfx.destroy());
    this.slashes.forEach(s => s.gfx.destroy());
    this.orbs = [];
    this.slashes = [];
  }
}
