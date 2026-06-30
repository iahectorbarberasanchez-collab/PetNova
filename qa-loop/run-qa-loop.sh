#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# run-qa-loop.sh — CONTROLLER del loop de QA (patrón Ralph).
#
# Lanza el agente una y otra vez con el MISMO prompt. Cada vuelta usa una
# instancia fresca con contexto limpio, cubre UN flujo, documenta hallazgos y
# marca ese flujo como DONE en el estado. El loop para cuando el verificador
# independiente confirma cobertura completa, o al llegar al máximo de vueltas.
#
# Uso:
#   ./run-qa-loop.sh            # máximo 15 vueltas (por defecto)
#   ./run-qa-loop.sh 25         # máximo 25 vueltas
#
# Requisitos:
#   - Claude Code instalado y con sesión iniciada (comando `claude`).
#   - Ejecutar DENTRO de la carpeta qa-loop, dentro de un repo git.
#   - QA_SPEC.md rellenado con tu proyecto y tus flujos.
#
# ⚠️ SEGURIDAD: usa --dangerously-skip-permissions para correr desatendido. Hazlo
#   solo en un entorno controlado (tu VPS o una copia/rama del proyecto), nunca
#   sobre producción. El prompt prohíbe modificar código (solo documenta), pero
#   mantén el repo limpio para poder revertir cualquier cambio inesperado.
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail

MAX_ITER="${1:-15}"
PROMPT_FILE="QA_PROMPT.md"
ITER=0

if ! command -v claude >/dev/null 2>&1; then
  echo "ERROR: no encuentro el comando 'claude'. Instala Claude Code primero."
  exit 1
fi
if [ ! -f "$PROMPT_FILE" ]; then
  echo "ERROR: no encuentro $PROMPT_FILE. Ejecuta desde dentro de la carpeta qa-loop."
  exit 1
fi

echo "▶️  Iniciando loop de QA (máx ${MAX_ITER} vueltas)..."
echo "    Verifica los flags exactos de tu versión con: claude --help"
echo ""

while [ "$ITER" -lt "$MAX_ITER" ]; do
  # ¿Ya está completo? El verificador es independiente del agente.
  if bash verify-qa.sh; then
    echo ""
    echo "🎉 Loop terminado: QA completo en ${ITER} vueltas."
    echo "    Informe en: state/QA_REPORT.md"
    exit 0
  fi

  ITER=$((ITER + 1))
  echo ""
  echo "──────────────────────────────────────────────────────"
  echo "🔁 Vuelta ${ITER}/${MAX_ITER}"
  echo "──────────────────────────────────────────────────────"

  # Instancia fresca de Claude Code en modo headless con el prompt de la vuelta.
  # El agente lee QA_SPEC.md + state/PROGRESS.md, elige el siguiente flujo
  # pendiente, lo prueba como usuario real, escribe hallazgos en
  # state/QA_REPORT.md y marca el flujo como DONE en state/PROGRESS.md.
  claude -p "$(cat "$PROMPT_FILE")" --dangerously-skip-permissions

  # Checkpoint del estado tras cada vuelta (registro + posibilidad de revertir).
  git add -A && git commit -m "QA loop: vuelta ${ITER}" >/dev/null 2>&1 || true
done

echo ""
echo "⚠️  Alcanzado el máximo de ${MAX_ITER} vueltas sin cobertura completa."
echo "    Revisa state/PROGRESS.md para ver qué flujos quedan pendientes."
bash verify-qa.sh || true
exit 1
