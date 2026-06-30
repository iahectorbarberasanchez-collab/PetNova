#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# verify-qa.sh — VERIFICADOR INDEPENDIENTE del loop de QA.
#
# Decide si el QA está completo comparando los flujos definidos en QA_SPEC.md
# con los flujos marcados como cubiertos en state/PROGRESS.md.
#
# IMPORTANTE: este verificador juzga COBERTURA (se han tocado todos los flujos),
# no CORRECCIÓN. Encontrar bugs ES el objetivo del QA, no algo a eliminar.
#
# Códigos de salida:
#   0 → QA completo (todos los flujos cubiertos)  → el loop PARA
#   1 → faltan flujos por cubrir                  → el loop SIGUE
#   2 → error de configuración (no hay flujos)    → revisa QA_SPEC.md
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SPEC="QA_SPEC.md"
PROGRESS="state/PROGRESS.md"

if [ ! -f "$SPEC" ]; then
  echo "ERROR: no encuentro $SPEC. Ejecuta el loop desde dentro de la carpeta qa-loop."
  exit 2
fi

# Flujos definidos en la spec: líneas tipo "FLOW-01:", "FLOW-02:", ...
total=$(grep -cE '^FLOW-[0-9]+:' "$SPEC" || true)

# Flujos cubiertos en el progreso: líneas tipo "FLOW-01: DONE"
if [ -f "$PROGRESS" ]; then
  done=$(grep -cE '^FLOW-[0-9]+:[[:space:]]*DONE' "$PROGRESS" || true)
else
  done=0
fi

echo "Cobertura QA: ${done} / ${total} flujos cubiertos."

if [ "$total" -eq 0 ]; then
  echo "ERROR: no hay flujos definidos en $SPEC. Añade al menos un 'FLOW-NN:'."
  exit 2
fi

if [ "$done" -ge "$total" ]; then
  echo "✅ QA COMPLETO: todos los flujos cubiertos."
  exit 0
else
  echo "⏳ Faltan flujos por cubrir."
  exit 1
fi
