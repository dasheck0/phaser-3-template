import { BaseSprite } from '../base-sprite';

/**
 * Sprite — concrete, general-purpose image prefab.
 *
 * Use this when you just want to place an image in a scene via JSON:
 *   { "type": "Sprite", "x": 100, "y": 200, "properties": { "textureKey": "notes" } }
 *
 * For game objects with behaviour (Player, Enemy, …) extend BaseSprite directly.
 */
export class Sprite extends BaseSprite {
  protected setup(): void {
    // No additional behaviour — pure image display.
  }
}
