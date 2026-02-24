import { BaseSprite } from "../base-sprite";

/**
 * Player — image-based player character with keyboard controls.
 *
 * Extends BaseSprite: sprite is created by the parent, physics body
 * is added via scene.physics.existing() in setup().
 *
 * options (in addition to BaseSprite options):
 *   speed        — horizontal move speed in px/s (default 160)
 *   jumpVelocity — upward velocity on jump (default -330)
 */
export class Player extends BaseSprite {
	private body!: Phaser.Physics.Arcade.Body;
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

	protected setup(): void {
		const speed = this.getOption<number>("speed", 160);
		const jumpVelocity = this.getOption<number>("jumpVelocity", -330);

		// Attach arcade physics to the sprite created by BaseSprite
		this.scene.physics.world.enable(this.sprite);
		this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
		this.body.setCollideWorldBounds(true);
		this.body.setBounce(0.2, 0);

		this.sprite.setData("speed", speed);
		this.sprite.setData("jumpVelocity", jumpVelocity);

		this.cursors = this.scene.input.keyboard!.createCursorKeys();
	}

	update(): void {
		if (!this.body) return;

		const speed = this.sprite.getData("speed") as number;
		const jumpVelocity = this.sprite.getData("jumpVelocity") as number;

		if (this.cursors.left.isDown) {
			this.body.setVelocityX(-speed);
		} else if (this.cursors.right.isDown) {
			this.body.setVelocityX(speed);
		} else {
			this.body.setVelocityX(0);
		}

		if (this.cursors.up.isDown && this.body.touching.down) {
			this.body.setVelocityY(jumpVelocity);
		}
	}
}
