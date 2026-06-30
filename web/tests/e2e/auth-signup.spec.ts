import { test, expect } from '@playwright/test';

test.describe('Flow 01: Registro de un usuario nuevo', () => {
  test('debe registrar un usuario nuevo exitosamente y mostrar mensaje de confirmación', async ({ page }) => {
    // 1. Ir a la página de login/registro
    await page.goto('/auth');

    // Verificar que estamos en la página correcta
    await expect(page).toHaveTitle(/PetNova/i);
    await expect(page.locator('h1')).toHaveText(/PetNova/i);

    // 2. Cambiar al modo de registro ("Registrarse")
    const switchButton = page.locator('button:has-text("Registrarse")');
    await switchButton.click();

    // Generar datos aleatorios de prueba
    const randomSuffix = Math.floor(Math.random() * 1000000);
    const testName = `QA Tester ${randomSuffix}`;
    const testEmail = `test-qa-${randomSuffix}@example.com`;
    const testPassword = `PassWord${randomSuffix}!`;

    // 3. Rellenar el formulario
    await page.fill('input[placeholder="Tu nombre y apellido"]', testName);
    await page.fill('input[placeholder="hola@ejemplo.com"]', testEmail);
    await page.fill('input[placeholder="Mínimo 6 caracteres"]', testPassword);

    // 4. Enviar el formulario
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toHaveText(/Registrarme/i);
    await submitButton.click();

    // 5. Verificar que se muestra el mensaje de éxito
    const successAlert = page.locator('text=¡Revisa tu email para confirmar tu cuenta!');
    await expect(successAlert).toBeVisible({ timeout: 15000 });

    console.log(`Usuario registrado exitosamente en prueba: Email=${testEmail}, Nombre=${testName}`);
  });
});
