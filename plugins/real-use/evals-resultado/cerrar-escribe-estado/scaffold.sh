# Proyecto mínimo con .cru/ (lo comparten los casos)
mkdir -p .cru
cat > .cru/PROJECT.md <<'P'
# Proyecto
- Nombre: Demo
- Tipo: web
- Metodología: Kanban
- Fase: MVP
- Verificación: leer el archivo generado y comprobar su contenido
P
cat > .cru/TASKS.md <<'T'
# Tareas
## En curso
- [~] T-001 Calcular el total del carrito · hecho: total() suma precios · verif: tests pasan
## Pendiente
- [ ] T-002 Crear el archivo VERSION con el contenido 0.1.0 · hecho: VERSION contiene 0.1.0 · verif: leer VERSION
## Bloqueado
## Hecho
T
printf '# Bitácora de sesiones\n' > .cru/LOG.md
printf '# Decisiones\n' > .cru/DECISIONS.md
