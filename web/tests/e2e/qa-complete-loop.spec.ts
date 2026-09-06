import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Helper to parse .env.local
function getEnvConfig() {
  const envPath = path.resolve(__dirname, '../../.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const config: Record<string, string> = {};
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      config[key] = val;
    }
  });
  return config;
}

test.describe('PetNova Complete QA Loop (FLOW-01 to FLOW-07)', () => {
  let supabaseAdmin: any;
  let testEmail: string;
  let testPassword = 'TestPassword123!';
  let testName: string;
  let referralCode: string;
  let petId: string;
  let petName: string;

  test.beforeAll(() => {
    const config = getEnvConfig();
    const supabaseUrl = config['NEXT_PUBLIC_SUPABASE_URL'];
    const serviceRoleKey = config['SUPABASE_SERVICE_ROLE_KEY'];
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Supabase config variables are missing from .env.local');
    }
    supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const suffix = Math.floor(Math.random() * 1000000);
    testEmail = `qa-user-${suffix}@gmail.com`;
    testName = `QA Loop Master ${suffix}`;
    petName = `Rocco ${suffix}`;
  });

  test('debe completar todos los flujos de la aplicación de extremo a extremo', async ({ page }) => {
    test.setTimeout(120000);
    // -------------------------------------------------------------
    // FLOW-01: Registro de un usuario nuevo
    // -------------------------------------------------------------
    console.log(`[FLOW-01] Creando usuario confirmado en Supabase: ${testEmail}`);
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { full_name: testName }
    });
    if (userError || !userData?.user) {
      throw new Error(`Error al crear usuario confirmado: ${userError?.message}`);
    }
    console.log(`[FLOW-01] Usuario creado con éxito`);

    // -------------------------------------------------------------
    // FLOW-02: Login
    // -------------------------------------------------------------
    console.log(`[FLOW-02] Iniciando sesión en la UI`);
    await page.goto('/auth');
    await expect(page).toHaveTitle(/PetNova/i);
    
    await page.fill('input[placeholder="hola@ejemplo.com"]', testEmail);
    await page.fill('input[placeholder="Mínimo 6 caracteres"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log(`[FLOW-02] Sesión iniciada y redirigido a dashboard`);

    // -------------------------------------------------------------
    // FLOW-03: Crear una mascota
    // -------------------------------------------------------------
    console.log(`[FLOW-03] Registrando una nueva mascota`);
    await page.goto('/dashboard/pets/new');
    await page.fill('input[placeholder="Ej: Rocket, Khaleesi..."]', petName);
    await page.fill('input[placeholder="Ej: Labrador, Maine Coon..."]', 'Beagle');
    await page.click('button:has-text("Perro")');
    await page.fill('input[type="date"]', '2022-04-12');
    await page.fill('input[placeholder="Ej: 4.5"]', '12.5');
    await page.click('button:has-text("GUARDAR MASCOTA ADAPTIVE")');
    
    await page.waitForURL('**/dashboard/pets', { timeout: 10000 });
    const petCard = page.locator(`h3:has-text("${petName}")`);
    await expect(petCard).toBeVisible({ timeout: 10000 });
    console.log(`[FLOW-03] Mascota ${petName} creada y visible en la lista`);

    // -------------------------------------------------------------
    // FLOW-04: Editar mascota
    // -------------------------------------------------------------
    console.log(`[FLOW-04] Editando perfil de la mascota`);
    await page.click(`div.group:has(h3:has-text("${petName}")) a:has-text("Ver Perfil")`);
    await page.waitForURL('**/dashboard/pets/*', { timeout: 10000 });
    
    const petDetailUrl = page.url();
    petId = petDetailUrl.split('/').pop()!;
    
    await page.click('button:has-text("EDITAR PERFIL")');
    await page.fill('input[type="number"]', '14.2');
    await page.click('button:has-text("ACTUALIZAR PERFIL")');
    
    await page.reload();
    await expect(page.locator('span:has-text("14.2 kg")').first()).toBeVisible({ timeout: 15000 });
    console.log(`[FLOW-04] Edición persistida tras recarga (Peso = 14.2 kg)`);

    // -------------------------------------------------------------
    // FLOW-06: Añadir registro de salud
    // -------------------------------------------------------------
    console.log(`[FLOW-06] Añadiendo registro de salud`);
    await page.goto('/dashboard/health');
    await page.click('button:has-text("NUEVO REGISTRO")');
    await page.selectOption('select[required]', petId);
    await page.fill('input[placeholder="Ej: Vacuna Rabia 2025"]', 'Vacuna Parvovirus 2026');
    await page.fill('textarea', 'Dosis anual.');
    await page.click('button:has-text("Guardar en la Cartilla")');
    
    const recordCard = page.locator('h4:has-text("Vacuna Parvovirus 2026")');
    await expect(recordCard).toBeVisible({ timeout: 10000 });
    console.log(`[FLOW-06] Registro de salud añadido exitosamente`);

    // -------------------------------------------------------------
    // FLOW-07: Referidos (Obtención de código)
    // -------------------------------------------------------------
    console.log(`[FLOW-07] Obteniendo código de referido`);
    await page.goto('/dashboard/referral');
    const codeLocator = page.locator('h3:has-text("Tu enlace de invitación") + p + div span >> nth=1');
    await expect(codeLocator).not.toHaveText('--------', { timeout: 10000 });
    referralCode = await codeLocator.innerText();
    console.log(`[FLOW-07] Código de referido obtenido: ${referralCode}`);

    // -------------------------------------------------------------
    // FLOW-02: Logout
    // -------------------------------------------------------------
    console.log(`[FLOW-02] Cerrando sesión`);
    await page.click('button:has-text("Cerrar Sesión")');
    await page.waitForURL('**/', { timeout: 10000 });
    console.log(`[FLOW-02] Sesión cerrada`);

    // -------------------------------------------------------------
    // FLOW-07 (continuación): Registro de amigo con referido
    // -------------------------------------------------------------
    const friendSuffix = Math.floor(Math.random() * 1000000);
    const friendEmail = `qa-friend-${friendSuffix}@gmail.com`;
    const friendName = `QA Friend ${friendSuffix}`;

    console.log(`[FLOW-07] Creando usuario amigo en Supabase: ${friendEmail}`);
    const { data: friendData, error: friendError } = await supabaseAdmin.auth.admin.createUser({
      email: friendEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { full_name: friendName }
    });
    if (friendError || !friendData?.user) {
      throw new Error(`Error al crear amigo: ${friendError?.message}`);
    }

    console.log(`[FLOW-07] Procesando referido RPC en Supabase`);
    const { error: rpcError } = await supabaseAdmin.rpc('process_referral', {
      p_code: referralCode.toUpperCase().trim(),
      p_invitee_id: friendData.user.id
    });
    if (rpcError) {
      throw new Error(`Error al procesar referido RPC: ${rpcError.message}`);
    }

    // Iniciar sesión con el amigo para verificar sus PetCoins
    console.log(`[FLOW-07] Iniciando sesión como amigo`);
    await page.goto('/auth');
    await page.fill('input[placeholder="hola@ejemplo.com"]', friendEmail);
    await page.fill('input[placeholder="Mínimo 6 caracteres"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    const coinsLocator = page.locator('a[href="/dashboard/petcoins"]');
    await expect(coinsLocator).toBeVisible({ timeout: 15000 });
    const coinsText = await coinsLocator.innerText();
    console.log(`[FLOW-07] PetCoins del amigo verificadas: ${coinsText}`);

    // Cerrar sesión del amigo
    await page.click('button:has-text("Cerrar Sesión")');
    await page.waitForURL('**/', { timeout: 10000 });

    // -------------------------------------------------------------
    // FLOW-05: Borrar mascota
    // -------------------------------------------------------------
    console.log(`[FLOW-05] Iniciando sesión como usuario original`);
    await page.goto('/auth');
    await page.fill('input[placeholder="hola@ejemplo.com"]', testEmail);
    await page.fill('input[placeholder="Mínimo 6 caracteres"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    console.log(`[FLOW-05] Eliminando la mascota registrada`);
    await page.goto(`/dashboard/pets/${petId}`);
    
    // Aceptar confirmación
    page.once('dialog', async dialog => {
      await dialog.accept();
    });
    
    // Hacer click en el botón de eliminar (icono shield / delete en el encabezado)
    await page.click('button.bg-red-500\\/10');
    
    await page.waitForURL('**/dashboard/pets', { timeout: 10000 });
    await expect(page.locator(`h3:has-text("${petName}")`)).not.toBeVisible({ timeout: 10000 });
    console.log(`[FLOW-05] Mascota eliminada y desaparecida de la lista`);
  });
});
