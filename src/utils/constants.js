// ═══════════════════════════════════════════════════
//  LIIBRA DARK — Constants
// ═══════════════════════════════════════════════════

export const W = 640;
export const H = 480;

export const DEPTH = {
  FLOOR:      0,
  BOSS:       9,
  PLAYER:     10,
  PROJECTILE: 8,
  SLASH:      20,
  PARTICLE:   25,
  SCANLINES:  100,
  UI:         50,
  OVERLAY:    200,
};

export const C = {
  bg:          0x080808,
  floor:       0x111111,
  floorAlt:    0x0e0e0e,
  wall:        0x0a0a0a,

  player:      0xc8c0b0,
  sword:       0x888070,

  boss:        0x991111,
  bossDark:    0x550808,
  bossEye:     0xff2200,
  bossEnraged: 0xcc1100,
  bossDarkEnraged: 0x880000,

  orb:         0xcc3300,
  orbGlow:     0xff5500,
  orbInner:    0xff6600,

  blueOrb:     0x0055ff,
  blueOrbGlow: 0x44aaff,
  blueOrbCore: 0xaaddff,

  slash:       0xffffff,

  hpGood:      0x882200,
  hpLow:       0xff2200,
  hpBlue:      0x0055ff,
  hpBlueLow:   0x4400cc,

  ui:          0x333025,
  uiText:      0x666050,
  particle:    0xaa2200,
  bone:        0xc8c0b0,
};

export const PLAYER = {
  START_X:    100,
  START_Y:    H / 2,
  HP:         10,
  SPEED:      160,
  ATK_COOLDOWN: 0.45,
  INVINCIBLE_FRAMES: 0.6,
  CHARGE_INVINCIBLE: 1.0,
};

export const BOSS = {
  START_X:    W - 130,
  START_Y:    H / 2,
  HP:         60,
  ENRAGE_PCT: 0.4,       // phase 2 threshold
};

export const ORB = {
  LIFE:         4,        // seconds before despawn
  SPEED_P1:     110,
  SPEED_P2:     160,
  HOMING_STEER: 80,
  HOMING_CAP:   200,

  BLUE_LIFE:    5,        // seconds after reflect
  BLUE_STEER:   260,
  BLUE_CAP:     220,
  BLUE_DAMAGE:  4,

  COUNT_P1:     5,
  COUNT_P2:     8,
};

export const SWEEP = {
  N_P1:    4,
  N_P2:    7,
  SPREAD:  0.55,
  SPD_MIN: 130,
  SPD_VAR: 40,
  DELAY:   100,  // ms between shots
};

export const CHARGE = {
  SPEED_P1:  220,
  SPEED_P2:  340,
  JITTER:    60,
  IDLE_AFTER_P1: 0.8,
  IDLE_AFTER_P2: 0.4,
};
