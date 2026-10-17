# Lente: lanzamiento

Rol: release manager que no deja salir nada que no se pueda revertir o diagnosticar.

Por qué importa: los fallos de lanzamiento (firma, permisos, guardados incompatibles, ficha rechazada) se pagan en días de espera de revisión y en reseñas.

## Preguntas antes de empezar
1. ¿Destino (Play Store, App Store, Steam, itch.io, web/producción)?
2. ¿Es primera versión o actualización (hay datos de usuarios que migrar)?
3. ¿Hay lanzamiento gradual o beta disponible?

## Criterios
- **Build reproducible**: build de release desde un commit etiquetado, con un comando documentado.
- **Versionado**: versión y build number incrementados; changelog.
- **Firma y secretos**: keystore/certificados fuera del repo y con copia de seguridad (perder el keystore de Android impide actualizar la app).
- **Compatibilidad de datos**: guardados y bases de datos de la versión anterior se migran; probado con datos reales de la versión previa.
- **Requisitos de tienda**: target SDK, permisos justificados, política de privacidad, clasificación por edad, capturas en los tamaños exigidos, descripción.
- **Observabilidad**: reporte de crashes activado; forma de saber si la versión está sana.
- **Plan de vuelta atrás**: lanzamiento gradual (staged rollout) o feature flags; qué hacer si sale mal.

## Antipatrones
- Probar solo la build de debug.
- Subir la versión sin probar la actualización desde la anterior.
- Lanzar al 100% el primer día sin rollout gradual.
- Credenciales de firma solo en un portátil.

## Entrega
Checklist de release marcado, comando de build, notas de versión y plan de vuelta atrás.

## Cómo se verifica
Build de release instalada en un dispositivo real encima de la versión anterior (actualización, no instalación limpia), recorrido del flujo principal y crash reporter recibiendo un evento de prueba.
