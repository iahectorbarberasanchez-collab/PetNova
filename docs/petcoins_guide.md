# PetNova: Guía Maestra de PetCoins 🪙

Esta guía centraliza toda la información sobre el sistema de recompensas nativo de **PetNova**: las PetCoins (PC). El documento está dividido en dos partes: una sección operativa para el equipo interno y una guía de referencia para los usuarios de la comunidad.

---

## 🏛️ SECCIÓN 1: Manual para el Equipo PetNova (Staff)

Esta sección detalla la lógica de negocio, arquitectura y propósitos estratégicos de las PetCoins.

### 1.1. Filosofía del Sistema
Las PetCoins no son solo una moneda virtual; son una herramienta de **retención (retention)** y **gamificación**. Su propósito es incentivar la tenencia responsable de mascotas y aumentar el tiempo de vida (LTV) del usuario en la plataforma.

### 1.2. Mecanismos de Emisión (Minting)
Para mantener la salud económica del ecosistema, las PetCoins se generan bajo reglas estrictas:

*   **Paseos Activos**: 
    *   **Tasa**: 15 PC por cada cada kilómetro recorrido.
    *   **Bono**: 20 PC adicionales si el paseo supera los 30 minutos.
    *   **Límite Diario**: Máximo 100 PC por día (para evitar abusos o "farming").
*   **Comunidad**: Participación en Pet-stagram, comentarios y reportes de alertas.
*   **Plan Premium (PetNova Pro)**: Suscriptores reciben una subvención de **500 PC mensuales** y multiplicadores de ganancia.
*   **Referidos**: 50 PC para quien invita, 100 PC para el nuevo usuario.

### 1.3. Lógica Anti-Fraude
El sistema incluye validaciones en tiempo real (`RecordWalkPage`) para asegurar que los paseos sean reales:
*   **Límite de Velocidad**: Si la velocidad promedio supera los **15 km/h**, el paseo no genera monedas (asumiendo que el usuario va en coche o transporte público).
*   **Geolocalización**: Verificación de saltos GPS incoherentes.

### 1.4. Sumideros de Moneda (Burning & Utility)
Para evitar la inflación de la moneda, PetNova ofrece canales de salida de alto valor:
*   **Fondo de Donaciones Mensual**: PetNova destina un bote real de **200 € mensuales** para refugios. Los usuarios gastan sus PC para votar qué refugio se queda con el bote. (Estratégico: Mejora la imagen de marca y RSC).
*   **Acuerdos B2B (Marketplace)**: Cupones de descuento (hasta 30%) en tiendas afiliadas. PetNova actúa como intermediario de tráfico.
*   **Servicios Veterinarios**: Pagos parciales en clínicas de la red.

### 1.5. Glosario Técnico (Tablas DB)
*   `profiles.pet_coins`: Saldo actual del usuario (entero).
*   `petcoin_transactions`: Historial de entradas y salidas.
*   `donation_votes`: Registro de votos mensuales al fondo solidario.
*   `walks`: Fuente primaria de emisión por actividad física.

---

## 🐶 SECCIÓN 2: Guía de Usuario - ¡Saca el máximo provecho a tus PetCoins!

¡Hola, Pet-Lover! Bienvenido al sistema de recompensas que premia tu amor por los animales.

### ¿Qué son las PetCoins?
Las **PetCoins (PC)** son la moneda mágica de PetNova. Se ganan siendo un dueño increíble y se gastan para ayudar a otros animales o conseguir regalitos para tu peludo.

### 🚀 ¿Cómo puedo ganar PetCoins?
1.  **¡Camina con tu mascota!**: Abre el rastreador de paseos. Ganarás monedas por cada kilómetro que recorras y un extra si el paseo es de más de media hora.
2.  **Sé social**: Sube fotos a Pet-stagram, comenta las fotos de otros y ayuda reportando mascotas perdidas.
3.  **Invita a tus amigos**: Comparte tu enlace de invitación. Cuando tu amigo se registre con tu código, ¡ambos recibiréis un pack de bienvenida!
4.  **PetNova Pro**: Si eres usuario Premium, recibirás directamente **500 PC cada mes** para gastar en lo que quieras.

### 💎 ¿En qué puedo usarlas?
*   **Fondo Solidario (Votación)**: ¿Tienes un refugio favorito? Usa tus PetCoins para votar por ellos. El refugio con más votos al mes recibirá **una donación de 200 €** directamente de PetNova. ¡Tus paseos salvan vidas!
*   **Descuentos en Comida y Juguetes**: Canjea tus monedas por cupones de hasta el **30% de descuento** en las mejores tiendas de mascotas.
*   **Veterinario**: Algunas consultas y limpiezas dentales se pueden pagar con PetCoins en nuestra red de veterinarios asociados.
*   **Personaliza tu Perfil**: Desbloquea marcos dorados para la foto de tu mascota o insignias de "Dueño Experto".

> [!TIP]
> ¡No olvides registrar tu paseo cada día! Es la forma más rápida y saludable de llenar tu monedero virtual. 🐕✨
