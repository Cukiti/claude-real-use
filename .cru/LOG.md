# Bitácora de sesiones

## 2026-10-17 · v0.1 y v0.2 del plugin
- Hecho: T-001 a T-009. Evidencia: `claude plugin validate` pasa (plugin y marketplace); `npm test` 7/7; el hook resume este repo en 1.644 caracteres.
- Queda: T-010 (probar en sesión real) en cuanto la CLI tenga sesión iniciada; luego T-013 en un proyecto real.
- Decisiones: D-001 a D-004.
- Prompt para retomar: "/real-use:siguiente T-010 — ya hice /login en la CLI"

## 2026-10-17 · Repositorio en carpeta permanente
- Hecho: T-011. El repo vive en AndroidStudioProjects/Claude Real Use con su historial git; `npm test` 7/7, validador y hook pasan ahí.
- Queda: T-010 sigue bloqueada (la CLI responde "OAuth session expired"); después T-012 (crear repo en GitHub y hacer push) y T-013.
- Decisiones: ninguna.
- Prompt para retomar: "/real-use:siguiente T-010 — ya hice /login en la CLI"

## 2026-10-17 · Prueba en sesión real (T-010)
- Hecho: T-010. Con la CLI ya autenticada: el hook inyecta el estado correcto, se listan 8 skills y 3 agentes (ahorro y panel solo los invoca el usuario), y /real-use:pendientes corrió en contexto aislado con explorador (Haiku) y devolvió un informe correcto.
- Queda: T-012 (crear el repo en GitHub y hacer push); después T-015 (CI en verde) y T-013 (probar en un proyecto real).
- Decisiones: ninguna.
- Prompt para retomar: "/real-use:siguiente T-012 — ya creé el repo vacío en GitHub: <url>"
