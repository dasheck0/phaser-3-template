# Phaser 3 Template

A modern, production-ready Phaser 3 starter template with TypeScript, declarative scene architecture, FSM-based state management, a Zustand-powered store with persistence, and a full UI prefab library.

## Features

- ✅ **TypeScript** — Strict mode, path aliases, `useDefineForClassFields: false` for Phaser compatibility
- ✅ **Vite** — Fast dev server and optimized production build
- ✅ **Declarative Scenes** — Each scene is described entirely by a JSON config file; no `this.add.*` in scene code
- ✅ **Two-Pass Preload** — BaseScene automatically handles JSON config loading + asset loading in the correct order
- ✅ **FSM** — Generic Finite State Machine with `enter` / `execute` / `exit` lifecycle; state classes in dedicated files
- ✅ **Zustand Store** — Type-safe, mutation-based global state with automatic localStorage persistence
- ✅ **Prefab System** — Registry-driven prefab factory; every game object is a self-contained `BaseObject` subclass
- ✅ **UI Prefab Library** — Button, Label, Panel, Slider, Sprite out of the box
- ✅ **Audio Prefab** — Separate music and SFX channels, fade support, mute toggle
- ✅ **Full Scene Flow** — Boot → MainMenu → Game → GameOver → Options

---

## Project Structure

```
src/
├── main.ts                                # Entry point
├── config/
│   └── game-config.ts                     # Phaser game config
├── scenes/
│   ├── base-scene.ts                      # Abstract base with two-pass preload + FSM lifecycle
│   ├── boot/
│   │   ├── boot-scene.ts
│   │   └── states/
│   │       ├── loading-state.ts
│   │       └── complete-state.ts
│   ├── main-menu/
│   │   ├── main-menu-scene.ts
│   │   └── states/
│   │       ├── idle-state.ts
│   │       └── transition-state.ts
│   ├── options/
│   │   ├── options-scene.ts
│   │   └── states/
│   │       └── idle-state.ts
│   ├── game/
│   │   ├── game-scene.ts
│   │   └── states/
│   │       ├── playing-state.ts
│   │       ├── paused-state.ts
│   │       └── game-over-state.ts
│   └── game-over/
│       ├── game-over-scene.ts
│       └── states/
│           └── display-state.ts
├── prefabs/
│   ├── base-object.ts                     # Abstract base for all prefabs
│   ├── base-sprite.ts                     # Texture-based prefab base
│   ├── index.ts                           # Central prefab registry
│   ├── audio/
│   │   └── audio.ts                       # Music + SFX channels, fade, mute
│   ├── game/
│   │   ├── player.ts
│   │   ├── enemy.ts
│   │   └── platform.ts
│   └── ui/
│       ├── button.ts
│       ├── label.ts
│       ├── panel.ts
│       ├── slider.ts
│       └── sprite.ts
├── systems/
│   ├── types.ts                           # Shared type definitions
│   ├── finite-state-machine.ts            # Generic FSM
│   ├── prefab-factory.ts                  # Creates prefab instances from JSON definitions
│   ├── prefab-manager.ts                  # Global prefab type registry
│   ├── scene-loader.ts                    # Instantiates prefabs from SceneConfig
│   └── store/
│       ├── create-store.ts                # Generic Zustand store factory
│       ├── types.ts
│       ├── persistence/
│       │   ├── types.ts                   # PersistenceAdapter interface
│       │   ├── local-storage-adapter.ts
│       │   └── memory-adapter.ts
│       └── stores/
│           └── game-store.ts              # Global game state (playCount, masterVolume)
└── utils/
    └── math.ts                            # clamp and other pure math helpers

public/
├── assets/
│   ├── audio/                             # Audio files
│   └── images/                           # Image files
└── data/
    └── scenes/                            # Runtime scene JSON configs
        ├── main-menu.scene.json
        ├── level-1.scene.json
        ├── options.scene.json
        └── game-over.scene.json
```

---

## Getting Started

```bash
npm install
npm run dev      # Dev server at http://localhost:5173
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
```

---

## Core Concepts

### Declarative Scenes

Every scene is described by a JSON config file in `public/data/scenes/`. The scene class contains **only logic** — no layout, no hardcoded positions, no `this.add.*` calls for static objects.

**Example: `public/data/scenes/main-menu.scene.json`**
```json
{
  "background": "#2d2d2d",
  "assets": {
    "audio": [{ "key": "bgMusic", "path": "/assets/audio/theme.mp3" }],
    "images": [{ "key": "logo",   "path": "/assets/images/logo.png" }]
  },
  "prefabs": [
    {
      "type": "Label",
      "id": "titleLabel",
      "x": 400, "y": 150,
      "properties": { "text": "My Game", "fontSize": 48, "color": "#ffffff" }
    },
    {
      "type": "Button",
      "id": "startButton",
      "x": 400, "y": 310,
      "properties": {
        "text": "Start Game",
        "width": 200, "height": 60,
        "backgroundColor": 4886754,
        "hoverColor": 3504829,
        "textColor": "#ffffff"
      }
    }
  ]
}
```

**The matching scene class wires callbacks only:**
```typescript
export class MainMenuScene extends BaseScene {
  protected get scenePath() { return '/data/scenes/main-menu.scene.json'; }

  async onCreateReady(): Promise<void> {
    this.initializeBase();
    await this.sceneLoader.loadFromCachedConfig();

    const btn = this.sceneLoader.getPrefabById('startButton');
    if (btn instanceof Button) {
      btn.setOnClick(() => this.scene.start('GameScene'));
    }
  }

  protected setupStates(): void {
    this.fsm.addState(new IdleState('idle', this.fsm));
  }
}
```

### Two-Pass Preload (BaseScene)

`BaseScene` handles a two-pass asset loading flow transparently:

1. **Pass 1** — Phaser loads the scene's JSON config file
2. On completion — `SceneLoader.preloadAssets()` registers all `assets.audio`, `assets.images`, `assets.spritesheets` entries with the Phaser loader and triggers **Pass 2**
3. **Pass 2** — Phaser loads the actual asset files
4. `onCreateReady()` is called only after both passes are complete

Subclasses never deal with this; they just implement `onCreateReady()`.

> **Important:** Each scene uses its own `scenePath` as the Phaser cache key (`__sceneConfig:<path>`) so multiple scenes can preload concurrently without collisions.

### Finite State Machine

Every scene owns a `FiniteStateMachine` instance. States are plain classes in dedicated files:

```typescript
// src/scenes/game/states/paused-state.ts
import { State } from '@systems/finite-state-machine';
import type { GameScene } from '../game-scene';

export class PausedState extends State {
  enter(): void {
    (this.fsm.getContext() as GameScene).physics.pause();
  }
  exit(): void {
    (this.fsm.getContext() as GameScene).physics.resume();
  }
}
```

```typescript
// Inside the scene:
this.fsm.addState(new PausedState('paused', this.fsm));
this.fsm.setState('paused');
this.fsm.isInState('paused'); // true
```

### Zustand Store

Global state is held in a type-safe, mutation-based store backed by Zustand. Persistence is handled automatically via a pluggable adapter:

```typescript
// Read state
const { playCount, masterVolume } = gameStore.getState();

// Dispatch mutations
gameStore.actions.incrementPlayCount();
gameStore.actions.setMasterVolume(0.5);

// Subscribe to changes (remember to unsubscribe on SHUTDOWN)
const unsubscribe = gameStore.subscribe((state) => {
  mySlider.setValue(state.masterVolume);
});
this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => unsubscribe());
```

**Creating your own store:**
```typescript
export const myStore = createStore({
  key: 'my-store',                         // localStorage key
  adapter: createLocalStorageAdapter(),    // swap for memoryAdapter in tests
  state: { score: 0 },
  mutations: {
    addScore: (state, amount: number) => ({ ...state, score: state.score + amount }),
    reset:    (state)                 => ({ ...state, score: 0 }),
  },
});
```

### Prefab System

All game objects extend `BaseObject`. Register new types once and use them from any scene JSON:

**1. Create the class:**
```typescript
// src/prefabs/game/coin.ts
export class Coin extends BaseSprite {
  create(): void {
    super.create();
    // additional setup
  }
}
```

**2. Register in `src/prefabs/index.ts`:**
```typescript
import { Coin } from './game/coin';
PrefabManager.register('Coin', Coin);
```

**3. Use in any scene JSON:**
```json
{ "type": "Coin", "id": "coin1", "x": 200, "y": 300, "properties": { "textureKey": "coin" } }
```

### Audio Prefab

Declare an `Audio` prefab in your scene JSON and wire it in the scene class:

```typescript
const audio = this.sceneLoader.getPrefabById('audio');
if (audio instanceof Audio) {
  audio.playMusic('bgMusic');          // loops automatically
  audio.setMusicVolume(0.6);
  audio.fadeMusicTo(0, 2000);          // fade out over 2 seconds
  audio.playSfx('jump');               // one-shot, stacks
}
```

---

## Built-in UI Prefabs

| Type | Key properties |
|------|---------------|
| `Button` | `text`, `width`, `height`, `backgroundColor`, `hoverColor`, `textColor`, `fontSize` |
| `Label` | `text`, `fontSize`, `color`, `align` |
| `Panel` | `width`, `height`, `backgroundColor`, `alpha`, `borderColor`, `borderWidth` |
| `Slider` | `width`, `height`, `minValue`, `maxValue`, `value`, `trackColor`, `fillColor` |
| `Sprite` | `textureKey`, `scale`, `tint`, `originX`, `originY`, `depth` |

---

## Controls (default)

| Key | Action |
|-----|--------|
| Arrow keys / WASD | Move player |
| ↑ / W | Jump |
| `P` | Pause / resume |
| `ESC` | Back to main menu |
| `+` / `-` | Adjust master volume |

---

## Architecture Principles

- **Declarative** — JSON configs describe *what* exists; scene classes describe *what happens*
- **Modular** — Each scene, state and prefab lives in its own file with a single responsibility
- **Functional** — Pure mutations, immutable state updates, no hidden side effects in stores
- **Type-safe** — Strict TypeScript throughout; prefab lookups are guarded with `instanceof`
- **Lifecycle-correct** — SHUTDOWN listeners registered in `init()` (first hook with `this.events`) and cleaned up reliably; `scene.data` prefab references cleared on shutdown

---

## License

MIT
