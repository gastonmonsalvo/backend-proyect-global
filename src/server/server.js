const express = require('express');
const app = express();

const bookRouter = require('../routers/books.routes');

const logger = require('../utils/logger');
const requireJson = require('../utils/requiereJson');

app.use(express.json());

// Middlewares globales
app.use(logger);
app.use(requireJson);

// Rutas
app.use('/api/books', bookRouter);

// Healthcheck
app.get('/health', (_req, res) => res.json({ ok: true }));

// 404 
app.use((_req, res) => res.status(404).json({ statusCode: 404, message: 'Ruta no encontrada' }));

module.exports = app;
