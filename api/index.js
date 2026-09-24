// Función serverless de Vercel. vercel.json reescribe todo /api/* hacia aquí y
// Express recibe la URL original, así que es la misma app que en local
// (server/app.js). En Vercel no hay app.listen(): la plataforma invoca la app
// como manejador (req, res).
import { createApp } from '../server/app.js'

export default createApp()
