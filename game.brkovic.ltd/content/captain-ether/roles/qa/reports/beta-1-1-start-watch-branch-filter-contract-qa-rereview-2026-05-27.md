# Повторная QA-проверка контракта Beta 1.1 Start-Watch Branch Filter

Дата: 2026-05-27  
Роль: QA / Captain Ether  
Задача: TASK-CE-0005  
Режим: report-only

## Для Director Ether

QA повторно проверила revised contract после TASK-CE-0004 и сверила его с
замечаниями TASK-CE-0003.

Итог: PASS. Замечания TASK-CE-0003 закрыты достаточно, чтобы после принятия
этого отчета назначить будущую узкую hidden/internal implementation-задачу для
`start-watch` branch filter.

Что конкретно подтверждено:

- invalid `mode` теперь имеет тестируемый controlled error;
- underfilled focused pool теперь имеет тестируемый hard reject;
- `focused_module` явно unavailable для первой реализации;
- branch/level success-reject fixtures теперь есть и пригодны для QA;
- 32-case QA smoke matrix принята как minimum local QA gate;
- публичный UI selector, production smoke, deploy/FTP, router/registry,
  auth/platform и content-data backfill не утверждаются.

## Статус

PASS для будущей скрытой/internal implementation-задачи после принятия
Director Ether.

Замечания QA из TASK-CE-0003 закрыты достаточно, чтобы Director Ether мог
назначить узкую задачу на реализацию контракта `start-watch` без UI, production,
deploy, router/registry, auth/platform и content-data изменений, если эта задача
сохранит 32-case QA smoke matrix как обязательный локальный gate.

Публичный branch selector, production smoke, metadata backfill для legacy items
и UI payload-решения этим PASS не утверждаются.

## Проверенные входы

- `content/captain-ether/roles/qa/reports/beta-1-1-start-watch-branch-filter-contract-qa-review-2026-05-27.md`
- `content/captain-ether/roles/director-engineer/reports/task-ce-0003-qa-contract-review-accepted-2026-05-27.md`
- `content/captain-ether/roles/director-engineer/reports/beta-1-1-start-watch-branch-filter-contract-2026-05-27.md`
- обязательные Game Director / Captain Ether / QA правила из задания
- `content/captain-ether/answer-policy.md`
- `content/captain-ether/accept-reject-qa-pairs.json`

## Решение По Пунктам

### Invalid Mode

PASS.

Поведение теперь тестируемо. Контракт явно говорит, что invalid `mode` должен
вернуть controlled error, не должен fallback-иться в `mixed`, не должен создавать
watch session и не должен мутировать progress/session/log state. Это закрывает
QA finding из TASK-CE-0003.

### Underfilled Hard Reject

PASS.

Поведение теперь тестируемо. Контракт закрепляет hard reject для первого
hidden/internal focused request и описывает error shape:

```json
{
  "ok": false,
  "error": "branch_watch_unavailable",
  "reason": "Focused watch pool is below threshold",
  "required_mode": "mixed"
}
```

Также добавлено mutation rule:

- watch session не создается;
- `progress.last_level` не меняется;
- Lost Oars не создаются и не резолвятся;
- answer-log entry не создается;
- player-visible review artifact не создается;
- error response не раскрывает raw input, player identity, session, CSRF,
  accepted answers, QA notes или debug fields.

### Focused Module Unavailable

PASS.

Контракт теперь достаточно явный: `focused_module` недоступен в первой
branch-filter реализации даже при наличии module metadata. Missing branch,
missing module, invalid module и below-threshold module должны возвращать
controlled unavailable response без session/progress/log mutation.

Этого достаточно для QA smoke cases 19-22.

### Branch/Level Success-Reject Fixtures

PASS.

Контракт добавил достаточную hidden/internal fixture table:

- `core_radio`: success на beginner/intermediate/advanced;
- `marina_harbour`: success на beginner/intermediate/advanced;
- `navigation_reports`: success на beginner/intermediate/advanced;
- `safety_securite`: beginner reject, intermediate/advanced success;
- `traffic_collision`, `urgency_panpan`, `distress_mayday`,
  `onboard_operations`, `vts_port_control`, `review_minimal_pairs`: reject на
  всех уровнях.

QA сможет отличить корректный hard reject от silent fallback или underfilled
mixed watch.

### 32-Case QA Smoke Matrix

PASS.

Контракт принял 32-case matrix из TASK-CE-0003 как minimum local QA gate. Matrix
достаточно полная для первой hidden/internal реализации, потому что покрывает:

- mixed baseline для beginner/intermediate/advanced;
- absent `mode` со stray `branch`/`module`;
- `mode: mixed` с ignored filters;
- legacy unbranched eligibility в mixed;
- weak-heavy mixed quota;
- invalid mode;
- focused_branch required/invalid branch;
- focused_branch success, order, membership, weak priority и cross-branch review;
- underfilled hard reject и mutation safety;
- focused_module unavailable cases;
- success/error payload privacy;
- submit/finish/progress/Lost Oars/answer-log compatibility;
- branch matcher samples, dangerous pairs и общий regression command.

## Оставшиеся Кейсы

Нет блокирующих missing cases для hidden/internal implementation task.

Оставшиеся пункты являются условиями будущего implementation task или отдельных
решений, а не блокером этого контракта:

- implementation task должен описать локальную fixture setup для weak-heavy,
  selected-branch weak, cross-branch weak и mutation-safety проверок;
- public branch selector требует отдельного Director/UI/API решения;
- production smoke требует отдельного Game Director решения;
- metadata backfill для 40 unbranched legacy starter items нужен только перед
  публичной UI-экспозицией или отдельной content-data задачей.

## Риски, Которые Должны Остаться В Implementation Gate

- Mixed baseline не должен измениться: `12/16/20`, текущая response shape,
  progressive order, weak quota и legacy unbranched eligibility.
- Focused branch не должен silently fallback-иться в mixed.
- Error responses не должны раскрывать player identity, session, CSRF, accepted
  answers, QA notes или debug fields.
- Branch/module поля не должны появляться в player-facing question payload до
  отдельного UI/API payload решения.
- Dangerous minimal pairs должны оставаться точными, особенно для навигации,
  Safety/Securite, numeric/time/channel/direction/signal случаев.

## Можно Ли Назначать Implementation

Да, после принятия этого QA re-review Director Ether может назначить будущую
узкую hidden/internal implementation-задачу.

Ограничения для такой задачи:

- только контракт `start-watch` и необходимые локальные проверки;
- без публичного UI selector;
- без production/deploy/FTP;
- без router/registry/auth/platform;
- без Watch Officer/Nav Desk;
- без content-data/backfill, если это не будет отдельным явно разрешенным
  заданием;
- обязательный локальный QA gate по 32-case matrix перед любым дальнейшим
  решением.

## Scope Preserved

- Report-only mode.
- Runtime/API files не изменялись.
- UI files не изменялись.
- `starter.json` не изменялся.
- Batch JSON не изменялись.
- Matcher не изменялся.
- Router/registry не изменялись.
- Auth/platform не изменялись.
- Watch Officer не изменялся.
- Nav Desk не изменялся.
- Game Director docs не изменялись.
- Production config и deploy/FTP state не трогались.
- Secrets, cookies, sessions, CSRF, player email, player identity, private
  config и `.netrc` не трогались и не выводились.

## Checks

Tests: not run; documentation-only QA re-review.

## Copy-Ready Handoff For Director Ether

```text
QA re-review for TASK-CE-0005: PASS.
TASK-CE-0003 findings are resolved enough for Director Ether to assign a future
hidden/internal start-watch branch-filter implementation task after accepting
this report. Invalid mode, underfilled hard reject, focused_module unavailable
behavior, branch/level fixtures, mutation safety, privacy checks, and the
32-case QA smoke matrix are now explicit enough to test.
This does not approve public UI selector, production smoke, deploy/FTP,
router/registry/auth/platform, content-data backfill, Watch Officer, or Nav Desk
work.
```
