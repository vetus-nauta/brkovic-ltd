# Language Interactive Smoke - 2026-05-28

**Task:** `BRK-MVP-QAUX-008`
**Owner:** Director-run QA smoke
**Status:** PASS

## Scope

Local server:

```text
php -S 127.0.0.1:4178 -t .
```

Interactive Chrome smoke was run through the Chrome DevTools Protocol with a fresh temporary browser profile.

Checked pages:

```text
index.html
navdesk.html?lang=en
navdesk-route.html?lang=en
navdesk-route.html?lang=ru
```

## Verdict

The remaining interactive language-layer gaps from `QAUX-007` are closed.

Confirmed:

- system-language hint appears on a fresh profile;
- on this machine the browser system language resolves as `ru-RU`, so the page initializes as Russian with `data-language-source="system"`;
- the hint explains that language was selected by device settings and can be changed in the menu under language versions;
- hint close button removes the hint;
- dismissal persists with `HINT_VERSION=2026-05-28-language-access`;
- NavDesk night mode is stored as `navdesk_watch_theme_v1=night`;
- NavDesk night mode survives reload;
- route place search inserts mocked Kotor coordinates in EN and RU;
- dynamic route status uses translated runtime labels in EN and RU.

## Evidence

Language hint:

```text
lang: ru
source: system
navigatorLanguage: ru-RU
text: Язык выбран автоматически по настройкам устройства. Изменить его можно в меню в разделе «Языковые версии». / Понятно
stored: 2026-05-28-language-access
after close/reload: hint absent
```

NavDesk night persistence:

```text
stored: night
bodyClass after reload: navdesk-theme-night notranslate
```

Route search English:

```text
Coordinates inserted: Kotor, Montenegro · Coordinates: 42° 25.482' N / 018° 46.272' E
```

Route search Russian:

```text
Координаты вставлены: Kotor, Montenegro · Координаты: 42° 25.482' N / 018° 46.272' E
```

Coordinates were mocked inside the browser test to avoid unnecessary live geocoder dependency during language QA.

## Notes

This task did not redesign UI and did not enable future languages.

No production, FTP, backend, or secret surfaces were touched.

The temporary automation result was written to:

```text
/tmp/brkovic-navdesk-interactive-language-smoke.json
```

It is not a release artifact.

## Next Step

Frontend can continue with the next small language migration layer. The next sensible unit is `FE-017`: migrate another narrow set of safe JavaScript-generated UI strings, then run `tools/i18n-diagnostics.mjs` and this QA pattern again.
