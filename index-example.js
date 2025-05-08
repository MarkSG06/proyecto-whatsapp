const puppeteer = require('puppeteer');
const say = require('say');

const contactName = process.env.NUMBER_NAME_WHATSAPP; // Nombre del contacto o grupo de WhatsApp
const nombreVisible = process.env.NAME_VOICE; // Nombre que se leerá en voz alta
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

  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(contactName);
  await page.waitForTimeout(1500);

  const chatSelector = `span[title="${contactName}"]`;
  await page.waitForSelector(chatSelector, { timeout: 10000 });
  await page.click(chatSelector);
  await page.waitForTimeout(2000);

  console.log(`🎧 Escuchando mensajes nuevos de ${nombreVisible}...`);

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

  // await browser.close();
})();
