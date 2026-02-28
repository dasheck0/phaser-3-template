type TranslationValues = Record<string, string>;
type TranslationParams = Record<string, string | number>;

const LOCALE_PATH = "/data/locales";
let activeLocale = "en";
let translations: TranslationValues = {};

const toLocaleOrNull = (value: string | null | undefined): string | null => {
	if (!value) {
		return null;
	}

	const normalized = value.trim().toLowerCase();
	if (!normalized) {
		return null;
	}

	return normalized.split("-")[0] || null;
};

const normalizeLocale = (value: string | null | undefined): string => {
	const normalized = toLocaleOrNull(value);
	if (!normalized) {
		throw new Error("[i18n] Locale is required");
	}

	return normalized;
};

const interpolate = (template: string, params?: TranslationParams): string => {
	if (!params) {
		return template;
	}

	return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => {
		const value = params[key];
		return value === undefined ? `{${key}}` : String(value);
	});
};

const loadLocaleFile = async (locale: string): Promise<TranslationValues> => {
	const response = await fetch(`${LOCALE_PATH}/${locale}.json`);
	if (!response.ok) {
		throw new Error(
			`[i18n] Failed to load locale "${locale}" (${response.status})`,
		);
	}

	const payload = (await response.json()) as unknown;
	if (!payload || typeof payload !== "object") {
		throw new Error(`[i18n] Locale payload for "${locale}" is invalid`);
	}

	const values: TranslationValues = {};
	for (const [key, value] of Object.entries(payload)) {
		if (typeof value === "string") {
			values[key] = value;
		}
	}

	return values;
};

export const getLocale = (): string => activeLocale;

export const setLocale = async (locale: string): Promise<void> => {
	const normalizedLocale = normalizeLocale(locale);
	translations = await loadLocaleFile(normalizedLocale);
	activeLocale = normalizedLocale;
};

export const initializeI18n = async (locale: string): Promise<void> =>
	setLocale(locale);

export const t = (key: string, params?: TranslationParams): string => {
	const normalizedKey = key.trim();
	if (!normalizedKey) {
		console.warn("[i18n] Empty translation key");
		return "__missing:empty-key__";
	}

	const template = translations[normalizedKey];
	if (!template) {
		console.warn(
			`[i18n] Missing translation key "${normalizedKey}" for locale "${activeLocale}"`,
		);
		return `__missing:${normalizedKey}__`;
	}

	return interpolate(template, params);
};
