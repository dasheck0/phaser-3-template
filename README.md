# Phaser 3 TypeScript Starter

Ein modernes Phaser 3 Starter-Projekt mit TypeScript und deklarativem Scene Loading System.

## Features

- ✅ **TypeScript** - Vollständig typsicher mit strict mode
- ✅ **Vite** - Schneller Dev Server und Build
- ✅ **Prefab System** - Wiederverwendbare Game-Objekt-Komponenten
- ✅ **Deklarative Scenes** - JSON-basierte Szenen-Konfiguration
- ✅ **Scene Loader** - Automatisches Laden und Instanziieren von Prefabs
- ✅ **Multiple Scenes** - Boot → MainMenu → Game → GameOver Flow

## Projekt-Struktur

```
src/
├── main.ts                          # Entry Point
├── config/
│   └── game-config.ts               # Phaser Game Config
├── scenes/
│   ├── boot-scene.ts                # Preloader
│   ├── main-menu-scene.ts           # Hauptmenü
│   ├── game-scene.ts                # Haupt-Spielszene
│   └── game-over-scene.ts           # Game Over
├── prefabs/
│   ├── base-prefab.ts               # Base Klasse
│   ├── player.ts                    # Player Prefab
│   ├── enemy.ts                     # Enemy Prefab
│   ├── button.ts                    # Button Prefab
│   ├── platform.ts                  # Platform Prefab
│   └── index.ts                     # Prefab Registry
├── systems/
│   ├── types.ts                     # Type Definitions
│   ├── scene-loader.ts              # Scene Loader
│   └── prefab-factory.ts            # Prefab Factory
└── data/
    └── scenes/                      # Source scene configs

public/
└── data/
    └── scenes/                      # Runtime scene configs
        ├── main-menu.scene.json     # Main Menu Config
        └── level-1.scene.json       # Level 1 Config
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Öffnet automatisch den Browser auf http://localhost:3000

## Build

```bash
npm run build
```

Build Output in `dist/`

## Deklaratives Scene System

### Scene Config Format

```json
{
  "background": "#87CEEB",
  "prefabs": [
    {
      "type": "Player",
      "id": "player",
      "x": 100,
      "y": 450,
      "properties": {
        "speed": 160,
        "jumpVelocity": -330
      }
    }
  ]
}
```

### Neue Prefabs erstellen

1. Erstelle eine neue Klasse in `src/prefabs/` die von `Prefab` erbt
2. Implementiere `create()` und `destroy()` Methoden
3. Registriere das Prefab in `src/prefabs/index.ts`

```typescript
export class MyPrefab extends Prefab {
  create(): void {
    // Erstelle Game Objects
  }
}
```

### Neue Scenes mit Loader erstellen

```typescript
import { SceneLoader } from '@systems/scene-loader';

export class MyScene extends Phaser.Scene {
  private sceneLoader!: SceneLoader;

  create(): void {
    this.sceneLoader = new SceneLoader(this);
    await this.sceneLoader.loadFromFile('/data/scenes/my-scene.json');
    
    // Setup callbacks for buttons (JSON can't serialize functions)
    const button = this.sceneLoader.getPrefabById('myButton');
    if (button && 'setOnClick' in button) {
      (button as any).setOnClick(() => this.handleClick());
    }
  }
}
```

**Wichtig:** Scene JSON-Dateien müssen im `public/data/scenes/` Ordner liegen!

## Controls

- **Pfeiltasten** - Player bewegen
- **↑** - Springen
- **ESC** - Zurück zum Hauptmenü (im Spiel)

## Architektur-Prinzipien

- **Modular** - Kleine, fokussierte, wiederverwendbare Module
- **Functional** - Pure Functions, Immutability, Composition
- **Type-Safe** - Vollständige TypeScript-Typisierung
- **Declarative** - JSON-Configs statt Code für Szenen-Aufbau

## License

MIT
