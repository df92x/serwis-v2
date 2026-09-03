# SERWIS v2 — przebudowa od zera

Data: 2026-09-03  
Status: zatwierdzony (stary projekt `SERWIS` zostaje nietknięty)

## Cel

Nowa aplikacja serwisu rowerowego ROW-POL z **tą samą funkcjonalnością**, prostszym kodem i mniejszą liczbą bugów.

Stary projekt: `C:\Users\flint\Desktop\AI PROJEKTY\SERWIS` — **backup produkcyjny, bez zmian**.

Nowy projekt: `C:\Users\flint\Desktop\AI PROJEKTY\SERWIS-v2` — Vite + React + TypeScript.

## Zasady

- Produkcja zostaje na starej appce, dopóki v2 nie przejdzie checklisty na telefonie.
- Format danych localStorage / backup / Drive: **kompatybilny wstecz** (migracja, nie „nowy świat”).
- Jedno źródło prawdy per zlecenie (nie rozjeżdżać `state` vs `raportKoncowy`).
- Szkic zlecenia tylko po minimalizacji w trakcie edycji; zwykłe otwarcie → menu główne.
- EDYTUJ wczytuje dane w miejscu (bez reloadu, który gubił stan).

## Klucze danych (stary format — do zachowania)

| Klucz | Zawartość |
|---|---|
| `wycena-v2` | szkic aktywnego zlecenia |
| `wycena-draft-interrupted` | flaga minimalizacji |
| `wycena-history` | przyjęte / gotowe |
| `wycena-archive` | wydane |
| `wycena-kosz` | kosz |
| `wycena-purged` | tombstone po trwałym usunięciu |
| `wycena-raport-draft-v1` | szkic NAPRAWA |
| `rabat-aktywne-v1` / `rabat-wykorzystane-v1` | kody rabatowe |
| `gdrive-*` / `gh_*` / backup timestamps | sync i Update App |

## Architektura

```
src/
  app/           ekrany i nawigacja
  domain/        reguły biznesowe (przyjęcie, naprawa, wydanie, status)
  data/          localStorage, migracja, merge sync
  ui/            komponenty prezentacyjne
  integrations/  Drive, NBP, PNG/PDF, GitHub Update
  styles/        motyw ciemny jak stara app
```

## Kolejność faz

1. Szkielet + menu główne  
2. Model + migracja + testy kluczy  
3. Przyjęcie zlecenia (DODAJ → zapis → Przyjęte)  
4. EDYTUJ / NAPRAWA / WYDAJ / Wydane / Kosz  
5. Sync Drive + kopia  
6. Raporty, rabaty, kalkulatory, PWA  

## Poza zakresem v2 na starcie

- Zmiana nazwy kluczy bez migracji  
- Wyrzucenie starej appki  
- Deploy na produkcję przed checklistą  

## Sukces

- Backup ze starej appki otwiera się w v2  
- EDYTUJ pokazuje dane zlecenia  
- Menu po zwykłym starcie; szkic tylko po minimalizacji  
- Stary folder `SERWIS` nadal działa niezależnie  
