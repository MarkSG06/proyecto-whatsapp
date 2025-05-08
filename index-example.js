const puppeteer = require('puppeteer');
const say = require('say');
require('dotenv').config(); // 👈 Carga variables del archivo .env

// Cargar variables de entorno
const contactName = process.env.NUMBER_NAME_WHATSAPP;
const nombreVisible = process.env.NAME_VOICE;

// Validación básica
if (!contactName || !nombreVisible) {
  console.error('❌ Las variables de entorno no están definidas correctamente.');
  console.error('NUMBER_NAME_WHATSAPP:', contactName);
  console.error('NAME_VOICE:', nombreVisible);
  process.exit(1);
}

let ultimoLeido = '';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: './user_data',
    defaultViewport: null
  });

  const page = await browser.newPage();
  await page.goto('https://web.whatsapp.com');

  console.log('🔐 Escanea el código QR si hace falta. Luego pulsa ENTER para empezar...');
  await new Promise(resolve => process.stdin.once('data', resolve));

  const searchBoxSelector = 'div[role="textbox"][contenteditable="true"]';
  await page.waitForSelector(searchBoxSelector, { timeout: 30000 });
  await page.click(searchBoxSelector);

  // Limpiar campo de búsqueda
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');

  // Asegurarse de que contactName es string y escribirlo
  await page.keyboard.type(String(contactName));
  await page.waitForTimeout(1500);

  // Buscar y abrir el chat
  const chatSelector = `span[title="${contactName}"]`;
  await page.waitForSelector(chatSelector, { timeout: 10000 });
  await page.click(chatSelector);
  await page.waitForTimeout(2000);

  console.log(`🎧 Escuchando mensajes nuevos de ${nombreVisible}...`);

  // Bucle de escucha de mensajes
  while (true) {
    try {
      const mensajes = await page.$$eval(
        'div.message-in span.selectable-text.copyable-text span',
        spans => spans.map(span => span.textContent.trim()).filter(text => text.length > 0)
      );

      const ultimoMensaje = mensajes[mensajes.length - 1];

      if (ultimoMensaje && ultimoMensaje !== ultimoLeido) {
        console.log(`🆕 ${nombreVisible} dice: ${ultimoMensaje}`);
        ultimoLeido = ultimoMensaje;

        await new Promise(resolve => {
          say.speak(`${nombreVisible} dice: ${ultimoMensaje}`, 'Microsoft Helena Desktop', 1.0, resolve);
        });
      }

    } catch (err) {
      console.warn(`⚠️ Error: ${err.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // await browser.close(); // Opcional si lo quieres cerrar manualmente
})();
