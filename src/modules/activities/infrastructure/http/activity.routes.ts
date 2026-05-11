import { Router } from 'express';

import { postgresPool } from '../../../../shared/database/postgres-pool.js';
import { CreateActivityUseCase } from '../../application/create-activity.use-case.js';
import { FindActivitiesByContactAndTypeUseCase } from '../../application/find-activities-by-contact-and-type.use-case.js';
import { ActivityController } from './activity.controller.js';
import { PostgresActivityRepository } from '../persistence/postgres-activity.repository.js';

export function createActivityRouter(): Router {
  const router = Router();
  const activityRepository = new PostgresActivityRepository(postgresPool);
  const controller = new ActivityController({
    createActivity: new CreateActivityUseCase(activityRepository),
    findActivitiesByContactAndType: new FindActivitiesByContactAndTypeUseCase(
      activityRepository,
    ),
  });

  router.post('/activities', controller.create);
  router.get('/activities', controller.findByContactAndType);

  return router;
}
