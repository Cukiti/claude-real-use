# Tareas

<!--
Formato (lo lee el hook de inicio de sesión, no lo cambies):
Marcas: `[ ]` pendiente · `[~]` en curso · `[!]` bloqueada · `[x]` hecha
Cada tarea: ID · título · hecho: <criterio> · verif: <cómo se comprueba>
-->

## En curso

## Pendiente
- [ ] T-013 Probar /real-use:iniciar en un proyecto real (p. ej. Colmadon) y ajustar las skills con lo aprendido · hecho: .cru/ creado sin correcciones manuales y una tarea cerrada con siguiente+cerrar · verif: LOG.md del proyecto con la sesión
- [ ] T-016 Mod "tarea actual": banda sobre el prompt con la tarea [~] y el % de contexto · hecho: se ve en terminal y en escritorio · verif: `claude plugin test`

## Bloqueado
- [!] T-016b Requisito del mod: Claude Code ≥ 2.1.287 · bloqueado por: versión instalada 2.1.283 (`claude update`)

## Hecho
- [x] T-001 Investigar documentación y blogs de Anthropic · ✔ 2026-10-17
- [x] T-002 Manifiestos de plugin y marketplace · verif: `claude plugin validate` · ✔ 2026-10-17
- [x] T-003 Hook SessionStart que inyecta el estado de .cru/ · ✔ 2026-10-17
- [x] T-004 Skills iniciar, spec, siguiente, enrutar, verificar, pendientes, cerrar, ahorro · ✔ 2026-10-17
- [x] T-005 Subagentes explorador, verificador, revisor · ✔ 2026-10-17
- [x] T-006 GUIA.md, metodologías y catálogo · ✔ 2026-10-17
- [x] T-007 Recetas de verificación por stack · ✔ 2026-10-17
- [x] T-008 Skills paralelo y panel + status line · ✔ 2026-10-17
- [x] T-009 Tests de los scripts (`npm test`) y PROMPTS.md · ✔ 2026-10-17
- [x] T-011 Mover el repositorio a una carpeta permanente · verif: `npm test` 7/7 y validador en la nueva ruta · ✔ 2026-10-17

- [x] T-010 Probar el plugin cargado en una sesión real · verif: `claude --plugin-dir` + Haiku: hook correcto, 8 skills y 3 agentes visibles (ahorro/panel ocultos al modelo por diseño), /real-use:pendientes ejecutado en fork con explorador · ✔ 2026-10-17

- [x] T-012 Publicar en GitHub (privado): https://github.com/Cukiti/claude-real-use · verif: push de main a origin · ✔ 2026-10-17

- [x] T-015 CI en GitHub con `npm test` · verif: run 39080336016, ubuntu-latest y windows-latest en verde · ✔ 2026-10-17
- [x] T-017 Skill experto + 9 lentes (criterios, antipatrones, entrega, verificación) y revisor que acepta lentes · verif: sesión real `/real-use:experto qa revisar statusline.js` encontró 4 fallos reales · ✔ 2026-10-17
- [x] T-018 Skill hacer: petición vaga → ficha de tarea → ruta → ejecución · verif: validate + test de estructura · ✔ 2026-10-17
- [x] T-019 Paso "Aprender: corregir en la fuente" en /real-use:cerrar · ✔ 2026-10-17
- [x] T-020 Tests de estructura (rutas, lentes, frontmatter) y arreglo de los 4 fallos de QA en statusline/session-start · verif: `npm test` 17/17 · ✔ 2026-10-17

- [x] T-014 Evals de activación (16 casos: 13 positivos con competidoras excluidas + 3 negativos) · verif: `npm run evals` 48/48 ejecuciones ($3,47); prueba de mutación de hacer → 0/3 · ✔ 2026-10-17
- [x] T-021 Copiloto (hook UserPromptSubmit): avisos de contexto, caché fría, correcciones seguidas, effort y peticiones vagas, solo al usuario (systemMessage) · verif: 9 tests + sesión real muestra "UserPromptSubmit says: 💡…" · ✔ 2026-10-17
- [x] T-022 Aviso al reanudar una sesión grande con la caché caducada (session-start, con coste estimado) y opción avisos todos/coste/ninguno en /config · verif: tests · ✔ 2026-10-17
- [x] T-023 Skills menu, equipo y conectar; agente especialista con lente; effort automático (verificar high; cerrar, enrutar, menu y conectar low) · verif: evals 57/57 ($4,43) · ✔ 2026-10-17
- [x] T-024 Recortar descripciones (5.257 → ~3.560 caracteres) con presupuesto en tests, sin ": " y con cláusula "Usar…" obligatoria · verif: `npm test` 30/30 · ✔ 2026-10-17

- [x] T-025 Evals tras el recorte de descripciones · verif: `npm run evals` 57/57 ($4,27) · ✔ 2026-10-18

- [x] T-026 Plugins móviles (everything-claude-code-mobile, chrisbanes-skills) solo en los 6 proyectos Android · verif: sesión real en Colmadon carga 0 skills móviles y Teikafusion 98 · copia: ~/.claude/settings.json.bak-real-use · ✔ 2026-10-18
