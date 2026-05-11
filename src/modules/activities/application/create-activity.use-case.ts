import type { ContactActivity, CreateActivityData } from '../domain/activity.entity.js';
import type { ActivityRepository } from '../domain/activity.repository.js';

export class CreateActivityUseCase {
  constructor(private readonly activityRepository: ActivityRepository) {}

  async execute(data: CreateActivityData): Promise<ContactActivity> {
    return this.activityRepository.create(data);
  }
}
