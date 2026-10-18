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

## 2026-10-17 · Publicado en GitHub (T-012, T-015)
- Hecho: T-012, repo privado https://github.com/Cukiti/claude-real-use con push de main. T-015, el primer run de CI (39080336016) salió verde en Ubuntu y Windows.
- Queda: T-013 (usar /real-use:iniciar en un proyecto real, p. ej. Colmadon, y ajustar las skills); T-014 (evals de activación); T-016 (mod) cuando Claude Code ≥ 2.1.287.
- Decisiones: el repo es privado (elección del usuario).
- Prompt para retomar: "/real-use:siguiente T-013"

## 2026-10-17 · v0.3: lentes expertas, /hacer y aprendizaje
- Hecho: T-017 a T-020. `/real-use:experto qa` en una sesión real encontró 4 fallos en statusline.js; los reproduje con tests y los arreglé (`npm test` 17/17).
- Queda: T-013 (probar en un proyecto real); T-014 (evals de activación, ahora con hacer y experto, que compiten por las peticiones vagas).
- Decisiones: D-005.
- Prompt para retomar: "/real-use:siguiente T-013"

## 2026-10-17 · Evals de activación (T-014)
- Hecho: T-014. 16 casos en plugins/real-use/evals (generados por scripts/generar-evals.js). Con 3 ejecuciones por caso, 48/48 correctas, sin activaciones cruzadas entre hacer, experto y spec; los negativos no activan nada. Prueba de mutación: con la descripción de hacer rota, sus 3 casos caen a 0 %.
- Queda: T-013 (probar en un proyecto real). Al cambiar la descripción de una skill: `npm run evals`.
- Decisiones: los evals no van en CI por coste (~$3,50 por ejecución completa).
- Prompt para retomar: "/real-use:siguiente T-013"

## 2026-10-17 · v0.4: interactividad sin coste de tokens
- Hecho: T-021 a T-023. Copiloto de avisos, aviso al reanudar, menu, equipo + especialista, conectar y effort automático. `npm test` 29/29; evals 57/57; aviso visto en una sesión real.
- Queda: T-013 (probar en un proyecto real).
- Decisiones: D-006.
- Prompt para retomar: "/real-use:siguiente T-013"

## 2026-10-17 · Coste fijo del plugin y de la configuración
- Hecho: T-024. Los evals detectaron una regresión real (hacer 0/9 al perder "Usar cuando…"); arreglada y protegida con un test.
- Queda: T-025 (repetir evals cuando se reinicie el límite), T-026 (recortar plugins globales, con aprobación), T-013.
- Decisiones: ninguna.
- Prompt para retomar: "/real-use:siguiente T-025"

## 2026-10-18 · Evals confirmados tras el recorte (T-025)
- Hecho: T-025. 57/57 con las descripciones recortadas y la cláusula "Usar cuando…" restaurada en hacer.
- Queda: T-026 (recortar los plugins globales del usuario, pendiente de su aprobación) y T-013.
- Decisiones: ninguna.
- Prompt para retomar: "/real-use:siguiente T-026"

## 2026-10-18 · Configuración del usuario recortada (T-026)
- Hecho: T-026, con la aprobación del usuario. Los plugins móviles quedan desactivados en el global y activados en .claude/settings.json de Deudom, Domifiao2, Fintro, Teikafusion, Wordiness e inquea. En proyectos Godot se ahorran ~5.850 tokens fijos por sesión. Copia de seguridad en ~/.claude/settings.json.bak-real-use.
- Queda: T-013 (estrenar el plugin en Colmadon).
- Decisiones: ninguna.
- Prompt para retomar: "/real-use:siguiente T-013"
