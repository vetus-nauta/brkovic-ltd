import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('public/assets/app.js', 'utf8');
const marker = "const app = document.querySelector('#app');";
const setupSource = source.slice(0, source.indexOf(marker));

function runSetup(languages) {
  const sandbox = {
    console,
    document: {
      documentElement: {
        lang: '',
        dataset: {},
      },
      title: '',
      querySelector() {
        return { setAttribute() {} };
      },
    },
    navigator: {
      languages,
      language: languages[0],
    },
  };

  vm.createContext(sandbox);
  vm.runInContext(
    `${setupSource}
globalThis.__I18N = I18N;
globalThis.__SUPPORTED_LOCALES = SUPPORTED_LOCALES;
globalThis.__GAME_COPY = GAME_COPY;
globalThis.__DETECTED_LOCALE = locale;
globalThis.__DOCUMENT_LANG = document.documentElement.lang;`,
    sandbox,
  );
  return sandbox;
}

const sandbox = runSetup(['en-US']);

const { __I18N: i18n, __SUPPORTED_LOCALES: locales, __GAME_COPY: gameCopy } = sandbox;
const baseKeys = Object.keys(i18n.en).sort();
const baseGames = Object.keys(gameCopy.en).sort();
const gameFields = ['title', 'description', 'stage'];
let failed = false;

for (const locale of locales) {
  const localeKeys = Object.keys(i18n[locale] || {});
  const missingKeys = baseKeys.filter((key) => !localeKeys.includes(key));
  if (missingKeys.length) {
    failed = true;
    console.error(`${locale}: missing i18n keys: ${missingKeys.join(', ')}`);
  }

  for (const game of baseGames) {
    const copy = gameCopy[locale]?.[game];
    if (!copy) {
      failed = true;
      console.error(`${locale}: missing game copy for ${game}`);
      continue;
    }
    const missingFields = gameFields.filter((field) => !copy[field]);
    if (missingFields.length) {
      failed = true;
      console.error(`${locale}: ${game} missing fields: ${missingFields.join(', ')}`);
    }
  }
}

const detectionCases = [
  { languages: ['en-US'], locale: 'en', lang: 'en' },
  { languages: ['en-GB'], locale: 'en', lang: 'en' },
  { languages: ['ru-RU'], locale: 'ru', lang: 'ru' },
  { languages: ['de-DE'], locale: 'de', lang: 'de' },
  { languages: ['it-IT'], locale: 'it', lang: 'it' },
  { languages: ['es-ES'], locale: 'es', lang: 'es' },
  { languages: ['es-MX'], locale: 'es', lang: 'es' },
  { languages: ['sr-Latn-RS'], locale: 'sr', lang: 'sr-Latn' },
  { languages: ['sr-RS'], locale: 'sr', lang: 'sr-Latn' },
  { languages: ['hr-HR'], locale: 'sr', lang: 'sr-Latn' },
  { languages: ['me-ME'], locale: 'sr', lang: 'sr-Latn' },
  { languages: ['zh-CN'], locale: 'zh', lang: 'zh' },
  { languages: ['zh-TW'], locale: 'zh', lang: 'zh' },
  { languages: ['fr-FR'], locale: 'en', lang: 'en' },
  { languages: [], locale: 'en', lang: 'en' },
];

for (const testCase of detectionCases) {
  const result = runSetup(testCase.languages);
  if (result.__DETECTED_LOCALE !== testCase.locale || result.__DOCUMENT_LANG !== testCase.lang) {
    failed = true;
    console.error(
      `${testCase.languages.join(',') || '[empty]'}: expected ${testCase.locale}/${testCase.lang}, got ${result.__DETECTED_LOCALE}/${result.__DOCUMENT_LANG}`,
    );
  }
}

if (failed) {
  process.exit(1);
}

console.log(`PWA i18n ok: ${locales.length} locales, ${baseKeys.length} UI keys, ${baseGames.length} games, ${detectionCases.length} detection cases.`);
