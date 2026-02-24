import { LayoutAnchor, PrefabDefinition, ResolvedPrefabDefinition, SceneLayoutConfig, SceneSafeMargin } from './types';

interface LayoutRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface ResolveLayoutInput {
  sceneLayout?: SceneLayoutConfig;
  worldWidth: number;
  worldHeight: number;
  visibleWorldRect: LayoutRect;
}

const DEFAULT_LAYOUT_SPACE: 'full' | 'safe' = 'full';

const X_ANCHOR_KEYS: (keyof LayoutAnchor)[] = ['left', 'right', 'centerX', 'x'];
const Y_ANCHOR_KEYS: (keyof LayoutAnchor)[] = ['top', 'bottom', 'centerY', 'y'];

const parseMargin = (margin?: SceneSafeMargin): Required<SceneSafeMargin> => ({
  top: margin?.top ?? 0,
  right: margin?.right ?? 0,
  bottom: margin?.bottom ?? 0,
  left: margin?.left ?? 0,
});

const createFullRect = (worldWidth: number, worldHeight: number): LayoutRect => ({
  left: 0,
  top: 0,
  right: worldWidth,
  bottom: worldHeight,
});

const createSafeRect = (visibleWorldRect: LayoutRect, margin?: SceneSafeMargin): LayoutRect => {
  const safe = parseMargin(margin);
  return {
    left: visibleWorldRect.left + safe.left,
    top: visibleWorldRect.top + safe.top,
    right: visibleWorldRect.right - safe.right,
    bottom: visibleWorldRect.bottom - safe.bottom,
  };
};

const getAxisTokenValue = (token: string, rect: LayoutRect, axis: 'x' | 'y'): number => {
  if (axis === 'x') {
    if (token === 'left') return rect.left;
    if (token === 'right') return rect.right;
    if (token === 'center' || token === 'centerX' || token === 'x') return (rect.left + rect.right) / 2;
  }
  if (token === 'top') return rect.top;
  if (token === 'bottom') return rect.bottom;
  if (token === 'center' || token === 'centerY' || token === 'y') return (rect.top + rect.bottom) / 2;
  throw new Error(`Unsupported layout anchor token "${token}" for axis "${axis}"`);
};

const ANCHOR_EXPRESSION_RE = /^([a-zA-Z]+)\s*(([+-])\s*(\d+(?:\.\d+)?))?$/;

const parseAnchorValue = (value: string | number, rect: LayoutRect, axis: 'x' | 'y'): number => {
  if (typeof value === 'number') {
    return value;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error('Layout anchor value cannot be empty');
  }

  const numeric = Number(trimmed);
  if (!Number.isNaN(numeric)) {
    return numeric;
  }

  const match = trimmed.match(ANCHOR_EXPRESSION_RE);
  if (!match) {
    throw new Error(`Invalid layout anchor expression "${value}"`);
  }

  const token = match[1];
  const sign = match[3];
  const offsetRaw = match[4];
  const base = getAxisTokenValue(token, rect, axis);
  const offset = offsetRaw ? Number(offsetRaw) : 0;
  return sign === '-' ? base - offset : base + offset;
};

const resolveAnchorAxis = (anchor: LayoutAnchor | undefined, rect: LayoutRect, axis: 'x' | 'y'): number | null => {
  if (!anchor) {
    return null;
  }

  const keys = axis === 'x' ? X_ANCHOR_KEYS : Y_ANCHOR_KEYS;
  const key = keys.find((candidate) => anchor[candidate] !== undefined);
  if (!key) {
    return null;
  }

  const value = anchor[key];
  if (value === undefined) {
    return null;
  }

  return parseAnchorValue(value, rect, axis);
};

const getLayoutRect = (definition: PrefabDefinition, input: ResolveLayoutInput): LayoutRect => {
  const fullRect = createFullRect(input.worldWidth, input.worldHeight);
  const space = definition.layout.space ?? DEFAULT_LAYOUT_SPACE;
  if (space === 'safe') {
    return createSafeRect(input.visibleWorldRect, input.sceneLayout?.safeMargin);
  }
  return fullRect;
};

const resolvePosition = (definition: PrefabDefinition, rect: LayoutRect): { x: number; y: number } => {
  const anchorX = resolveAnchorAxis(definition.layout.anchor, rect, 'x');
  const anchorY = resolveAnchorAxis(definition.layout.anchor, rect, 'y');
  const offsetX = definition.layout.offset?.x ?? 0;
  const offsetY = definition.layout.offset?.y ?? 0;
  const absoluteX = definition.layout.x ?? 0;
  const absoluteY = definition.layout.y ?? 0;

  const baseX = anchorX ?? rect.left + absoluteX;
  const baseY = anchorY ?? rect.top + absoluteY;

  return {
    x: baseX + offsetX,
    y: baseY + offsetY,
  };
};

export const resolvePrefabDefinition = (
  definition: PrefabDefinition,
  input: ResolveLayoutInput,
): ResolvedPrefabDefinition => {
  const rect = getLayoutRect(definition, input);
  const position = resolvePosition(definition, rect);

  return {
    type: definition.type,
    id: definition.id,
    x: position.x,
    y: position.y,
    properties: definition.properties,
    group: definition.group,
  };
};

export const resolvePrefabDefinitions = (
  definitions: PrefabDefinition[],
  input: ResolveLayoutInput,
): ResolvedPrefabDefinition[] => definitions.map((definition) => resolvePrefabDefinition(definition, input));
