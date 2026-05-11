import type {
  ContactActivity,
  CreateActivityData,
  FindActivitiesCriteria,
} from './activity.entity.js';

export type ActivityRepository = {
  create(data: CreateActivityData): Promise<ContactActivity>;
  findByContactAndType(criteria: FindActivitiesCriteria): Promise<ContactActivity[]>;
};
