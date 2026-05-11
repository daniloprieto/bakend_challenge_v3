import type {
  ContactActivity,
  FindActivitiesCriteria,
} from '../domain/activity.entity.js';
import type { ActivityRepository } from '../domain/activity.repository.js';

export class FindActivitiesByContactAndTypeUseCase {
  constructor(private readonly activityRepository: ActivityRepository) {}

  async execute(criteria: FindActivitiesCriteria): Promise<ContactActivity[]> {
    return this.activityRepository.findByContactAndType(criteria);
  }
}
