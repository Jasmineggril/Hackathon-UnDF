// Vercel serverless entry point — imports the pre-built CJS Express app (no listen()).
// Built by artifacts/api-server/build.mjs → dist/app.cjs
const app = require('../artifacts/api-server/dist/app.cjs');
module.exports = app.default ?? app;
