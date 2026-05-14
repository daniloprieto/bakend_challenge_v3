import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { createActivityRouter } from '../../modules/activities/infrastructure/http/activity.routes.js';
import { createContactRouter } from '../../modules/contacts/infrastructure/http/contact.routes.js';
import { createHealthRouter } from '../../modules/health/infrastructure/http/health.routes.js';
import { env } from '../config/env.js';
import { errorHandler } from './middlewares/error-handler.middleware.js';
import { notFoundHandler } from './middlewares/not-found-handler.middleware.js';
import { openApiDocument } from './openapi.js';

export function createApp(): express.Express {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());
  app.use(express.json());

  app.get(`${env.API_PREFIX}/openapi.json`, (_request, response) => {
    response.status(200).json(openApiDocument);
  });
  app.use(`${env.API_PREFIX}/docs`, swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.use(env.API_PREFIX, createActivityRouter());
  app.use(env.API_PREFIX, createContactRouter());
  app.use(env.API_PREFIX, createHealthRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
