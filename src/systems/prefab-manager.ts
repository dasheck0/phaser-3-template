/**
 * PrefabManager - Singleton registry for prefab classes
 * Provides global access to prefab constructors across all scenes
 */

import type { BaseObject } from "../prefabs/base-object";

type PrefabConstructor = new (
	scene: Phaser.Scene,
	name: string,
	options: Record<string, any>,
) => BaseObject;

class PrefabManager {
	private static instance: PrefabManager;
	private prefabs: Map<string, PrefabConstructor>;

	private constructor() {
		this.prefabs = new Map();
	}

	/**
	 * Get singleton instance
	 */
	static getInstance(): PrefabManager {
		if (!PrefabManager.instance) {
			PrefabManager.instance = new PrefabManager();
		}
		return PrefabManager.instance;
	}

	/**
	 * Register a prefab class
	 */
	register(type: string, prefabClass: PrefabConstructor): void {
		this.prefabs.set(type, prefabClass);
	}

	/**
	 * Get a prefab class by type
	 */
	get(type: string): PrefabConstructor | undefined {
		return this.prefabs.get(type);
	}

	/**
	 * Check if a prefab type exists
	 */
	has(type: string): boolean {
		return this.prefabs.has(type);
	}

	/**
	 * Create a prefab instance
	 */
	create(
		type: string,
		scene: Phaser.Scene,
		name: string,
		options: Record<string, any>,
	): BaseObject {
		const PrefabClass = this.prefabs.get(type);
		if (!PrefabClass) {
			throw new Error(`Prefab type "${type}" not registered`);
		}
		return new PrefabClass(scene, name, options);
	}

	/**
	 * Get all registered prefab types
	 */
	getTypes(): string[] {
		return Array.from(this.prefabs.keys());
	}
}

export default PrefabManager.getInstance();
