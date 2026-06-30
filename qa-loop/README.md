# 🔁 QA Loop — Tester real automático para tus proyectos

Un loop de **loop engineering** que pone a Claude Code a usar tu proyecto como un usuario
real, vuelta tras vuelta, hasta cubrir todos los flujos. Documenta cada bug, fricción y
oportunidad de mejora en un informe — sin que tú teclees nada turno a turno.

Es el patrón **Ralph**: misma instrucción, instancia fresca cada vuelta, estado externo
que persiste. La inteligencia está en la spec clara y la verificación independiente, no
en una sesión larga.

---

## 🧩 Cómo está montado (los 5 bloques del loop)

| Bloque del loop | Archivo | Qué hace |
|-----------------|---------|----------|
| **Goal** | `QA_SPEC.md` | Define el proyecto y la lista de flujos a cubrir. |
| **Prompter** | `QA_PROMPT.md` | La instrucción que recibe el agente en cada vuelta. |
| **Reader + Agent** | `run-qa-loop.sh` | Lanza Claude Code y captura su trabajo. |
| **Verifier** | `verify-qa.sh` | Chequeo **independiente**: ¿están todos los flujos cubiertos? |
| **State** | `state/PROGRESS.md` + `state/QA_REPORT.md` | Progreso y hallazgos que persisten entre vueltas. |

El verificador es la pieza clave: el loop **no termina porque el agente diga que terminó**,
sino porque `verify-qa.sh` confirma que la cobertura está completa. El agente no lo puede
falsear.

> Nota honesta: este verificador comprueba **cobertura** (que se hayan tocado todos los
> flujos), no **corrección**. Encontrar bugs es el objetivo, no algo a eliminar. La calidad
> de cada prueba la pone el prompt; el script solo garantiza que no se salta ningún flujo.

---

## 🚀 Puesta en marcha (paso a paso)

### 1. Coloca la carpeta
Mete `qa-loop/` dentro del repo del proyecto que quieres testear (o al lado). Lo importante
es que `QA_SPEC.md` apunte bien a la ruta del proyecto.

### 2. Rellena `QA_SPEC.md`
Edita solo este archivo:
- Nombre, ruta y qué hace el proyecto.
- **Comando de arranque** y **URL local** (p.ej. `npm run dev` → `http://localhost:3000`).
- Requisitos previos (`.env`, base de datos sembrada) y **credenciales de un usuario de test**.
- La lista de **flujos** (`FLOW-01`, `FLOW-02`, ...). Empieza por los 5-7 flujos críticos.

### 3. Sincroniza el estado (opcional, el loop también lo hace solo)
Asegúrate de que `state/PROGRESS.md` tenga los mismos `FLOW-NN` que tu spec, todos en
`PENDING`. Si te dejas alguno, el agente lo añade en la primera vuelta.

### 4. Da permisos de ejecución a los scripts
```bash
chmod +x run-qa-loop.sh verify-qa.sh
```

### 5. Asegúrate de tener Claude Code y un repo git limpio
```bash
claude --version        # debe responder
git status              # idealmente limpio, para poder revertir
```

### 6. Lanza el loop
```bash
cd qa-loop
./run-qa-loop.sh          # máximo 15 vueltas
# o
./run-qa-loop.sh 25       # máximo 25 vueltas
```

El loop irá vuelta a vuelta: cada una cubre un flujo, lo prueba como usuario real, escribe
hallazgos en `state/QA_REPORT.md` y marca el flujo como `DONE`. Para solo cuando todos los
flujos están cubiertos (lo confirma `verify-qa.sh`) o al llegar al máximo de vueltas.

### 7. Lee el resultado
Tu entregable es `state/QA_REPORT.md`: bugs por severidad, fricciones de UX, riesgos de
seguridad y oportunidades de nuevas features. Esa es la lista para tu siguiente fase
(arreglar los bugs, con el prompt "El Detective" de la biblioteca).

---

## ⚠️ Seguridad (léelo antes de lanzar desatendido)

El controller usa `--dangerously-skip-permissions` para que Claude Code corra sin pedir
confirmación cada vez (necesario en un loop automático). Eso da al agente vía libre para
ejecutar comandos. Por eso:

- **Córrelo solo en un entorno controlado**: tu VPS Hetzner o una **copia/rama** del
  proyecto. Nunca sobre producción.
- **Repo git limpio** antes de empezar: el loop hace commit del estado en cada vuelta, así
  que cualquier cambio inesperado queda registrado y es revertible.
- El `QA_PROMPT.md` **prohíbe explícitamente modificar el código** (solo documenta), lo que
  reduce el riesgo, pero la red de seguridad real es el git.
- Verifica los flags exactos de tu versión con `claude --help` (la CLI evoluciona y el
  nombre de algún flag puede cambiar).

---

## 💸 Coste

Cada vuelta es una llamada completa al modelo, así que el consumo de tokens se acumula con
el nº de flujos y vueltas. Empieza con pocos flujos y un máximo de vueltas bajo (10-15)
para calibrar antes de soltarlo con todo.

---

## 🔧 Adaptarlo a otro proyecto

Solo cambias `QA_SPEC.md` (proyecto, arranque, flujos) y reinicias `state/PROGRESS.md` a
todos `PENDING` (o vacíalo y deja que el agente lo regenere desde la spec). El resto del
mecanismo —prompt, verificador, controller— sirve igual para PetNova, la web de HecTechAI
o cualquier otro.
