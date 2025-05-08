const say = require('say');

// Texto a leer
const texto = "Hola soy TEST, esto es una prueba de voz desde Node.js";

// Intenta usar una voz específica (opcional, solo para Windows)
say.speak(texto, 'Microsoft Helena Desktop', 1.0, (err) => {
  if (err) {
    return console.error('Error al hablar:', err);
  }
  console.log('✅ Voz reproducida correctamente');
});
