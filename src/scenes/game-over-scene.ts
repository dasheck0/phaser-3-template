import { BaseScene } from './base-scene';
import { State } from '@systems/finite-state-machine';

/**
 * Game Over States
 */
class DisplayState extends State {
  enter(): void {
    console.log('GameOver: Display');
  }
}

/**
 * Game Over Scene - Simple game over screen with FSM
 */
export class GameOverScene extends BaseScene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  protected get scenePath(): null {
    return null;
  }

  onCreateReady(): void {
    this.initializeBase();
    this.fsm.setState('display');

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Title
    this.add
      .text(width / 2, height / 2 - 100, 'Game Over', {
        fontSize: '64px',
        color: '#ff0000',
      })
      .setOrigin(0.5);

    // Restart button
    const restartButton = this.add.rectangle(width / 2, height / 2 + 50, 200, 60, 0x4a90e2);
    restartButton.setInteractive({ useHandCursor: true });

    const restartText = this.add.text(width / 2, height / 2 + 50, 'Restart', {
      fontSize: '24px',
      color: '#ffffff',
    });
    restartText.setOrigin(0.5);

    restartButton.on('pointerover', () => {
      restartButton.setFillStyle(0x357abd);
    });

    restartButton.on('pointerout', () => {
      restartButton.setFillStyle(0x4a90e2);
    });

    restartButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // Main menu button
    const menuButton = this.add.rectangle(width / 2, height / 2 + 130, 200, 60, 0x666666);
    menuButton.setInteractive({ useHandCursor: true });

    const menuText = this.add.text(width / 2, height / 2 + 130, 'Main Menu', {
      fontSize: '24px',
      color: '#ffffff',
    });
    menuText.setOrigin(0.5);

    menuButton.on('pointerover', () => {
      menuButton.setFillStyle(0x555555);
    });

    menuButton.on('pointerout', () => {
      menuButton.setFillStyle(0x666666);
    });

    menuButton.on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });
  }

  protected setupStates(): void {
    this.fsm.addState(new DisplayState('display', this.fsm));
  }
}
