import type { RequestHandler } from 'express';

import type { GetHealthStatusUseCase } from '../../application/get-health-status.use-case.js';

export class HealthController {
  constructor(private readonly getHealthStatus: GetHealthStatusUseCase) {}

  show: RequestHandler = (_request, response) => {
    response.status(200).json(this.getHealthStatus.execute());
  };
}
