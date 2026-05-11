import type { HealthStatus } from '../domain/health-status.js';

type GetHealthStatusDependencies = {
  environment: string;
  serviceName: string;
};

export class GetHealthStatusUseCase {
  constructor(private readonly dependencies: GetHealthStatusDependencies) {}

  execute(): HealthStatus {
    return {
      environment: this.dependencies.environment,
      service: this.dependencies.serviceName,
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
