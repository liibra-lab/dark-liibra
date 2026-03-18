// ═══════════════════════════════════════════════════
//  Player.js
// ═══════════════════════════════════════════════════

import { C, DEPTH, H, W, PLAYER } from '../utils/constants.js';

export class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.hp = PLAYER.HP;
    this.maxHp = PLAYER.HP;
    this.speed = PLAYER.SPEED;
    this.facing = 1;

    this.attackCooldown = 0;
    this.invincible = 0;

    this._buildGraphics();
  }

  _buildGraphics() {
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillEllipse(0, 10, 22, 8);

    this.body = this.scene.add.graphics();
    this.body.fillStyle(C.player, 1);
    this.body.fillRect(-7, -14, 14, 16); // torso
    this.body.fillRect(-5, -24, 10, 10); // head
    this.body.fillRect(-7, 2, 6, 8);     // left leg
    this.body.fillRect(1, 2, 6, 8);      // right leg
    this.body.fillStyle(C.sword, 1);
    this.body.fillRect(7, -12, 3, 14);   // blade
    this.body.fillRect(5, -14, 7, 3);    // guard
    this.body.fillRect(8, 2, 2, 4);      // tip

    this.container = this.scene.add.container(this.x, this.y, [shadow, this.body]);
    this.container.setDepth(DEPTH.PLAYER);
  }

  update(dt, keys) {
    this._move(dt, keys);
    this._tickCooldowns(dt);
    this._animate();
  }

  _move(dt, keys) {
    let dx = 0, dy = 0;

    if (keys.left.isDown  || keys.leftArr.isDown)  dx -= 1;
    if (keys.right.isDown || keys.rightArr.isDown) dx += 1;
    if (keys.up.isDown    || keys.upArr.isDown)    dy -= 1;
    if (keys.down.isDown  || keys.downArr.isDown)  dy += 1;

    if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

    this.x = Phaser.Math.Clamp(this.x + dx * this.speed * dt, 30, W - 30);
    this.y = Phaser.Math.Clamp(this.y + dy * this.speed * dt, 30, H - 30);

    if (dx !== 0) this.facing = dx > 0 ? 1 : -1;
    this.container.setPosition(this.x, this.y);
    this.container.setScale(this.facing, 1);
  }

  _tickCooldowns(dt) {
    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this.invincible > 0)     this.invincible -= dt;
  }

  _animate() {
    this.body.y = Math.sin(this.scene.time.now * 0.006) * 1.5;
    if (this.invincible > 0) {
      this.container.setAlpha(Math.sin(this.scene.time.now * 0.02) > 0 ? 1 : 0.3);
    } else {
      this.container.setAlpha(1);
    }
  }

  canAttack() {
    return this.attackCooldown <= 0;
  }

  onAttacked() {
    this.attackCooldown = PLAYER.ATK_COOLDOWN;
  }

  takeDamage(amount, iframes = PLAYER.INVINCIBLE_FRAMES) {
    this.hp -= amount;
    this.invincible = iframes;
    return this.hp <= 0;
  }

  isInvincible() {
    return this.invincible > 0;
  }

  destroy() {
    this.container.destroy();
  }
}
