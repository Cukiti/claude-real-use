---
description: no debe activar ninguna skill de real-use
tags: [activacion, no-activacion]
max_turns: 4
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
append_system_prompt: "El directorio de trabajo está vacío. Si usas una skill, no ejecutes sus pasos: responde en una línea qué harías a continuación."
---

escribe una regex que valide un correo electrónico sencillo
