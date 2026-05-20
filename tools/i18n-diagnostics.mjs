import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const publicPages = [
  "404.html",
  "index.html",
  "journal.html",
  "navdesk.html",
  ...readdirSync(join(root, "services"))
    .filter((file) => file.endsWith(".html"))
    .map((file) => `services/${file}`),
];

function readText(file) {
  return readFileSync(join(root, file), "utf8");
}

function readJson(file) {
  return JSON.parse(readText(file));
}

function collectI18nKeys(html) {
  const keys = new Set();
  const patterns = [
    /data-i18n(?:-[a-z]+)?="([^"]+)"/g,
    /data-i18n-title="([^"]+)"/g,
    /data-i18n-description="([^"]+)"/g,
  ];
  patterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(html))) keys.add(match[1]);
  });
  return keys;
}

const ru = readJson("lang/ru.json");
const en = readJson("lang/en.json");
const ruKeys = new Set(Object.keys(ru));
const enKeys = new Set(Object.keys(en));
const usedKeys = new Set();

const pageReport = publicPages.map((page) => {
  const html = readText(page);
  collectI18nKeys(html).forEach((key) => usedKeys.add(key));
  return {
    page,
    languageJs: /(?:\.\.\/)?js\/language\.js/.test(html),
    mainJs: /(?:\.\.\/)?js\/main\.js/.test(html),
    noTranslate: /translate="no"/.test(html) && /name="google" content="notranslate"/.test(html),
  };
});

function missingFrom(targetKeys) {
  return [...usedKeys].filter((key) => !targetKeys.has(key)).sort();
}

function keyDiff(a, b) {
  return [...a].filter((key) => !b.has(key)).sort();
}

const result = {
  pages: pageReport,
  usedKeys: usedKeys.size,
  missingInRu: missingFrom(ruKeys),
  missingInEn: missingFrom(enKeys),
  ruOnly: keyDiff(ruKeys, enKeys),
  enOnly: keyDiff(enKeys, ruKeys),
};

console.log(JSON.stringify(result, null, 2));

const brokenPages = pageReport.filter((page) => !page.noTranslate || (page.page !== "404.html" && (!page.languageJs || !page.mainJs)));
if (brokenPages.length || result.missingInRu.length || result.missingInEn.length) {
  process.exitCode = 1;
}
