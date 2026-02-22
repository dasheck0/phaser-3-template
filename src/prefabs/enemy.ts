import { BaseObject } from './base-object';

/**
 * Enemy Prefab - Simple enemy with patrol movement
 * Modular: Self-contained AI and rendering
 */
export class Enemy extends BaseObject {
  private sprite!: Phaser.Physics.Arcade.Sprite;
  private direction = 1;

  create(): void {
    const x = this.getOption('x', 0);
    const y = this.getOption('y', 0);
    const width = this.getOption('width', 32);
    const height = this.getOption('height', 32);
    const color = this.getOption('color', 0xff0000);
    const speed = this.getOption('speed', 50);
    const patrolDistance = this.getOption('patrolDistance', 100);

    // Create sprite
    this.sprite = this.scene.physics.add.sprite(x, y, '');
    this.sprite.setDisplaySize(width, height);
    this.sprite.setTint(color);
    this.sprite.setCollideWorldBounds(true);

    // Store patrol data
    this.sprite.setData('speed', speed);
    this.sprite.setData('startX', x);
    this.sprite.setData('patrolDistance', patrolDistance);

    this.addGameObject(this.sprite);
  }

  update(): void {
    if (!this.sprite || !this.sprite.body) return;

    const speed = this.sprite.getData('speed') as number;
    const startX = this.sprite.getData('startX') as number;
    const patrolDistance = this.sprite.getData('patrolDistance') as number;
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    // Patrol movement
    body.setVelocityX(speed * this.direction);

    // Reverse at patrol boundaries
    if (this.sprite.x > startX + patrolDistance) {
      this.direction = -1;
    } else if (this.sprite.x < startX - patrolDistance) {
      this.direction = 1;
    }
  }

  destroy(): void {
    super.destroy();
  }

  public getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }
}
