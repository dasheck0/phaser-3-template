import { BaseObject } from './base-object';

/**
 * Platform Prefab - Static platform for level design
 */
export class Platform extends BaseObject {
  private sprite!: Phaser.Physics.Arcade.StaticGroup;

  create(): void {
    const x = this.getOption('x', 0);
    const y = this.getOption('y', 0);
    const width = this.getOption('width', 400);
    const height = this.getOption('height', 32);
    const color = this.getOption('color', 0x666666);

    // Create static platform
    this.sprite = this.scene.physics.add.staticGroup();
    const platform = this.sprite.create(x, y, '') as Phaser.Physics.Arcade.Sprite;
    platform.setDisplaySize(width, height);
    platform.setTint(color);
    platform.refreshBody();

    this.addGameObject(this.sprite as unknown as Phaser.GameObjects.GameObject);
  }

  public getGroup(): Phaser.Physics.Arcade.StaticGroup {
    return this.sprite;
  }
}
