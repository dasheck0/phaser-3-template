import { BaseObject } from './base-object';

/**
 * Player Prefab - Simple player character with keyboard controls
 * Modular: Self-contained, manages own physics and input
 */
export class Player extends BaseObject {
  private sprite!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  create(): void {
    const x = this.getOption('x', 0);
    const y = this.getOption('y', 0);
    const width = this.getOption('width', 32);
    const height = this.getOption('height', 32);
    const color = this.getOption('color', 0x00ff00);
    const speed = this.getOption('speed', 160);
    const jumpVelocity = this.getOption('jumpVelocity', -330);

    // Create sprite with physics
    this.sprite = this.scene.physics.add.sprite(x, y, '');
    this.sprite.setDisplaySize(width, height);
    this.sprite.setTint(color);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(0.2);
    
    // Store properties for movement
    this.sprite.setData('speed', speed);
    this.sprite.setData('jumpVelocity', jumpVelocity);

    // Setup input
    this.cursors = this.scene.input.keyboard!.createCursorKeys();

    this.addGameObject(this.sprite);
  }

  update(): void {
    if (!this.sprite || !this.sprite.body) return;

    const speed = this.sprite.getData('speed') as number;
    const jumpVelocity = this.sprite.getData('jumpVelocity') as number;
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    // Horizontal movement
    if (this.cursors.left.isDown) {
      body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      body.setVelocityX(speed);
    } else {
      body.setVelocityX(0);
    }

    // Jump
    if (this.cursors.up.isDown && body.touching.down) {
      body.setVelocityY(jumpVelocity);
    }
  }

  destroy(): void {
    super.destroy();
  }
}
