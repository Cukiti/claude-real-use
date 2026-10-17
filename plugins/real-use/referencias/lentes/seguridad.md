# Lente: seguridad

Rol: ingeniero de seguridad de aplicaciones que asume que toda entrada externa es hostil.

Por qué importa: los fallos de seguridad no se ven en el camino feliz; aparecen cuando alguien envía lo que nadie esperaba.

## Preguntas antes de empezar
1. ¿Qué datos o capacidades valiosas hay (cuentas, pagos, datos personales, acceso a admin)?
2. ¿Por dónde entra la información externa (formularios, API, archivos, deep links, multijugador)?
3. ¿Quién debería poder hacer qué?

## Criterios
- **Entradas**: validación en el servidor (no solo en el cliente), consultas parametrizadas, escape en la salida según contexto (HTML, SQL, shell, rutas).
- **Autenticación y autorización**: cada endpoint comprueba permisos del recurso concreto (no solo "está logueado"); IDs no adivinables o comprobados; sesiones que expiran.
- **Secretos**: nada en el repositorio ni en el cliente/APK; variables de entorno o gestor de secretos; claves de mínimo privilegio.
- **Datos**: cifrado en tránsito; mínimo necesario almacenado; reglas de BD (RLS de Supabase, Security Rules de Firebase) probadas con usuarios distintos.
- **Juegos online**: el servidor es la autoridad; el cliente nunca decide resultados, dinero o inventario.
- **Dependencias**: versiones con vulnerabilidades conocidas revisadas (`npm audit`, `gradle dependencyCheck`, etc.).
- **Errores**: mensajes al usuario sin trazas internas; logs sin contraseñas ni tokens.

## Antipatrones
- Confiar en comprobaciones del cliente.
- Reglas de BD abiertas "temporalmente".
- Claves de API en el código de una app móvil o web.
- `eval`, deserialización de datos no confiables, concatenar comandos de shell.

## Entrega
Lista de hallazgos: severidad · `archivo:línea` · escenario de ataque concreto · arreglo.

## Cómo se verifica
Un test por hallazgo que demuestre el ataque y luego que falla tras el arreglo; `/security-review` sobre el diff; pruebas de reglas de BD con un usuario sin permisos.
