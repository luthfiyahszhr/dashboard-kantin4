import express, { type Request, type Response, type Application } from 'express';
import cors from 'cors';
import { sql } from 'drizzle-orm';
import { z } from 'zod';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './docs/swagger-output.json' with { type: 'json' };
import { assertAuthConfiguration } from './config/authConfig.ts';
import { getDb } from './db/index.ts';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.ts';
import { authRouter } from './routes/authRouter.ts';
import { stallRouter } from './routes/stallRouter.ts';

const app: Application = express();
const PORT: number = Number(process.env.PORT ?? 3000);

assertAuthConfiguration();
z.config(z.locales.id());
app.use(cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  allowedHeaders: ['Authorization', 'Content-Type'],
}));
app.use(express.json());

// Dokumentasi API (Swagger UI) dari spec hasil generate swagger-autogen.
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/health', async (req: Request, res: Response) => {
  const db = await getDb();
  await db.execute(sql`SELECT 1 AS ok`);
  res.status(200).json({ status: 'success', message: 'Server dan database terhubung' });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/stalls', stallRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
