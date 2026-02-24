import type { BaseObject } from "@prefabs/base-object";
import PrefabManager from "./prefab-manager";
import type { ResolvedPrefabDefinition } from "./types";

/**
 * Prefab Factory - Creates prefab instances from definitions
 * Pure factory pattern: Takes definition, returns instance
 * Fails early and loudly on errors
 */
export class PrefabFactory {
	/**
	 * Create a prefab from a definition
	 * @param scene - Phaser scene
	 * @param definition - Prefab definition from JSON
	 * @returns Prefab instance
	 * @throws Error if prefab type not found
	 */
	static createPrefab(
		scene: Phaser.Scene,
		definition: ResolvedPrefabDefinition,
	): BaseObject {
		if (!PrefabManager.has(definition.type)) {
			throw new Error(
				`Prefab type "${definition.type}" not found in registry. ` +
					`Available types: ${PrefabManager.getTypes().join(", ")}`,
			);
		}

		// Merge definition properties with x, y coordinates
		const options = {
			x: definition.x,
			y: definition.y,
			...(definition.properties || {}),
		};

		// Create instance using PrefabManager
		const name = definition.id || `${definition.type}_${Date.now()}`;
		const prefab = PrefabManager.create(definition.type, scene, name, options);

		// Store ID for later reference if provided
		if (definition.id) {
			scene.data.set(`prefab:${definition.id}`, prefab);
		}

		return prefab;
	}

	/**
	 * Create multiple prefabs from definitions
	 * Functional: Maps over definitions, returns array of instances
	 * @throws Error if any prefab type not found
	 */
	static createPrefabs(
		scene: Phaser.Scene,
		definitions: ResolvedPrefabDefinition[],
	): BaseObject[] {
		return definitions.map((def) => PrefabFactory.createPrefab(scene, def));
	}
}
