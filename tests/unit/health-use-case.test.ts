import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { GetHealthStatusUseCase } from '../../src/modules/health/application/get-health-status.use-case.js';

describe('GetHealthStatusUseCase', () => {
  it('returns service health metadata', () => {
    const useCase = new GetHealthStatusUseCase({
      environment: 'test',
      serviceName: 'backend-challenge',
    });

    const result = useCase.execute();

    assert.equal(result.environment, 'test');
    assert.equal(result.service, 'backend-challenge');
    assert.equal(result.status, 'ok');
    assert.match(result.timestamp, /^\d{4}-\d{2}-\d{2}T/);
    assert.equal(typeof result.uptime, 'number');
  });
});
