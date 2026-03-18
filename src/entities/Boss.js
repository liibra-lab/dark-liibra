// ═══════════════════════════════════════════════════
//  Boss.js — Vel'Zar, O Devorador
// ═══════════════════════════════════════════════════

import { C, DEPTH, BOSS } from '../utils/constants.js';

export class Boss {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.hp = BOSS.HP;
    this.maxHp = BOSS.HP;

    this.scaleVal = 1;
    this.scaleDir = 1;

    this.hitFlash = 0;  // own iframes for flicker, separate from player iframes

    this._buildGraphics();
  }

  _buildGraphics() {
    this.shadow = this.scene.add.graphics();
    this.shadow.fillStyle(0x000000, 0.4);
    this.shadow.fillEllipse(0, 30, 70, 18);

    this.gfx = this.scene.add.graphics();
    this.draw(false);

    this.container = this.scene.add.container(this.x, this.y, [this.shadow, this.gfx]);
    this.container.setDepth(DEPTH.BOSS);
  }

  draw(enraged) {
    const g = this.gfx;
    const s = this.scaleVal;
    g.clear();

    const bodyColor = enraged ? C.bossEnraged    : C.boss;
    const darkColor = enraged ? C.bossDarkEnraged : C.bossDark;

    // outer blob
    g.fillStyle(darkColor, 1);
    g.fillEllipse(0, 0, 58 * s, 54 * s);

    // inner body
    g.fillStyle(bodyColor, 1);
    g.fillEllipse(0, -2, 48 * s, 46 * s);

    // core glow
    g.fillStyle(enraged ? 0xff3300 : 0x771100, 0.6);
    g.fillEllipse(0, 0, 28 * s, 28 * s);

    // eye socket
    g.fillStyle(0x110000, 1);
    g.fillEllipse(-6 * s, -4 * s, 22 * s, 18 * s);

    // eye
    g.fillStyle(C.bossEye, 1);
    g.fillCircle(-6 * s, -4 * s, 7 * s);
    g.fillStyle(0x000000, 1);
    g.fillCircle(-4 * s, -5 * s, 3 * s);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(-3 * s, -7 * s, 1.5 * s);

    // horns
    g.fillStyle(darkColor, 1);
    g.fillTriangle(-10 * s, -20 * s, -18 * s, -42 * s, -4 * s, -20 * s);
    g.fillTriangle(6 * s,   -18 * s,  16 * s, -38 * s, 18 * s, -14 * s);

    // claws
    g.fillStyle(darkColor, 1);
    g.fillTriangle(-26 * s,  4 * s, -44 * s,  -6 * s, -24 * s, 12 * s);
    g.fillTriangle(-26 * s,  8 * s, -46 * s,  14 * s, -22 * s, 18 * s);
    g.fillTriangle( 24 * s,  0 * s,  44 * s,  -8 * s,  24 * s, 10 * s);
    g.fillTriangle( 22 * s, 10 * s,  44 * s,  16 * s,  20 * s, 18 * s);

    // mouth
    g.lineStyle(2 * s, 0x330000, 1);
    g.beginPath();
    g.moveTo(2 * s, 8 * s);
    g.lineTo(12 * s, 10 * s);
    g.lineTo(8 * s, 14 * s);
    g.lineTo(16 * s, 12 * s);
    g.strokePath();
  }

  update(dt, enraged, playerX, playerY, charging) {
    // pulse scale
    this.scaleVal += this.scaleDir * dt * 0.06;
    if (this.scaleVal > 1.06) this.scaleDir = -1;
    if (this.scaleVal < 0.94) this.scaleDir =  1;

    this.draw(enraged);

    // eye tracks player
    const angle = Math.atan2(playerY - this.y, playerX - this.x);
    this.gfx.x = Math.cos(angle) * 1.5;
    this.gfx.y = Math.sin(angle) * 1.5;

    // hit flash (boss's own flicker, not player's)
    if (this.hitFlash > 0) {
      this.hitFlash -= dt;
      this.container.setAlpha(Math.random() < 0.4 ? 0.5 : 1);
    } else {
      this.container.setAlpha(1);
    }

    this.container.setPosition(this.x, this.y);
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.hitFlash = 0.25;
    return this.hp <= 0;
  }

  destroy() {
    this.container.destroy();
  }
}
