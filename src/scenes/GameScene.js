// ═══════════════════════════════════════════════════
//  GameScene.js — Main orchestrator
// ═══════════════════════════════════════════════════

import { W, H, C, DEPTH, PLAYER, ORB } from '../utils/constants.js';
import { Player }            from '../entities/Player.js';
import { Boss }              from '../entities/Boss.js';
import { BossAI }            from '../entities/BossAI.js';
import { ProjectileManager } from '../entities/ProjectileManager.js';
import { ParticleSystem }    from '../entities/ParticleSystem.js';
import { HUD }               from '../entities/HUD.js';

export class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  // ─────────────────────────────────────────
  create() {
    this.cameras.main.setBackgroundColor(C.bg);

    this._buildArena();

    this.player     = new Player(this, PLAYER.START_X, PLAYER.START_Y);
    this.boss       = new Boss(this, W - 130, H / 2);
    this.bossAI     = new BossAI(this, this.boss);
    this.projectiles = new ProjectileManager(this);
    this.particles  = new ParticleSystem(this);
    this.hud        = new HUD(this);

    this.keys = this.input.keyboard.addKeys({
      up:      Phaser.Input.Keyboard.KeyCodes.W,
      down:    Phaser.Input.Keyboard.KeyCodes.S,
      left:    Phaser.Input.Keyboard.KeyCodes.A,
      right:   Phaser.Input.Keyboard.KeyCodes.D,
      upArr:   Phaser.Input.Keyboard.KeyCodes.UP,
      downArr: Phaser.Input.Keyboard.KeyCodes.DOWN,
      leftArr: Phaser.Input.Keyboard.KeyCodes.LEFT,
      rightArr:Phaser.Input.Keyboard.KeyCodes.RIGHT,
      attack:  Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    this.gameOver = false;
    this.victory  = false;

    this._buildScanlines();
  }

  // ─────────────────────────────────────────
  update(time, delta) {
    if (this.gameOver || this.victory) return;
    const dt = delta / 1000;

    // player
    this.player.update(dt, this.keys);
    this._handleAttack();

    // boss
    this.bossAI.update(dt, this.player,
      (x, y, vx, vy, homing) => this.projectiles.spawnOrb(x, y, vx, vy, homing),
      (x, y, color, life)    => this.particles.spawn(x, y, color, life),
      ()                     => this.particles.spawnDelayed(
                                   this.boss.x, this.boss.y, C.bossEye, 24, 40, 0.8)
    );
    this.boss.update(dt,
      this.bossAI.isEnraged(),
      this.player.x, this.player.y,
      this.bossAI.isCharging()
    );

    // projectiles & particles
    this.projectiles.update(dt,
      this.boss.x, this.boss.y,
      this.player.x, this.player.y,
      time
    );
    this.particles.update(dt);

    // collisions
    this._checkCollisions();

    // hud
    this.hud.update(
      this.player.hp, this.player.maxHp,
      this.boss.hp,   this.boss.maxHp,
      this.projectiles.getBlueOrbs(),
      this.bossAI.phase
    );
  }

  // ─────────────────────────────────────────
  _handleAttack() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.attack) && this.player.canAttack()) {
      this.player.onAttacked();
      this.projectiles.spawnSlash(this.player);
      this.cameras.main.shake(60, 0.004);
    }
  }

  // ─────────────────────────────────────────
  _checkCollisions() {
    const pm = this.projectiles;

    // ── slash → red orbs (reflect) ──
    for (const slash of pm.getSlashes()) {
      for (const orb of pm.getRedOrbs()) {
        const dx = slash.x - orb.x, dy = slash.y - orb.y;
        if (dx * dx + dy * dy < 40 * 40) {
          pm.reflectOrb(orb, (x, y, color, life) => this.particles.spawn(x, y, color, life));
          this.cameras.main.shake(50, 0.003);
        }
      }
    }

    // ── blue orbs → boss ──
    const blueHits = [];
    for (const orb of pm.getBlueOrbs()) {
      const dx = orb.x - this.boss.x, dy = orb.y - this.boss.y;
      if (dx * dx + dy * dy < 46 * 46) {
        blueHits.push(orb);
        if (this.boss.takeDamage(ORB.BLUE_DAMAGE)) {
          this._endGame(true);
          return;
        }
        this.particles.spawnBurst(this.boss.x, this.boss.y, C.particle);
        this.particles.spawnBurst(orb.x, orb.y, C.blueOrbGlow, 6);
        this.cameras.main.shake(100, 0.008);
      }
    }
    blueHits.forEach(o => pm.destroyOrb(o));

    // ── red orbs → player ──
    if (!this.player.isInvincible()) {
      const redHits = [];
      for (const orb of pm.getRedOrbs()) {
        const dx = orb.x - this.player.x, dy = orb.y - this.player.y;
        if (dx * dx + dy * dy < 28 * 28) {
          redHits.push(orb);
          const dead = this.player.takeDamage(1);
          this.cameras.main.shake(120, 0.008);
          this.particles.spawn(this.player.x, this.player.y, 0xffffff, 0.25);
          if (dead) { this._endGame(false); return; }
          break; // one hit per frame is enough
        }
      }
      redHits.forEach(o => pm.destroyOrb(o));
    }

    // ── boss charge body → player ──
    if (this.bossAI.isCharging() && !this.player.isInvincible()) {
      const dx = this.boss.x - this.player.x, dy = this.boss.y - this.player.y;
      if (dx * dx + dy * dy < 44 * 44) {
        const dead = this.player.takeDamage(2, PLAYER.CHARGE_INVINCIBLE);
        this.cameras.main.shake(200, 0.012);
        this.particles.spawn(this.player.x, this.player.y, 0xffffff, 0.4);
        if (dead) { this._endGame(false); return; }
      }
    }

    // ── slash → boss direct ──
    for (const slash of pm.getSlashes()) {
      if (slash.hit) continue;
      const dx = slash.x - this.boss.x, dy = slash.y - this.boss.y;
      if (dx * dx + dy * dy < 52 * 52) {
        slash.hit = true;
        const dmg = this.bossAI.isEnraged() ? 2 : 3;
        if (this.boss.takeDamage(dmg)) {
          this._endGame(true);
          return;
        }
        this.particles.spawnBurst(this.boss.x, this.boss.y, C.particle);
        this.cameras.main.shake(80, 0.006);
      }
    }
  }

  // ─────────────────────────────────────────
  _endGame(win) {
    if (this.gameOver || this.victory) return;
    if (win) {
      this.victory = true;
      this.cameras.main.shake(500, 0.02);
    } else {
      this.gameOver = true;
      this.player.container.setAlpha(0.2);
    }
    this.hud.showEnd(win);
  }

  // ─────────────────────────────────────────
  _buildArena() {
    const g = this.add.graphics().setDepth(DEPTH.FLOOR);

    for (let y = 0; y < H; y += 32) {
      for (let x = 0; x < W; x += 32) {
        g.fillStyle((x / 32 + y / 32) % 2 === 0 ? C.floor : C.floorAlt, 1);
        g.fillRect(x, y, 32, 32);
      }
    }

    g.fillStyle(C.wall, 1);
    g.fillRect(0, 0, W, 20);
    g.fillRect(0, H - 20, W, 20);
    g.fillRect(0, 0, 20, H);
    g.fillRect(W - 20, 0, 20, H);

    g.lineStyle(1, 0x151515, 1);
    for (let x = 20; x < W - 20; x += 64) g.lineBetween(x, 20, x, H - 20);
    for (let y = 20; y < H - 20; y += 64) g.lineBetween(20, y, W - 20, y);
  }

  _buildScanlines() {
    const scan = this.add.graphics().setDepth(DEPTH.SCANLINES);
    for (let y = 0; y < H; y += 4) {
      scan.fillStyle(0x000000, 0.12);
      scan.fillRect(0, y, W, 2);
    }
  }
}
