# Language Sprint 02 Regression Smoke - 2026-05-28

**Task:** `BRK-MVP-QAUX-009`
**Status:** PASS

## Scope

Local server:

```text
php -S 127.0.0.1:4179 -t .
```

Checked pages:

```text
journal.html?lang=en
journal.html?lang=ru
```

Chrome headless DOM dumps were written temporarily to:

```text
/tmp/brkovic-journal-fe017-en.html
/tmp/brkovic-journal-fe017-ru.html
```

## Confirmed

English:

```text
<html lang="en" data-language-source="query">
aria-label="Open Nav Desk"
aria-label="Image viewer"
aria-label="Close"
aria-label="Previous"
aria-label="Next"
Language versions
```

Russian:

```text
<html lang="ru" data-language-source="query">
aria-label="Открыть штурманский стол"
aria-label="Просмотр изображения"
aria-label="Закрыть"
aria-label="Предыдущее"
aria-label="Следующее"
Языковые версии
```

Diagnostics after the sprint slice:

```text
missing keys: none
dictionary drift: none
broken pages: none
```

## Notes

Chrome emitted headless service warnings unrelated to page rendering. DOM dumps were produced and checks passed.

No production, FTP, backend, future language activation or owner content was touched.

