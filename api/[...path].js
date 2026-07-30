// Vercel serverless catch-all entry point — same as api/index.js.
const app = require('../artifacts/api-server/dist/app.cjs');
module.exports = app.default ?? app;
