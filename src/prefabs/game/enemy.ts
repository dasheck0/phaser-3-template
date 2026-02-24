import { BaseSprite } from "../base-sprite";

/**
 * Enemy — image-based enemy with patrol movement.
 *
 * Extends BaseSprite: sprite is created by the parent, physics body
 * is added via scene.physics.world.enable() in setup().
 *
 * options (in addition to BaseSprite options):
 *   speed          — patrol speed in px/s (default 50)
 *   patrolDistance — distance to patrol left/right from start (default 100)
 */
export class Enemy extends BaseSprite {
	private body!: Phaser.Physics.Arcade.Body;
	private direction = 1;

	protected setup(): void {
		const speed = this.getOption<number>("speed", 50);
		const patrolDistance = this.getOption<number>("patrolDistance", 100);

		this.scene.physics.world.enable(this.sprite);
		this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
		this.body.setCollideWorldBounds(true);

		this.sprite.setData("speed", speed);
		this.sprite.setData("startX", this.sprite.x);
		this.sprite.setData("patrolDistance", patrolDistance);
	}

	update(): void {
		if (!this.body) return;

		const speed = this.sprite.getData("speed") as number;
		const startX = this.sprite.getData("startX") as number;
		const patrolDistance = this.sprite.getData("patrolDistance") as number;

		this.body.setVelocityX(speed * this.direction);

		if (this.sprite.x > startX + patrolDistance) {
			this.direction = -1;
		} else if (this.sprite.x < startX - patrolDistance) {
			this.direction = 1;
		}
	}
}
