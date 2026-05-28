# NavDesk Small Calculator I18N Smoke - 2026-05-28

**Task:** `BRK-MVP-QAUX-011`  
**Role:** QA/UX  
**Status:** For Review  
**Scope:** smoke for `FE-019` small-calculator i18n alias  
**Production:** untouched

## Summary

The `FE-019` smoke passed on `navdesk.html` in EN/RU.

No broader NavDesk functionality, visual redesign, print/PDF output or future language activation was tested in this task.

## Checks Run

Local server:

```text
php -S 127.0.0.1:4182 -t .
```

Headless Chrome pages:

```text
http://127.0.0.1:4182/navdesk.html?lang=en
http://127.0.0.1:4182/navdesk.html?lang=ru
```

## Observed Results

- EN: `<html lang="en" ... data-language-source="query">`
- RU: `<html lang="ru" ... data-language-source="query">`
- EN screen mode label: `Screen mode`
- RU screen mode label: `Режим экрана`
- EN small calculator status: `Enter any known values.`
- RU small calculator status: `Введите любые известные значения.`
- EN small calculator day label: `Time, d`
- RU small calculator day label: `Время, сут`
- EN copy button: `Copy summary`
- RU copy button: `Копировать итог`
- EN language panel title: `Language versions`
- RU language panel title: `Языковые версии`

## Result

Passed for this layer.

Residual risk:

- dynamic calculator value entry was not tested in this smoke;
- route/tides/watch/UKV tools were not part of this task;
- future target languages remain disabled and untested.
