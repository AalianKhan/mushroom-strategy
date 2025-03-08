import {HomeAssistant} from "./types/homeassistant/types";
import * as en from "./translations/en.json";
import * as es from "./translations/es.json";
import * as nl from "./translations/nl.json";
import * as de from "./translations/de.json";

/* Registry of currently supported languages */
const languages: Record<string, unknown> = {
  en,
  es,
  nl,
  de,
};

/* The fallback language if the user-defined language isn't defined */
const DEFAULT_LANG = "en";

/**
 * Get a string by keyword and language.
 *
 * @param {string} key The keyword to look for in object notation (E.g. generic.home).
 * @param {string} lang The language to get the string from (E.g. en).
 *
 * @return {string | undefined} The requested string or undefined if the keyword doesn't exist/on error.
 */
function getTranslatedString(key: string, lang: string): string | undefined {
  try {
    return key
      .split(".")
      .reduce(
        (o, i) => (o as Record<string, unknown>)[i],
        languages[lang]
      ) as string;
  } catch (_) {

    return undefined;
  }
}

/**
 * Set up the localization.
 *
 * It reads the user-defined language with a fall-back to english and returns a function to get strings from
 * language-files by keyword.
 *
 * If the keyword is undefined, or on error, the keyword itself is returned.
 *
 * @param {HomeAssistant} hass The Home Assistant object.
 * @return {(key: string) => string} The function to call for translating strings.
 */
export default function setupCustomLocalize(hass?: HomeAssistant): (key: string) => string {
  return function (key: string) {
    const lang = hass?.locale.language ?? DEFAULT_LANG;

    let translated = getTranslatedString(key, lang);
    if (!translated) translated = getTranslatedString(key, DEFAULT_LANG);

    return translated ?? key;
  };
}
