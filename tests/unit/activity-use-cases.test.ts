import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CreateActivityUseCase } from '../../src/modules/activities/application/create-activity.use-case.js';
import { FindActivitiesByContactAndTypeUseCase } from '../../src/modules/activities/application/find-activities-by-contact-and-type.use-case.js';
import type {
  ContactActivity,
  CreateActivityData,
  FindActivitiesCriteria,
} from '../../src/modules/activities/domain/activity.entity.js';
import type { ActivityRepository } from '../../src/modules/activities/domain/activity.repository.js';

const activity: ContactActivity = {
  activityDate: '2026-05-11T12:00:00.000Z',
  activityType: 'call',
  contact: {
    dateOfBirth: '1815-12-10',
    email: 'ada@example.com',
    firstName: 'Ada',
    id: '1',
    lastName: 'Lovelace',
  },
  createdAt: '2026-05-11T12:00:01.000Z',
  description: 'Follow-up call',
  id: 'activity-1',
};

class ActivityRepositoryStub implements ActivityRepository {
  createCalls: CreateActivityData[] = [];
  findByContactAndTypeCalls: FindActivitiesCriteria[] = [];

  constructor(
    private readonly responses: {
      create?: ContactActivity;
      findByContactAndType?: ContactActivity[];
    } = {},
  ) {}

  async create(data: CreateActivityData): Promise<ContactActivity> {
    this.createCalls.push(data);
    return this.responses.create ?? activity;
  }

  async findByContactAndType(
    criteria: FindActivitiesCriteria,
  ): Promise<ContactActivity[]> {
    this.findByContactAndTypeCalls.push(criteria);
    return this.responses.findByContactAndType ?? [activity];
  }
}

describe('activity use cases', () => {
  it('creates an activity', async () => {
    const repository = new ActivityRepositoryStub();
    const useCase = new CreateActivityUseCase(repository);
    const input: CreateActivityData = {
      activityDate: activity.activityDate,
      activityType: activity.activityType,
      description: activity.description,
      personId: activity.contact.id,
    };

    const result = await useCase.execute(input);

    assert.equal(result, activity);
    assert.deepEqual(repository.createCalls, [input]);
  });

  it('finds activities by contact and type', async () => {
    const repository = new ActivityRepositoryStub();
    const useCase = new FindActivitiesByContactAndTypeUseCase(repository);
    const criteria: FindActivitiesCriteria = {
      activityType: 'call',
      personId: activity.contact.id,
    };

    const result = await useCase.execute(criteria);

    assert.deepEqual(result, [activity]);
    assert.deepEqual(repository.findByContactAndTypeCalls, [criteria]);
  });
});
