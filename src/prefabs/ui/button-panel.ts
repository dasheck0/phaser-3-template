import { BaseObject } from '../base-object';
import type { RexUIAnchor } from './common.interface';

export interface ButtonOptionConfig {
  key: string;
  keyInactive: string;
  isToggleButton: boolean;
}

export interface ButtonPanelOptions {
  buttons: ButtonOptionConfig[];
  anchor: RexUIAnchor;
  orientation?: string;
  onClick?: (index: number, isActive: boolean) => void;
}

/**
 * ButtonPanel — horizontal/vertical row of sprite buttons with optional toggle support.
 * Background is a semi-transparent rounded rectangle.
 */
export class ButtonPanel extends BaseObject {
  private buttons!: Phaser.GameObjects.GameObject | null;
  private buttonToggleStates: boolean[] = [];
  private onClick?: (index: number, isActive: boolean) => void;

  create(): void {
    const opts = this.options as ButtonPanelOptions;
    this.onClick = opts.onClick;

    const rexUI = (this.scene as any).rexUI;

    const buttonGameObjects = opts.buttons.map((btn) => {
      this.buttonToggleStates.push(true);
      const sprite = this.scene.add.sprite(0, 0, btn.key);
      const container = this.scene.add.container(0, 0, [sprite]);
      container.setSize(42, 42);
      return container;
    });

    this.buttons = rexUI.add
      .buttons({
        anchor: opts.anchor,
        orientation: opts.orientation ?? 'x',
        background: rexUI.add.roundRectangle(0, 0, 0, 0, 12, 0x000000, 0.5),
        buttons: buttonGameObjects,
        space: { top: 16, left: 16, right: 16, bottom: 16, item: 16 },
      })
      .layout();

    (this.buttons as Phaser.Events.EventEmitter).on(
      'button.click',
      (button: Phaser.GameObjects.Container, index: number) => {
        this.scene.tweens.add({
          targets: button,
          scale: 1.1,
          duration: 50,
          repeat: 0,
          yoyo: true,
          ease: 'Cubic',
          onComplete: () => button.setScale(1.0),
        });

        const btnOpt = opts.buttons[index];
        if (btnOpt?.isToggleButton) {
          this.buttonToggleStates[index] = !this.buttonToggleStates[index];
          (button.getAt(0) as Phaser.GameObjects.Sprite).setTexture(
            this.buttonToggleStates[index] ? btnOpt.key : btnOpt.keyInactive,
          );
        }

        this.onClick?.(index, this.buttonToggleStates[index]);
      },
    );

    this.addGameObject(this.buttons as Phaser.GameObjects.GameObject);
  }

  setOnClickListener(fn: (index: number, isActive: boolean) => void): void {
    this.onClick = fn;
  }

  getButtons(): Phaser.GameObjects.GameObject {
    if (!this.buttons) throw new Error(`[ButtonPanel] "${this.name}": panel not created`);
    return this.buttons as Phaser.GameObjects.GameObject;
  }
}
