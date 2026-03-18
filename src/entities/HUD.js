// ═══════════════════════════════════════════════════
//  HUD.js
// ═══════════════════════════════════════════════════

import { C, W, H, DEPTH, ORB } from '../utils/constants.js';

export class HUD {
  constructor(scene) {
    this.scene = scene;
    this.layer = scene.add.container(0, 0).setDepth(DEPTH.UI);
    this._build();
  }

  _build() {
    // ── PLAYER HP ──
    const pBg = this.scene.add.graphics();
    pBg.fillStyle(0x000000, 0.7); pBg.fillRect(24, 16, 154, 28);
    pBg.lineStyle(1, C.ui);       pBg.strokeRect(24, 16, 154, 28);
    this.layer.add(pBg);

    this.pHpBar = this.scene.add.graphics();
    this.layer.add(this.pHpBar);

    this.layer.add(this.scene.add.text(30, 20, 'JOGADOR', {
      font: '10px Courier New', fill: '#443830', letterSpacing: 3,
    }));

    // ── BOSS HP ──
    const bBg = this.scene.add.graphics();
    bBg.fillStyle(0x000000, 0.7); bBg.fillRect(W / 2 - 120, 16, 240, 28);
    bBg.lineStyle(1, C.ui);       bBg.strokeRect(W / 2 - 120, 16, 240, 28);
    this.layer.add(bBg);

    this.bHpBar = this.scene.add.graphics();
    this.layer.add(this.bHpBar);

    this.layer.add(this.scene.add.text(W / 2, 20, "VEL'ZAR — O DEVORADOR", {
      font: '9px Courier New', fill: '#662200', letterSpacing: 2,
    }).setOrigin(0.5, 0));

    // ── BLUE ORB TIMER ──
    this.blueBar   = this.scene.add.graphics();
    this.blueLabel = this.scene.add.text(W - 26, 16, '', {
      font: '9px Courier New', fill: '#4488ff', letterSpacing: 2,
    }).setOrigin(1, 0);
    this.layer.add(this.blueBar);
    this.layer.add(this.blueLabel);

    // ── PHASE TEXT ──
    this.phaseText = this.scene.add.text(W / 2, H - 18, '', {
      font: '10px Courier New', fill: '#880000', letterSpacing: 4,
    }).setOrigin(0.5, 1);
    this.layer.add(this.phaseText);

    // ── END SCREEN ──
    this.endText = this.scene.add.text(W / 2, H / 2, '', {
      font: 'bold 28px Courier New', fill: '#cc0000',
      stroke: '#000', strokeThickness: 4, letterSpacing: 6,
    }).setOrigin(0.5).setDepth(DEPTH.OVERLAY).setVisible(false);

    this.endSub = this.scene.add.text(W / 2, H / 2 + 40, '', {
      font: '11px Courier New', fill: '#666050', letterSpacing: 3,
    }).setOrigin(0.5).setDepth(DEPTH.OVERLAY).setVisible(false);
  }

  update(playerHp, playerMaxHp, bossHp, bossMaxHp, blueOrbs, phase) {
    // player bar
    this.pHpBar.clear();
    const pPct = Math.max(0, playerHp / playerMaxHp);
    this.pHpBar.fillStyle(pPct > 0.4 ? C.hpGood : C.hpLow, 1);
    this.pHpBar.fillRect(26, 30, Math.floor(150 * pPct), 10);

    // boss bar
    this.bHpBar.clear();
    const bPct = Math.max(0, bossHp / bossMaxHp);
    this.bHpBar.fillStyle(bPct > 0.4 ? C.hpGood : C.hpLow, 1);
    this.bHpBar.fillRect(W / 2 - 118, 30, Math.floor(236 * bPct), 10);

    // blue orb timers
    this.blueBar.clear();
    if (blueOrbs.length > 0) {
      this.blueLabel.setText('ORBE AZUL ATIVO');
      blueOrbs.forEach((o, i) => {
        const pct = Math.max(0, o.blueLife / ORB.BLUE_LIFE);
        this.blueBar.fillStyle(0x001133, 0.8);
        this.blueBar.fillRect(W - 186, 16 + i * 14, 156, 10);
        this.blueBar.fillStyle(pct > 0.3 ? C.hpBlue : C.hpBlueLow, 1);
        this.blueBar.fillRect(W - 186, 16 + i * 14, Math.floor(156 * pct), 10);
      });
    } else {
      this.blueLabel.setText('');
    }

    // phase text
    if (phase === 2) this.phaseText.setText('// FASE DE FÚRIA //');
  }

  showEnd(win) {
    if (win) {
      this.endText.setText("VEL'ZAR DERROTADO").setFill('#c8c0b0').setVisible(true);
      this.endSub.setText('[ aperte F5 para jogar novamente ]').setVisible(true);
    } else {
      this.endText.setText('VOCÊ MORREU').setFill('#cc0000').setVisible(true);
      this.endSub.setText('[ aperte F5 para tentar novamente ]').setVisible(true);
    }
  }
}
