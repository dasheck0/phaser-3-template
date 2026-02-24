/**
 * BaseObject - Base class for all game prefabs
 * Follows modular, functional principles with explicit dependencies
 *
 * Standardized constructor: (scene, name, options)
 * - scene: Phaser.Scene instance
 * - name: Unique identifier for this prefab instance
 * - options: Configuration object (immutable)
 */

export abstract class BaseObject {
	protected scene: Phaser.Scene;
	protected name: string;
	protected options: Record<string, any>;
	protected gameObjects: Phaser.GameObjects.GameObject[] = [];

	constructor(
		scene: Phaser.Scene,
		name: string,
		options: Record<string, any> = {},
	) {
		this.scene = scene;
		this.name = name;
		this.options = { ...options }; // Immutable copy
		this.create();
	}

	/**
	 * Create game objects - implement in subclass
	 * Keep pure: no side effects beyond creating game objects
	 */
	abstract create(): void;

	/**
	 * Update logic - optional override
	 */
	update(_time: number, _delta: number): void {
		// Override in subclass if needed
	}

	/**
	 * Clean up game objects
	 */
	destroy(): void {
		this.gameObjects.forEach((obj) => obj.destroy());
		this.gameObjects = [];
	}

	/**
	 * Helper: Add game object to tracking array
	 */
	protected addGameObject(obj: Phaser.GameObjects.GameObject): void {
		this.gameObjects.push(obj);
	}

	/**
	 * Helper: Get option with type safety and default
	 */
	protected getOption<T>(key: string, defaultValue: T): T {
		return (this.options[key] as T) ?? defaultValue;
	}

	/**
	 * Get prefab name
	 */
	getName(): string {
		return this.name;
	}

	/**
	 * Get all game objects
	 */
	getGameObjects(): Phaser.GameObjects.GameObject[] {
		return [...this.gameObjects]; // Immutable copy
	}
}
