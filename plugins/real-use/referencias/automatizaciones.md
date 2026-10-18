# Catálogo de automatizaciones

Elige el mecanismo por **qué dispara** la acción y **dónde tiene que correr**. Fuentes: documentación de hooks, scheduled tasks, routines, `/goal`, `/loop` y GitHub Actions de Claude Code.

## Qué mecanismo usar

| Mecanismo | Dispara | Corre en | Necesita tu máquina | Cuándo |
|---|---|---|---|---|
| Hook | Un evento de Claude Code (editar, terminar turno, iniciar sesión) | Tu máquina, en cada sesión | Sí | Algo que debe pasar **siempre**, sin excepción y sin coste de modelo |
| `/goal <condición>` | Cada turno, hasta cumplir la condición | La sesión actual | Sí | Trabajo largo con un final medible |
| `/loop <intervalo> <prompt>` | Un intervalo, mientras la sesión esté abierta | La sesión actual | Sí | Vigilar algo un rato (CI, un despliegue) |
| Tarea programada del escritorio | Horario (desde 1 min) | Tu máquina, en sesión nueva | Sí, con la app abierta | Rutinas que necesitan archivos o herramientas locales (editor del motor, emulador) |
| Routine (nube) | Horario (desde 1 h), llamada HTTP o evento de GitHub | Nube, con un clon nuevo del repo | No | Rutinas que no necesitan tu máquina; terminan en una rama o PR |
| GitHub Action (`claude-code-action`) | Eventos de GitHub (PR, push, issue, cron) o `@claude` | Runner de GitHub | No | Revisión de PRs, triage de issues e informes del repo |

## Automatizaciones recomendadas por señal

| Señal en el proyecto | Automatización | Mecanismo |
|---|---|---|
| Se pide "formatea" o hay diffs de formato | Formatear cada archivo tras editarlo | Hook PostToolUse (Edit\|Write) con el formateador del stack |
| Carpetas que no se deben tocar (migraciones aplicadas, `addons/` de terceros, assets generados) | Bloquear escrituras ahí | Hook PreToolUse que sale con código 2 |
| Comando de verificación lento pero fiable | Que no termine un turno con la verificación fallando | Hook Stop con el comando (cuidado: añade tiempo a cada turno) |
| `.cru/` con muchas tareas y sesiones irregulares | Auditoría semanal de pendientes | Tarea programada del escritorio: `/real-use:pendientes`, lunes 9:00 |
| Dependencias que envejecen | Revisión mensual de dependencias y vulnerabilidades | Routine (nube) que abre un PR |
| Repositorio en GitHub con PRs | Revisión automática en cada PR | GitHub Action: `/real-use:bot` lo configura |
| Despliegue o CI que tarda | Avisar cuando termine y arreglar si falla | `/loop 5m` revisando el estado, o el auto-fix de la app de escritorio si está disponible |
| Migración con criterio claro ("todo compila y pasa") | Seguir hasta terminar | `/goal` en modo auto |
| Juego con builds para probar | Build nocturna para playtest | Tarea programada del escritorio (necesita el motor local) |

## Reglas

- **Cada automatización necesita tu aprobación explícita**, y antes de aplicarla se muestra el cambio exacto (JSON del hook, prompt de la tarea, YAML del workflow).
- Empieza con una o dos. Una automatización que nadie revisa es ruido.
- Las que corren sin ti (routines, Actions, tareas programadas) necesitan: un prompt autocontenido, solo los permisos necesarios (mejor de solo lectura), un tope (turnos o tiempo) y un lugar donde dejar el resultado (PR, comentario, `.cru/LOG.md`).
- Las tareas programadas que se saltan una ejecución hacen solo un catch-up al despertar: escribe el prompt para que funcione aunque llegue tarde ("solo los commits de hoy").
- Ninguna automatización guarda secretos en archivos; los tokens van en los secretos del servicio (GitHub Secrets, bóveda), y los introduce el usuario.
