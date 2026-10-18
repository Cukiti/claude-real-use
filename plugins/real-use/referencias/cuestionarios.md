# Cuestionarios: que el usuario diga lo que quiere sin redactar

Para que Claude haga lo que el usuario quiere, tiene que saber qué quiere. Escribir un prompt largo cuesta; marcar opciones no. Estas son las reglas y los bancos de preguntas que usan `iniciar`, `spec` y `hacer`.

## Cómo preguntar

1. **No preguntes lo que puedes deducir** del código, de `.cru/` o de la conversación: preséntalo como opción ya marcada ("Detecté Godot 4.7: ¿correcto?").
2. **Opciones concretas**, la recomendada primero, siempre con "Otra" para escribir.
3. **Selección múltiple** cuando las respuestas no se excluyen (plataformas, funciones, servicios).
4. **Una sola ronda larga mejor que muchas cortas**: cada ronda es un turno y cada turno reenvía el contexto.

## Dónde mostrarlo

- **App de escritorio o claude.ai, con herramienta de widgets** (`show_widget`): un formulario en un único widget, con grupos de casillas (`checkbox`), opciones únicas (`radio`), deslizadores para prioridades o esfuerzo y un campo de texto libre al final. El botón **Enviar** valida los campos obligatorios y llama a `sendPrompt` con un resumen compacto de las respuestas, una línea por pregunta (`Plataformas: Android, Steam`). Así todo el cuestionario cuesta un solo turno.
- **Terminal**: `AskUserQuestion`, como mucho 4 preguntas por ronda y 4 opciones por pregunta (`multiSelect` donde aplique). Como mucho dos rondas.
- **Cuestionario largo para pensar con calma o compartir** (un equipo, un cliente): un artifact con el formulario y un botón "Copiar respuestas" que el usuario pega en el chat.

## Banco de preguntas

Elige solo las que cambian decisiones para esta tarea. Las marcadas con ★ casi siempre importan.

### Objetivo (iniciar)
- ★ ¿Qué quieres lograr? (lanzar un producto · aprender · prototipo para validar · herramienta para mí · encargo de un cliente)
- ★ ¿Para quién es? (yo · amigos y familia · un nicho concreto · público general · empresa)
- ★ ¿Cómo sabrás que salió bien? (gente lo usa · ingresos · lo termino y publico · aprendí X)
- ¿Para cuándo? (sin fecha · semanas · un mes · tres meses o más) y ¿cuántas horas por semana?
- ¿Cuánta experiencia tienes con este stack? (empiezo · algo · cómodo · experto). Ajusta cuánto explicas.

### Producto según el tipo
- **Juego**: género · plataformas (multiSelect: PC/Steam, Android, iOS, web, consola) · duración de la sesión · un jugador / multijugador local / online · monetización (pago único, gratis con anuncios, compras dentro, ninguna) · estilo visual (pixel, 2D vectorial, 3D estilizado, realista).
- **App móvil**: plataformas · ¿funciona sin conexión? · cuentas de usuario (no, opcional, obligatorias) · pagos o suscripciones · notificaciones · ¿datos sensibles?
- **Web**: sitio informativo, tienda, SaaS o herramienta interna · ¿necesita login? · SEO importante (sí/no) · contenido editable por no programadores.
- **Backend/API**: quién lo consume · volumen esperado · datos personales · tiempo real.

### Datos y servicios
- ¿Qué se guarda? (nada · local en el dispositivo · en la nube por usuario · compartido entre usuarios)
- Base de datos: elige por el caso; ofrece primero las gratuitas o con capa gratis (SQLite, Postgres en Supabase, Firebase) y menciona cuándo compensaría una de pago.
- ★ Presupuesto de herramientas: (solo gratis · gratis primero, pago si compensa · premium sin problema). Se guarda en `Presupuesto:` de `PROJECT.md`.

### Feature concreta (spec)
- ★ ¿Qué debe poder hacer el usuario final? (una frase por acción, multiSelect entre las que propones)
- ★ ¿Qué queda fuera de esta versión? (multiSelect: casillas para tachar)
- Casos límite: sin conexión · datos vacíos · interrupción a mitad · otra versión de los datos (multiSelect: cuáles importan)
- ¿Cómo lo probarás tú? (en el móvil · en el editor · con un test · alguien más)

## Después

Resume las respuestas en 3–5 líneas antes de actuar y guárdalas donde correspondan: `PROJECT.md` (objetivo, stack, presupuesto), la spec o `DECISIONS.md`. No vuelvas a preguntar lo que ya está escrito ahí.
