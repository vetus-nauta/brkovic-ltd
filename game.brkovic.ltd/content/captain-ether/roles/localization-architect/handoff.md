# Localization Architect Handoff

## Activation Trigger

Use when Captain Ether or Maritime Games needs interface localization,
system-language detection, locale fallback decisions, or localization QA scope.

## Current Baseline

The public PWA interface is mostly hardcoded in Russian with English product
names in selected registry fields. Training content currently teaches Russian
source prompts into English Sea Speak answers.

Required PWA UI language set from Director/User consultation:

- English (`en`, product label `eng`)
- Russian (`ru`)
- German (`de`)
- Italian (`it`)
- Spanish (`es`, product label `esp`)
- Serbian/Montenegrin/Croatian shared Latin UI (`sr`, aliases `sr`, `me`,
  `hr`)
- Mandarin Chinese (`zh`)

Unsupported system languages must start in English.

## First Useful Task

Define and verify a locale-detection contract for the public PWA:
system language aliases, English fallback, localized static UI copy, registry
field fallback, login text, Captain Ether watch UI, Lost Oars, answer log
admin text, and a visible reminder that language follows system settings.

## Standing Rule

After the PWA localization foundation is active, every later implementation
task must state localization impact. UI copy must use i18n keys with English as
the fallback. Content growth must distinguish interface language from learner
source language and Sea Speak target English.
