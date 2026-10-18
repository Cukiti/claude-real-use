# Catálogo de herramientas por tipo de proyecto

Regla de oro: **cada servidor MCP y cada plugin habilitado cuesta contexto en todas las sesiones**. Añade herramientas por flujo de trabajo, no "por si acaso". Si existe una CLI (`gh`, `firebase`, `supabase`, `gcloud`, `aws`), prefiérela: es lo más eficiente en contexto. Verifica siempre el comando de instalación en el repositorio oficial de cada proyecto; los MCP cambian rápido.

Dónde buscar:
- `/plugin` dentro de Claude Code (marketplace oficial y comunitarios).
- `claude mcp add --transport http <nombre> <url>` para MCP remotos.
- Habilita plugins por proyecto en `.claude/settings.json` (`enabledPlugins`) en vez de globalmente.

---

## Base (casi cualquier proyecto)

| Herramienta | Para qué | Nota de coste |
|---|---|---|
| `gh` CLI | Issues, PRs, CI de GitHub | Mejor que un MCP de GitHub para el día a día |
| Context7 (MCP) | Documentación de librerías por versión, evita APIs obsoletas | Útil en stacks que cambian rápido (JS, Python) |
| Plugin de code intelligence (LSP) de tu lenguaje | Ir a definición, errores de tipos tras cada edición | Ahorra lecturas de archivos en lenguajes tipados |
| `/code-review`, `/security-review` (incluidos) | Revisión de bugs y seguridad del diff | Contexto fresco |
| Plugin `claude-md-management` | Mantener CLAUDE.md corto y al día | — |
| Mod `next-steps` | Sugiere hasta 3 siguientes prompts al final de cada turno (elegir con 1/2/3) | `claude plugin install next-steps@claude-community`; requiere Claude Code ≥ 2.1.287 |

## Juegos

| Herramienta | Para qué |
|---|---|
| MCP de Godot | Lanzar el editor, ejecutar el proyecto, leer la salida de depuración, crear escenas |
| MCP de Aseprite | Pixel art y animaciones desde Claude |
| Plugin `unity` | Skills de Unity (UI, URP, tilemaps, audio, multiplayer, IAP). **Solo en proyectos Unity** |
| Framework de tests del motor (GUT / gdUnit4 en Godot, Unity Test Framework) | Es tu `Verificación:`; sin esto Claude no puede comprobar lógica de juego. **Sobra si el proyecto ya tiene pruebas propias** (scripts headless, autotest) |

Antes de recomendar, descarta lo ya conectado (`claude mcp list`, `.mcp.json`). Consejo: deja el editor del motor y los MCPs de arte solo en los proyectos de juego (habilitación por proyecto).

## Apps móviles

| Herramienta | Para qué |
|---|---|
| Plugin `everything-claude-code-mobile` | Agentes y skills de Android/iOS/KMP: planificación por feature, build-fix, revisión, tests |
| Skills `chrisbanes-skills` | Patrones de Compose, coroutines y Flow |
| Plugin de Firebase / `firebase` CLI | Auth, Firestore, despliegues, configuración de apps |
| Supabase (MCP o CLI) | Backend Postgres, migraciones, edge functions |

## Web

| Herramienta | Para qué |
|---|---|
| Navegador integrado de la app de escritorio / Claude in Chrome | Ver la app, capturas, consola y red sin otro MCP |
| Playwright MCP o Chrome DevTools MCP | Tests e2e y perfilado; ojo: una página puede consumir >100k tokens |
| Plugin `frontend-design` | Interfaces con criterio de diseño |
| Figma (MCP) | Implementar desde diseños |
| Sentry (MCP o `sentry-cli`) | Triage de errores de producción |

## Backend / datos

| Herramienta | Para qué |
|---|---|
| MCP o CLI de tu base de datos (Postgres, Supabase) | Consultar esquema y datos; usa credenciales de solo lectura |
| Sentry / observabilidad | Errores reales en vez de suposiciones |

## Gestión del trabajo

| Herramienta | Para qué |
|---|---|
| `.cru/` de este plugin | Estado del proyecto en archivos, gratis y versionado con git |
| Linear / Notion / Asana / Jira (MCP) | Solo si el equipo ya vive ahí; si trabajas solo, `.cru/TASKS.md` basta |

## Gratis primero, premium cuando compensa

Recomienda según el `Presupuesto:` de `.cru/PROJECT.md`. Si es "solo gratis", ofrece únicamente la columna gratuita. Si es "gratis primero", menciona la opción de pago solo cuando su ventaja cambie algo concreto del proyecto. Los planes y límites cambian: verifica las condiciones actuales en la web oficial antes de recomendar una capa concreta.

| Necesidad | Gratis o con capa gratuita | De pago / premium, cuándo compensa |
|---|---|---|
| Motor de juego | Godot (libre); Unity Personal y Unreal (con condiciones de ingresos) | Unity Pro o un plan de Unreal: cuando lo exigen la licencia o los ingresos |
| Base de datos y backend | SQLite (local); capas gratuitas de Supabase y Firebase | Plan de pago de Supabase o Firebase: más uso, copias de seguridad y sin pausas por inactividad |
| Servidor de juego online | Nakama o Colyseus autoalojados, en un VPS barato o en una capa gratuita | Servicios gestionados (Photon, Heroic Cloud): cuando no quieres operar servidores |
| Hosting web | GitHub Pages, capas gratuitas de Vercel, Netlify y Cloudflare Pages | Planes de pago: dominios del equipo, más tráfico o funciones de servidor |
| Errores en producción | Capa gratuita de Sentry; logs propios | Sentry de pago: más eventos, más retención y equipo |
| Diseño | Penpot (libre), capa gratuita de Figma, `/design` de Claude | Figma de pago: equipo y Dev Mode |
| Arte 2D | LibreSprite, Krita | Aseprite (pago único, barato) |
| 3D | Blender (libre) | Herramientas de pago solo para flujos concretos |
| CI | GitHub Actions (minutos gratuitos) | Minutos extra cuando el uso los supera |
| Revisión de código con IA | `/code-review` local, la GitHub Action con tu suscripción | Code Review gestionado (Team/Enterprise) |

## Cuándo crear tu propia herramienta

- **Skill**: conocimiento o flujo que repites (convenciones de tu motor, checklist de release). Se carga solo cuando hace falta.
- **Hook**: algo que debe pasar siempre, sin excepción (formatear tras editar, bloquear escrituras en una carpeta).
- **Subagente**: tarea que lee mucho y devuelve poco.
- **MCP**: integrar un servicio sin CLI.
- La skill `skill-creator` y `mcp-builder` ayudan a crearlos.
