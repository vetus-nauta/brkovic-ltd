# NavDesk Instruments: Anchor Watch Backlog

Date: 2026-06-05
Scope: future feature, not active in the current Location Plotter release.

## Product Intent

Anchor watch should become a compact monitoring mode inside the NavDesk Instruments PWA screen. It must not duplicate the visible GPS coordinates already shown in the location plotter.

## Desired Behavior

- User sets an anchor-watch radius.
- User applies the watch from the current phone GPS position.
- The panel shows drift distance from the fixed point.
- The panel warns when the vessel/device moves outside the selected radius.
- Alarm sound repeats until acknowledged.
- User can silence the alarm without clearing the watch.
- User can clear the fixed position and monitoring mode.
- User can set a new watch from the current position.

## Controls

Maximum two primary controls:

- One stateful control for setting/clearing the watch.
- One stateful control for silencing/resetting an active alarm.

Avoid extra button clusters.

## Technical Reality Check

PWA/browser implementation can use:

- `navigator.geolocation.watchPosition()` with `enableHighAccuracy: true`;
- screen wake lock where available;
- Web Audio / HTML audio for an in-page alarm;
- Notifications where user permission and platform behavior allow it.

Hard limitation:

- A browser PWA cannot guarantee reliable continuous GPS and audible alarm if the phone is locked, the screen sleeps, or the OS suspends the web app.
- For a critical alarm that must work in locked/background state, a native mobile app is the correct target.

## UI Copy Guardrail

Never sell this as a certified or sole safety device. Copy should say:

> Works while the panel is open and GPS remains active. Keep the device awake for reliable monitoring.
