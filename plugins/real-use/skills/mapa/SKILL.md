---
name: mapa
description: Mapa visual del proyecto (objetivo, hitos, en curso, por revisar, bloqueado, siguiente, hecho, stack, decisiones y siguientes pasos), generado por script desde .cru/ y publicado como artifact o abierto en el navegador.
disable-model-invocation: true
effort: low
---

# Mapa del proyecto

Una página que responde de un vistazo a dónde estamos, qué se está haciendo, qué está hecho, qué falta, qué necesita tu visto bueno y con qué tecnología. Un script la genera desde `.cru/` (o desde los archivos adoptados): **regenerarla no cuesta tokens del modelo**. No escribas tú el HTML.

## 1. Comprobar los datos

Si no hay `.cru/PROJECT.md`, ofrece `/real-use:iniciar` y para. Si `PROJECT.md` no tiene sección `## Stack`, propón completarla antes, con `AskUserQuestion` multiSelect, a partir de lo que veas en el proyecto: lenguajes, motor o framework, base de datos, backend o hosting, servicios externos y herramientas de IA. Cada línea con el formato `- Categoría: valor (gratis|freemium|pago)`.

## 2. Generar

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/mapa.js" "<raíz del proyecto>" "<archivo de salida>"
```

- **Para publicarlo como artifact**: salida en el directorio temporal o scratchpad de la sesión (fuera del repo), sin más opciones. El script genera un fragmento HTML que el artifact envuelve al publicarlo.
- **Para abrirlo en el navegador** (sin artifacts, o si el usuario lo prefiere): añade `--completo` y sal a `.cru/mapa.html`; ábrelo con `start` (Windows), `open` (macOS) o `xdg-open` (Linux). Sugiere añadir `.cru/mapa.html` al `.gitignore`.

## 3. Publicar o actualizar

- Si `PROJECT.md` tiene `- Mapa: <url>`, actualiza ese mismo artifact (pasa la `url`) para que el enlace no cambie.
- Si no lo tiene, publica uno nuevo (privado por defecto) con un icono genérico como `map` y añade `- Mapa: <url>` a la cabecera de `PROJECT.md`.
- Los botones del mapa copian comandos al portapapeles, porque una página publicada no puede ejecutarlos. Para botones que envían el comando directamente al chat está `/real-use:menu`.

## 4. Terminar

Una línea con el enlace (o la ruta local) y lo más llamativo del mapa, por ejemplo: "Tienes 2 cosas esperando tu visto bueno". `/real-use:cerrar` lo regenera solo al final de cada sesión si existe `- Mapa:`.
