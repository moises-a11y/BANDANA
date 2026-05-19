require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  mercadoPago: {
    accessToken: process.env.MP_ACCESS_TOKEN,
    baseUrl: process.env.MP_BASE_URL || 'https://api.mercadopago.com',
  },
};

if (!config.mercadoPago.accessToken) {
  throw new Error('Falta la variable de entorno MP_ACCESS_TOKEN (ver .env.example)');
}

module.exports = config;
