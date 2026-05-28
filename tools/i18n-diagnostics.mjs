import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const args = new Set(process.argv.slice(2));
const outIndex = process.argv.indexOf("--out");
const outFile = outIndex >= 0 ? process.argv[outIndex + 1] : "";
const outputMarkdown = args.has("--markdown") || Boolean(outFile);

const navdeskPages = [
  "navdesk.html",
  "navdesk-watch.html",
  "navdesk-tides.html",
  "navdesk-route.html",
  "navdesk-ukv.html",
  "navdesk-english.html",
];

const servicePages = readdirSync(join(root, "services"))
  .filter((file) => file.endsWith(".html"))
  .sort()
  .map((file) => `services/${file}`);

const jsFiles = readdirSync(join(root, "js"))
  .filter((file) => file.endsWith(".js"))
  .sort()
  .map((file) => `js/${file}`);

const publicPages = [
  "404.html",
  "index.html",
  "journal.html",
  ...navdeskPages,
  ...servicePages,
];

function readText(file) {
  return readFileSync(join(root, file), "utf8");
}

function readJson(file) {
  return JSON.parse(readText(file));
}

function collectI18nKeys(html) {
  const keys = new Map();
  const pattern = /\s(data-i18n(?:-[a-z]+(?:-[a-z]+)*)?)="([^"]+)"/g;
  let match;
  while ((match = pattern.exec(html))) {
    const [, attr, key] = match;
    if (!keys.has(key)) keys.set(key, new Set());
    keys.get(key).add(attr);
  }
  return keys;
}

function collectJsI18nKeys(source, file, knownDictionaryKeys) {
  const keys = collectI18nKeys(source);
  const directCallPattern = /\b(?:window\.t|translatedText)\(\s*["']([^"']+)["']/g;
  let match;
  while ((match = directCallPattern.exec(source))) {
    const key = match[1];
    if (!keys.has(key)) keys.set(key, new Set());
    keys.get(key).add("js-call");
  }

  const hasGlobalDictionary = /window\.__BRKOVIC_TRANSLATIONS|window\.BRKOVIC_LANGUAGE|currentTranslations/.test(source);
  const hasLocalNavdeskDictionary = file === "js/navdesk.js";
  if (hasGlobalDictionary && !hasLocalNavdeskDictionary) {
    const wrapperCallPattern = /\b(?:t|tf|tr|tUi)\(\s*["']([^"']+)["']/g;
    while ((match = wrapperCallPattern.exec(source))) {
      const key = match[1];
      if (!keys.has(key)) keys.set(key, new Set());
      keys.get(key).add("js-call");
    }
  }

  const literalPattern = /["']([a-z][a-z0-9_]+)["']/g;
  while ((match = literalPattern.exec(source))) {
    const key = match[1];
    if (!knownDictionaryKeys.has(key)) continue;
    if (!keys.has(key)) keys.set(key, new Set());
    keys.get(key).add("js-literal");
  }

  return keys;
}

function registerKey(target, key, attrs, source) {
  if (!target.has(key)) target.set(key, { attributes: new Set(), pages: new Set() });
  const usage = target.get(key);
  attrs.forEach((attr) => usage.attributes.add(attr));
  usage.pages.add(source);
}

function pageBucket(page) {
  if (page === "404.html") return "system";
  if (page.startsWith("services/")) return "services";
  if (page.startsWith("navdesk")) return "navdesk";
  if (page === "journal.html") return "journal";
  return "site";
}

function keyDiff(a, b) {
  return [...a].filter((key) => !b.has(key)).sort();
}

function attrSummary(entries) {
  const counts = {};
  for (const entry of entries) {
    for (const attr of entry.attributes) counts[attr] = (counts[attr] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

function markdownList(items) {
  if (!items.length) return "- none";
  return items.map((item) => `- ${item}`).join("\n");
}

const dictionaries = Object.fromEntries(
  readdirSync(join(root, "lang"))
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => [file.replace(/\.json$/, ""), readJson(`lang/${file}`)]),
);

const dictionaryKeys = Object.fromEntries(
  Object.entries(dictionaries).map(([lang, dict]) => [lang, new Set(Object.keys(dict))]),
);
const knownDictionaryKeys = new Set(Object.values(dictionaryKeys).flatMap((keys) => [...keys]));

const usedKeys = new Map();
const htmlUsedKeys = new Set();
const jsUsedKeys = new Set();
const pageReport = publicPages.map((page) => {
  const html = readText(page);
  const pageKeys = collectI18nKeys(html);
  for (const [key, attrs] of pageKeys.entries()) {
    htmlUsedKeys.add(key);
    registerKey(usedKeys, key, attrs, page);
  }
  return {
    page,
    bucket: pageBucket(page),
    languageJs: /(?:\.\.\/)?js\/language\.js/.test(html),
    mainJs: /(?:\.\.\/)?js\/main\.js/.test(html),
    noTranslate: /translate="no"/.test(html) && /name="google" content="notranslate"/.test(html),
    keys: pageKeys.size,
    attributes: attrSummary([...pageKeys.entries()].map(([, attributes]) => ({ attributes }))),
  };
});

const jsReport = jsFiles.map((file) => {
  const source = readText(file);
  const fileKeys = collectJsI18nKeys(source, file, knownDictionaryKeys);
  for (const [key, attrs] of fileKeys.entries()) {
    jsUsedKeys.add(key);
    registerKey(usedKeys, key, attrs, file);
  }
  return {
    file,
    keys: fileKeys.size,
    attributes: attrSummary([...fileKeys.entries()].map(([, attributes]) => ({ attributes }))),
  };
});

const usedKeySet = new Set(usedKeys.keys());
const keyEntries = [...usedKeys.entries()]
  .map(([key, usage]) => ({
    key,
    attributes: [...usage.attributes].sort(),
    pages: [...usage.pages].sort(),
  }))
  .sort((a, b) => a.key.localeCompare(b.key));

const missingByLang = Object.fromEntries(
  Object.entries(dictionaryKeys).map(([lang, keys]) => [lang, keyDiff(usedKeySet, keys)]),
);

const htmlUnusedByLang = Object.fromEntries(
  Object.entries(dictionaryKeys).map(([lang, keys]) => [lang, keyDiff(keys, htmlUsedKeys)]),
);

const unusedByLang = Object.fromEntries(
  Object.entries(dictionaryKeys).map(([lang, keys]) => [lang, keyDiff(keys, usedKeySet)]),
);

const dictionaryDrift = {};
for (const [lang, keys] of Object.entries(dictionaryKeys)) {
  dictionaryDrift[lang] = {};
  for (const [otherLang, otherKeys] of Object.entries(dictionaryKeys)) {
    if (lang === otherLang) continue;
    dictionaryDrift[lang][`missingFrom${otherLang.toUpperCase()}`] = keyDiff(keys, otherKeys);
  }
}

const brokenPages = pageReport.filter((page) => {
  const allowsNoScripts = page.page === "404.html";
  const missingScripts = !allowsNoScripts && (!page.languageJs || !page.mainJs);
  return !page.noTranslate || missingScripts;
});

const result = {
  pages: pageReport,
  jsFiles: jsReport,
  languages: Object.keys(dictionaries),
  htmlUsedKeys: htmlUsedKeys.size,
  jsUsedKeys: jsUsedKeys.size,
  usedKeys: usedKeys.size,
  attributeCounts: attrSummary(keyEntries),
  missingByLang,
  htmlUnusedByLang,
  unusedByLang,
  dictionaryDrift,
  keyUsage: keyEntries,
  brokenPages,
};

function toMarkdown(data) {
  const missingLines = Object.entries(data.missingByLang).flatMap(([lang, keys]) =>
    keys.map((key) => `- ${lang}: \`${key}\``),
  );
  const driftLines = Object.entries(data.dictionaryDrift).flatMap(([lang, buckets]) =>
    Object.entries(buckets).flatMap(([bucket, keys]) => keys.map((key) => `- ${lang}.${bucket}: \`${key}\``)),
  );
  const pageRows = data.pages
    .map((page) => {
      const scripts = page.page === "404.html"
        ? "technical"
        : page.languageJs && page.mainJs
          ? "ok"
          : "missing";
      return `| \`${page.page}\` | ${page.bucket} | ${page.keys} | ${scripts} | ${page.noTranslate ? "ok" : "missing"} |`;
    })
    .join("\n");
  const jsRows = data.jsFiles
    .map((file) => `| \`${file.file}\` | ${file.keys} |`)
    .join("\n");
  const attrRows = Object.entries(data.attributeCounts)
    .map(([attr, count]) => `| \`${attr}\` | ${count} |`)
    .join("\n");
  const unusedRows = Object.entries(data.unusedByLang)
    .map(([lang, keys]) => `| ${lang} | ${data.htmlUnusedByLang[lang].length} | ${keys.length} |`)
    .join("\n");

  return `# I18N Diagnostics - 2026-05-28

**Tool:** \`tools/i18n-diagnostics.mjs\`
**Scope:** public static shell pages, services and NavDesk pages
**Languages found:** ${data.languages.map((lang) => `\`${lang}\``).join(", ")}

## Summary

- Public pages scanned: ${data.pages.length}
- JavaScript files scanned: ${data.jsFiles.length}
- HTML i18n keys used: ${data.htmlUsedKeys}
- JS i18n keys referenced: ${data.jsUsedKeys}
- Total i18n keys referenced: ${data.usedKeys}
- Broken page shell checks: ${data.brokenPages.length}
- Missing keys in active dictionaries: ${missingLines.length}

## Attribute Coverage

| Attribute | Used keys |
| --- | ---: |
${attrRows}

## Page Coverage

| Page | Bucket | Keys | Language scripts | No-translate guard |
| --- | --- | ---: | --- | --- |
${pageRows}

## JavaScript Coverage

| File | Referenced keys |
| --- | ---: |
${jsRows}

## Missing Keys

${markdownList(missingLines)}

## Dictionary Drift

${markdownList(driftLines)}

## Unused Key Review

HTML-unused keys may still be used by JavaScript-generated UI. Total-unused keys are better cleanup candidates, but still require review before deletion.

| Language | HTML-unused keys | Total-unused keys |
| --- | ---: | ---: |
${unusedRows}

## Director Note

This diagnostic is a gate for the language sprint. A step can add new static i18n surfaces only if this tool stays green for the active dictionaries.
`;
}

const output = outputMarkdown ? toMarkdown(result) : JSON.stringify(result, null, 2);

if (outFile) {
  writeFileSync(join(root, outFile), output.endsWith("\n") ? output : `${output}\n`);
  console.log(`Wrote ${outFile}`);
} else {
  console.log(output);
}

const hasMissingKeys = Object.values(missingByLang).some((keys) => keys.length);
const hasDictionaryDrift = Object.values(dictionaryDrift).some((buckets) =>
  Object.values(buckets).some((keys) => keys.length),
);

if (brokenPages.length || hasMissingKeys || hasDictionaryDrift) {
  process.exitCode = 1;
}
