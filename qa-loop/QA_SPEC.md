# QA_SPEC — Configuración del loop de QA

> Archivo de especificación adaptado para el proyecto PetNova.

## Proyecto objetivo
- **Nombre:** PetNova
- **Ruta del repo:** C:\Users\ester\Desktop\HECTOR\PetNova
- **Qué hace (2 líneas):** Aplicación web moderna para la gestión de datos de mascotas, calendarios de vacunación, seguimiento de salud y un chat bot de asistencia.
- **Usuario objetivo:** Propietarios de mascotas y veterinarios o proveedores de servicios asociados.

## Cómo arrancarlo
- **Comando de arranque:** `npm run dev` (dentro del subdirectorio `web`)
- **URL local:** http://localhost:3000
- **Requisitos previos:** Archivo `.env.local` configurado con las claves de Supabase y Google (ya presente en el proyecto).
- **Credenciales de prueba (si hay login):** Se generan cuentas de test aleatorias en cada test.

## Flujos a probar
Cada flujo representa un paso crítico del ciclo de vida del usuario y de sus mascotas.

FLOW-01: Registro de un usuario nuevo
FLOW-02: Login y logout de un usuario existente
FLOW-03: Crear una mascota y verla en el listado del Dashboard
FLOW-04: Editar los datos de la mascota y verificar persistencia tras recarga
FLOW-05: Eliminar la mascota
FLOW-06: Añadir un registro de salud o nota en el historial de una mascota
FLOW-07: Invitar a un amigo (Sistema de referidos) y ganar PetCoins

## Criterios globales
- Un flujo se considera cubierto cuando se ha **ejecutado de verdad** mediante un test automatizado o simulación, y sus hallazgos están documentados en `state/QA_REPORT.md`.
- Severidades de bugs: 🔴 rompe el flujo / 🟠 funciona mal o es inseguro / 🟡 molesto pero menor.
