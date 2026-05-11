import { z } from 'zod';

import { activityTypes } from '../../domain/activity.entity.js';

const positiveIdSchema = z.string().regex(/^\d+$/, {
  message: 'Expected a positive numeric id',
});

const dateTimeSchema = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: 'Expected a valid date-time value',
});

export const createActivitySchema = z.object({
  activityDate: dateTimeSchema,
  activityType: z.enum(activityTypes),
  description: z.string().trim().nullable().optional(),
  personId: positiveIdSchema,
});

export const findActivitiesByContactAndTypeSchema = z.object({
  activityType: z.enum(activityTypes),
  personId: positiveIdSchema,
});
