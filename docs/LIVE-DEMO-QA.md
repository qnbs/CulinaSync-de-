# Live-Demo QA — GitHub Pages

**URL:** https://qnbs.github.io/CulinaSync-de-/

Manuelle Smoke-Checkliste (bei jedem groesseren Release oder nach Deploy):

1. **Navigation:** Zwischen Vorrat, KI-Chef, Rezeptbuch, Essensplaner, Einkaufsliste, Hilfe, Einstellungen wechseln; kein weisser Screen.
2. **Pantry:** Liste / Filter / Quick-Add (falls Daten vorhanden).
3. **Rezepte:** Rezept oeffnen; Tabs/Aktionen kurz anfasssen.
4. **Essensplan:** Woche sichtbar; DayColumn ohne Konsole-Fehler.
5. **Einkaufsliste:** Eintrag hinzufuegen; keine Endlosschleifen-Toasts.
6. **Cook Mode / Voice:** Nur wenn Browser APIs vorhanden — Start/Stopp ohne Crash.
7. **Offline:** DevTools → Offline → Kernansichten noch bedienbar (Dexie).
8. **PWA:** Update-Hinweis / Install-Dialog erscheinen nicht blockierend falsch.
9. **KI (Gemini):** Nur mit **vom Nutzer gesetztem API-Key** in den Einstellungen testen — nie Keys ins Repo.

Ergebnis im Deploy- oder Release-Ticket kurz notieren (OK / Abweichungen).
