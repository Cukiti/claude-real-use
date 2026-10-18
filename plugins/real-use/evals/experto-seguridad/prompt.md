---
description: debe activar experto
tags: [activacion, activacion-experto]
max_turns: 4
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
append_system_prompt: "Esto es una prueba de activación de skills en un directorio vacío. Actúa con normalidad: si una skill aplica a la petición, invócala. Después de invocarla no ejecutes sus pasos ni otras herramientas: responde en una línea qué harías a continuación."
---

revisa este endpoint como lo haría un experto en seguridad: app.post('/login', (req,res) => db.query("SELECT * FROM users WHERE name='" + req.body.user + "'"))
