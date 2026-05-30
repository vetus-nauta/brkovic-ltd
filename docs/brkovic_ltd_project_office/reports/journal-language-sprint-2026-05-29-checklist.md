# Языковой спринт — чек-лист и итог (2026-05-29)

## Что сделано (зелёное)
- [x] Локальный UI админки: кнопки AI-локализации больше не «залипают» в ошибке после временного сбоя.
  - Обновлён `js/admin-posts.js` (маршруты и статусы).
- [x] Proxy-доступы и allow-list для `/admin/posts/:id/translations*` и `/admin/journal-collections/:id/translations*` присутствуют.
- [x] Smoke-контур для translation в `tools/journal-admin-translation-smoke.sh` поддерживает multi-lang run (`TRIGGER_SMOKE=1`).
- [x] Проведена авторизованная проверки на проде на `BRK_ADMIN_EMAIL=vetus.nauta@gmail.com`:
  - логин в админку успешен;
  - GET/POST маршруты локалей для поста и многостраничной записи доступны (201/200);
  - multi-lang генерация `en,de,it,sr,zh,es` по одному id каждого типа проходит.

## Что ещё блокирует MVP-поток
- [ ] Остался техдолг инфраструктуры, не критичный для translation:
  - в `/journal-backend/node_modules` на бою отсутствует `exifread`, что видно по `stderr.log` (модуль нужен для GPS-метаданных в media-модуле).
  - это вызывает runtime ошибки при обращении к media-цепочке, но не влияет на текущий translation-сценарий.

### Последний факт-чек (2026-05-29 23:26 CEST)
- `tools/journal-admin-translation-smoke.sh` с:
  - `TRIGGER_SMOKE=1`
  - `BRK_ADMIN_EMAIL=vetus.nauta@gmail.com`
  - `POST_ID=11718191-e852-4db4-84fe-02b09e6ab717`
  - `COLLECTION_ID=ddfd23e6-1cad-4341-a5fe-cd2467213229`

  прошёл успешно:
  - Provider в ответе теперь `configured=true`, `providerMode="live"`, `liveGenerationAvailable=true`.
  - POST `/admin/posts/:id/translations/generate` => 201 (`post` + multi-lang).
  - POST `/admin/journal-collections/:id/translations/generate` => 201 (`collection` + multi-lang).
  - Авторизация по `vetus.nauta@gmail.com` валидна (`/auth/login` => 201).
  - `/api/health` => `200`.
  - `/api/health/translation` => `200`, body:
    - `{"configured":true,"providerMode":"live","liveGenerationAvailable":true,...}`
- `/api/admin/health`, `/api/admin/health/translation`, `/api/health/ai`, `/api/admin/health/ai` продолжают отсутствовать:
  - на бою они не объявлены и остаются вне обязательного MVP-гейта.

## Риски и последствия
- До включения live mode автоматическая генерация даёт черновики-заглушки (`[DE draft] ...`) вместо живой LLM-локализации.
- Миграции и схема backend есть в рабочем дереве, но не применены в боевом окружении.

## Рекомендуемая последовательность исполнения
1. Backend: сохранить live-конфиг и зафиксировать его в прод-процедуре деплоя, чтобы при перезапуске не отвалился ключ/режим.
2. Frontend QA: проверить только отображение статусов переводов и кнопку `Generate` после этого прод-деплоя (без изменений UI).
3. SEO/локализация: включить/показать целевые языки в меню только по готовности контента и/или после принятого аудита терминологии.
