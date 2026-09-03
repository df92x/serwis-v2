# SERWIS v2 rewrite — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Odtworzyć serwis ROW-POL w nowym projekcie Vite+React, z migracją danych ze starej appki, bez ruszania folderu `SERWIS`.

**Architecture:** Warstwy `app` / `domain` / `data` / `ui` / `integrations`. Jedno źródło prawdy zlecenia. Stare klucze localStorage.

**Tech stack:** Vite 8, React 19, TypeScript, Vitest.

---

## File map

| Path | Responsibility |
|---|---|
| `src/data/keys.ts` | stałe kluczy localStorage |
| `src/domain/order.ts` | typy zlecenia i status |
| `src/app/screens.ts` | nazwy ekranów |
| `src/app/AppShell.tsx` | menu + placeholder ekrany |
| `docs/superpowers/specs/2026-09-03-serwis-v2-rewrite-design.md` | design |

---

### Task 1: Szkielet i menu (DONE w bootstrapie)

- [x] Vite + React + TS
- [x] Foldery warstw
- [x] Menu główne placeholder
- [ ] `npm run dev` działa lokalnie

### Task 2: Model danych + migracja

- [ ] Typy `Order`, `RaportKoncowy`, `OrderState`
- [ ] `data/storage.ts` odczyt/zapis historii z tych samych kluczy
- [ ] Test: parsowanie przykładowego wpisu `wycena-history`

### Task 3: Przyjęcie zlecenia

- [ ] Modal klienta + lista usług (cennik DEFAULTS)
- [ ] Zapis do `wycena-history`
- [ ] Lista Przyjęte

### Task 4: EDYTUJ / NAPRAWA / wydanie

- [ ] EDYTUJ bez reloadu, hydrate slim state
- [ ] Raport końcowy, WYDAJ, archiwum, kosz
- [ ] Szkic tylko przy `visibilitychange` na formularzu

### Task 5: Sync i raporty

- [ ] Google Drive merge (logika `_pickMergeWinner`)
- [ ] PNG/PDF, rabaty, kalkulatory, PWA, Update App

---

## Test plan

- Import backupu ze starej appki  
- Przyjęte → EDYTUJ → dane widoczne  
- Minimalizacja vs zwykłe otwarcie  
- Stary `SERWIS` nadal odpalalny osobno  
