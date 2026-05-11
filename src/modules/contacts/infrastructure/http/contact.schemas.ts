import { z } from 'zod';

const nonEmptyStringSchema = z.string().trim().min(1);
const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: 'Expected date format YYYY-MM-DD',
});

export const createContactSchema = z.object({
  addresses: z
    .array(
      z.object({
        locality: nonEmptyStringSchema,
        notes: z.string().trim().nullable().optional(),
        number: z.coerce.number().int().positive(),
        street: nonEmptyStringSchema,
      }),
    )
    .default([]),
  dateOfBirth: dateOnlySchema,
  email: z.email(),
  firstName: nonEmptyStringSchema,
  lastName: nonEmptyStringSchema,
  phones: z
    .array(
      z.object({
        number: nonEmptyStringSchema,
        typeName: nonEmptyStringSchema,
      }),
    )
    .default([]),
});

export const findContactByEmailSchema = z.object({
  email: z.email(),
});

export const findContactByPhoneSchema = z.object({
  number: nonEmptyStringSchema,
  typeName: nonEmptyStringSchema,
});

export const findContactsByPersonalDataSchema = z
  .object({
    dateOfBirth: dateOnlySchema.optional(),
    firstName: z.string().trim().min(1).optional(),
    lastName: z.string().trim().min(1).optional(),
  })
  .refine(
    (criteria) =>
      Boolean(criteria.dateOfBirth || criteria.firstName || criteria.lastName),
    {
      message:
        'At least one search criterion is required: firstName, lastName or dateOfBirth',
    },
  );
