# Language Sprint 02 Delivery Smoke - 2026-05-28

**Task:** `BRK-MVP-QAUX-010`  
**Role:** QA/UX  
**Status:** For Review  
**Scope:** browser smoke for `FE-018` language-layer extraction  
**Production:** untouched

## Summary

The `FE-018` browser smoke passed for the checked EN/RU surfaces.

No future language became active in this smoke. The task did not review redesign or broader UX.

## Checks Run

Local server:

```text
php -S 127.0.0.1:4181 -t .
```

Headless Chrome pages:

```text
http://127.0.0.1:4181/journal.html?lang=en
http://127.0.0.1:4181/journal.html?lang=ru
http://127.0.0.1:4181/services/yacht-acceptance-delivery.html?lang=en
http://127.0.0.1:4181/services/yacht-acceptance-delivery.html?lang=ru
```

Journal was checked with `--virtual-time-budget=5000`, because the language/app boot sequence is asynchronous.

## Observed Results

Journal:

- EN: `<html lang="en" ... data-language-source="query">`
- RU: `<html lang="ru" ... data-language-source="query">`
- EN NavDesk aria label: `Open Nav Desk`
- RU NavDesk aria label: `Открыть штурманский стол`
- EN lightbox aria label: `Image viewer`
- RU lightbox aria label: `Просмотр изображения`
- EN language panel title: `Language versions`
- RU language panel title: `Языковые версии`

Delivery page:

- EN initial summary: `Enter sea distance to see the estimate.`
- RU initial summary: `Укажите морскую дистанцию, чтобы увидеть расчет.`
- EN speed helper: `Calculation speed: 6 kn`
- RU speed helper: `Скорость в расчете: 6 уз.`
- EN crew helper: `Crew: usually skipper only; second crew member by task, weather and route.`
- RU crew helper: `Экипаж: обычно шкипер; второй человек по задаче, погоде и маршруту.`

## Result

Passed for this layer.

Residual risk:

- This smoke does not approve future target languages.
- This smoke does not test route lookup API behavior.
- This smoke does not test owner/commercial copy quality; `FE-018` preserved current text only.
