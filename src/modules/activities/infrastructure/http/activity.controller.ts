import type { RequestHandler } from 'express';

import type { CreateActivityUseCase } from '../../application/create-activity.use-case.js';
import type { FindActivitiesByContactAndTypeUseCase } from '../../application/find-activities-by-contact-and-type.use-case.js';
import { ActivityContactNotFoundError } from '../../domain/activity.errors.js';
import { asyncHandler } from '../../../../shared/http/async-handler.js';
import { HttpError } from '../../../../shared/http/errors/http-error.js';
import {
  createActivitySchema,
  findActivitiesByContactAndTypeSchema,
} from './activity.schemas.js';

type ActivityControllerDependencies = {
  createActivity: CreateActivityUseCase;
  findActivitiesByContactAndType: FindActivitiesByContactAndTypeUseCase;
};

export class ActivityController {
  constructor(private readonly dependencies: ActivityControllerDependencies) {}

  create: RequestHandler = asyncHandler(async (request, response) => {
    const input = createActivitySchema.parse(request.body);

    try {
      const activity = await this.dependencies.createActivity.execute(input);
      response.status(201).json(activity);
    } catch (error) {
      throw mapActivityError(error);
    }
  });

  findByContactAndType: RequestHandler = asyncHandler(async (request, response) => {
    const query = findActivitiesByContactAndTypeSchema.parse(request.query);

    try {
      const activities =
        await this.dependencies.findActivitiesByContactAndType.execute(query);
      response.status(200).json(activities);
    } catch (error) {
      throw mapActivityError(error);
    }
  });
}

function mapActivityError(error: unknown): unknown {
  if (error instanceof ActivityContactNotFoundError) {
    return new HttpError(error.message, 404);
  }

  return error;
}
