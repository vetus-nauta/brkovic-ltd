# BRK-MVP-FE-013. I18N Attribute Support

Дата: 2026-05-28  
Роль: Frontend/NavDesk Engineer  
Режим: точечная техническая правка, без редизайна

## 1. Задача

Добавить в общий frontend i18n-движок поддержку безопасных атрибутов, чтобы следующие задачи могли локализовать accessibility-подписи и подсказки без изменения layout и видимого текста.

## 2. Измененные файлы

- `js/language.js`
- `docs/brkovic_ltd_project_office/reports/frontend-i18n-attribute-support-2026-05-28.md`

## 3. Что сделано

В `applyTranslations()` добавлена поддержка:

- `data-i18n-aria-label` -> `aria-label`;
- `data-i18n-title` на обычных элементах -> `title`;
- `data-i18n-alt` -> `alt`.

Существующее поведение root-level `<html data-i18n-title data-i18n-description>` сохранено:

- `data-i18n-title` на `<html>` продолжает управлять `document.title`;
- `data-i18n-description` на `<html>` продолжает управлять meta description;
- `title` attribute на `<html>` не выставляется.

## 4. Что не менялось

- HTML/CSS/layout не менялись.
- Видимые тексты не менялись.
- `lang/ru.json` и `lang/en.json` не менялись.
- Языковая roadmap-модель не менялась.
- Planned languages не становились кликабельными.
- Production, FTP, backend, data, secrets и OpenAI key не трогались.

## 5. Проверки

```bash
node --check js/language.js
```

Результат: passed.

```bash
node -e "const fs=require('fs'); for (const f of ['lang/ru.json','lang/en.json']) JSON.parse(fs.readFileSync(f,'utf8')); console.log('json ok')"
```

Результат: `json ok`.

DOM smoke через Node VM с минимальным DOM:

- `document.title` обновляется через `<html data-i18n-title>`;
- meta description обновляется через `<html data-i18n-description>`;
- `title` attribute на `<html>` не появляется;
- `data-i18n-aria-label` ставит `aria-label`;
- `data-i18n-title` на обычном элементе ставит `title`;
- `data-i18n-alt` ставит `alt`;
- существующий `data-i18n-placeholder` не сломан.

Результат: `dom smoke ok`.

```bash
git diff --check -- js/language.js docs/brkovic_ltd_project_office/reports/frontend-i18n-attribute-support-2026-05-28.md
```

Результат: passed.

## 6. Остаточный риск

Низкий. Это только расширение существующего `applyTranslations()` без использования новых атрибутов в HTML. Фактическая локализация `aria-label`, `title` и `alt` должна идти отдельными маленькими задачами с QA по страницам.

## 7. Director Review

Director повторно проверил патч:

- `node --check js/language.js` - passed;
- JSON parse `lang/ru.json`, `lang/en.json` - passed;
- `git diff --check` по `js/language.js`, task/report/control files - passed;
- независимый Node VM DOM smoke - `dom smoke ok`.

Проверено, что `data-i18n-title` на `<html>` продолжает управлять `document.title`, а обычные элементы с `data-i18n-title` получают атрибут `title`. Атрибут `title` на `<html>` не ставится.
