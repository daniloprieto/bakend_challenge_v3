export const activityTypes = ['call', 'meeting', 'email'] as const;

export type ActivityType = (typeof activityTypes)[number];

export type ActivityContactDetails = {
  dateOfBirth: string;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
};

export type ContactActivity = {
  activityDate: string;
  activityType: ActivityType;
  contact: ActivityContactDetails;
  createdAt: string;
  description: string | null;
  id: string;
};

export type CreateActivityData = {
  activityDate: string;
  activityType: ActivityType;
  description?: string | null;
  personId: string;
};

export type FindActivitiesCriteria = {
  activityType: ActivityType;
  personId: string;
};
