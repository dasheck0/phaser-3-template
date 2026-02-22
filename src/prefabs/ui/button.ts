import { BaseObject } from '../base-object';

/**
 * Button Prefab - Interactive UI button
 * Modular: Self-contained button with text and click handling
 */
export class Button extends BaseObject {
  private rectangle!: Phaser.GameObjects.Rectangle;
  private text!: Phaser.GameObjects.Text;
  private hoverColorValue!: number;
  private backgroundColorValue!: number;

  create(): void {
    const x = this.getOption('x', 0);
    const y = this.getOption('y', 0);
    const width = this.getOption('width', 200);
    const height = this.getOption('height', 60);
    const buttonText = this.getOption('text', 'Button');
    const fontSize = this.getOption('fontSize', 24);
    this.backgroundColorValue = this.getOption('backgroundColor', 0x4a90e2);
    this.hoverColorValue = this.getOption('hoverColor', 0x357abd);
    const textColor = this.getOption('textColor', '#ffffff');
    const callback = this.getOption<(() => void) | null>('onClick', null);

    // Create rectangle background
    this.rectangle = this.scene.add.rectangle(x, y, width, height, this.backgroundColorValue);
    this.rectangle.setInteractive({ useHandCursor: true });

    // Create text
    this.text = this.scene.add.text(x, y, buttonText, {
      fontSize: `${fontSize}px`,
      color: textColor,
    });
    this.text.setOrigin(0.5, 0.5);

    // Hover effects (bind to preserve context)
    this.rectangle.on('pointerover', this.onPointerOver, this);
    this.rectangle.on('pointerout', this.onPointerOut, this);

    // Click handler
    if (callback) {
      this.rectangle.on('pointerdown', callback);
    }

    this.addGameObject(this.rectangle);
    this.addGameObject(this.text);
  }

  private onPointerOver(): void {
    if (this.rectangle) {
      this.rectangle.setFillStyle(this.hoverColorValue);
    }
  }

  private onPointerOut(): void {
    if (this.rectangle) {
      this.rectangle.setFillStyle(this.backgroundColorValue);
    }
  }

  /**
   * Set click callback (useful for JSON-loaded buttons)
   */
  public setOnClick(callback: () => void): void {
    if (this.rectangle) {
      this.rectangle.off('pointerdown');
      this.rectangle.on('pointerdown', callback);
    }
  }

  public getRectangle(): Phaser.GameObjects.Rectangle {
    return this.rectangle;
  }
}
