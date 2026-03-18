// ═══════════════════════════════════════════════════
//  main.js — Entry point
// ═══════════════════════════════════════════════════
import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene.js';
import { W, H }      from './utils/constants.js';

const config = {
  type: Phaser.AUTO,
  width: W,
  height: H,
  parent: 'game-container',
  backgroundColor: '#080808',
  scene: [GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

export default new Phaser.Game(config);
