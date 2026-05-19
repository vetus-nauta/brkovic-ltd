# BRKOVIC Yacht Management Roadmap

Date: 2026-05-19

## Current Source Of Truth

The management service catalog, public calculator, admin editor, and document drafts must use the same file:

```text
data/management-pricing.json
```

The public page is:

```text
services/yacht-management.html
```

The management admin entry point is:

```text
admin-mnr.html
```

## Completed In This Checkpoint

- Admin and public management page now read the same pricing catalog.
- Admin supports monthly add-on services and one-time services.
- Admin can add and remove non-core services.
- Public visibility is controlled from admin service records.
- Local diagnostics show auth state and write permissions for `data/management-pricing.json`.
- The main `brkovic.ltd` project was split from Revoyacht experiments.

## Next Implementation Steps

1. Projects:
   Save each client draft as a project in admin, including yacht data, selected monthly services, selected one-time services, discounts, notes, and generated document numbers.

2. Public demo documents:
   On the public page, generate two printable/saveable demo documents:
   - monthly services proforma
   - one-time services proforma

3. Admin commercial documents:
   In admin, generate the full offer or service agreement with two final proformas tied by document numbers to the agreement.

4. Commitments:
   Store client commitments, issued proformas, and prepared contracts so later offers can be resumed, duplicated, or revised.

## Guardrails

- Do not split management prices between hardcoded page content and admin state.
- Do not commit `forms/config.php`; use `forms/config.example.php`.
- Keep Revoyacht experiments outside the main `brkovic.ltd` repository unless they are intentionally moved to a separate branch.

