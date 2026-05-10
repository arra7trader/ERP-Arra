const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');
const { AppModule } = require('../dist/src/app.module');

const server = express();
let app;

module.exports = async (req, res) => {
  if (!app) {
    const expressApp = new ExpressAdapter(server);
    app = await NestFactory.create(AppModule, expressApp);
    
    app.enableCors({
      origin: true,
      credentials: true,
    });
    
    await app.init();
  }
  
  server(req, res);
};
