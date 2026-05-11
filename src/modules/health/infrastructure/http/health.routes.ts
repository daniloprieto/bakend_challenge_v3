import { Router } from 'express';

import { env } from '../../../../shared/config/env.js';
import { GetHealthStatusUseCase } from '../../application/get-health-status.use-case.js';
import { HealthController } from './health.controller.js';

export function createHealthRouter(): Router {
  const router = Router();
  const getHealthStatus = new GetHealthStatusUseCase({
    environment: env.NODE_ENV,
    serviceName: 'emergencias-backend-challenge',
  });
  const controller = new HealthController(getHealthStatus);

  router.get('/health', controller.show);

  return router;
}
