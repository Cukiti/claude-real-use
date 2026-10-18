mkdir -p .cru docs
cat > .cru/PROJECT.md <<'P'
# Proyecto
- Nombre: Juego
- Tipo: juego
- Fase: Producción
- Verificación: leer los archivos tocados
- Tareas: `Pendientes.md` (adoptado, no hay `.cru/TASKS.md`)
- Bitácora: `docs/BITACORA.md` (entrada arriba al terminar cada tarea)
P
cat > Pendientes.md <<'T'
# Lo que falta
## En marcha
- Menú de pausa: falta el botón de salir
## Antes de publicar
- Iconos de la tienda
T
cat > docs/BITACORA.md <<'B'
# Bitácora
## 2026-10-10 — Sesión anterior
- Se hizo el inventario.
B
