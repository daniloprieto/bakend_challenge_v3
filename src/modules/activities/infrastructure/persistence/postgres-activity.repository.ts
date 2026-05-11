import type { Pool } from 'pg';

import { ActivityContactNotFoundError } from '../../domain/activity.errors.js';
import type {
  ActivityType,
  ContactActivity,
  CreateActivityData,
  FindActivitiesCriteria,
} from '../../domain/activity.entity.js';
import type { ActivityRepository } from '../../domain/activity.repository.js';

type ActivityRow = {
  activity_date: Date;
  activity_type: ActivityType;
  contact_date_of_birth: Date | string;
  contact_email: string;
  contact_first_name: string;
  contact_id: string;
  contact_last_name: string;
  created_at: Date;
  description: string | null;
  id: string;
};

export class PostgresActivityRepository implements ActivityRepository {
  constructor(private readonly pool: Pool) {}

  async create(data: CreateActivityData): Promise<ContactActivity> {
    const contactExists = await this.existsContactById(data.personId);

    if (!contactExists) {
      throw new ActivityContactNotFoundError(data.personId);
    }

    const result = await this.pool.query<ActivityRow>(
      `
        WITH inserted_activity AS (
          INSERT INTO contact_activity (
            person_id,
            activity_type,
            activity_date,
            description
          )
          VALUES ($1, $2, $3, $4)
          RETURNING *
        )
        ${activityWithContactSelect}
      `,
      [data.personId, data.activityType, data.activityDate, data.description ?? null],
    );
    const activity = result.rows[0];

    if (!activity) {
      throw new Error('Failed to create activity');
    }

    return mapActivityRow(activity);
  }

  async findByContactAndType(
    criteria: FindActivitiesCriteria,
  ): Promise<ContactActivity[]> {
    const contactExists = await this.existsContactById(criteria.personId);

    if (!contactExists) {
      throw new ActivityContactNotFoundError(criteria.personId);
    }

    const result = await this.pool.query<ActivityRow>(
      `
        WITH inserted_activity AS (
          SELECT *
          FROM contact_activity
          WHERE person_id = $1
            AND activity_type = $2
        )
        ${activityWithContactSelect}
        ORDER BY inserted_activity.activity_date DESC, inserted_activity.id DESC
      `,
      [criteria.personId, criteria.activityType],
    );

    return result.rows.map(mapActivityRow);
  }

  private async existsContactById(personId: string): Promise<boolean> {
    const result = await this.pool.query<{ exists: boolean }>(
      'SELECT EXISTS (SELECT 1 FROM person WHERE id = $1)',
      [personId],
    );

    return result.rows[0]?.exists ?? false;
  }
}

const activityWithContactSelect = `
  SELECT
    inserted_activity.id,
    inserted_activity.activity_type,
    inserted_activity.activity_date,
    inserted_activity.description,
    inserted_activity.created_at,
    person.id AS contact_id,
    person.first_name AS contact_first_name,
    person.last_name AS contact_last_name,
    person.email AS contact_email,
    person.date_of_birth AS contact_date_of_birth
  FROM inserted_activity
  INNER JOIN person ON person.id = inserted_activity.person_id
`;

function mapActivityRow(row: ActivityRow): ContactActivity {
  return {
    activityDate: row.activity_date.toISOString(),
    activityType: row.activity_type,
    contact: {
      dateOfBirth: toDateOnly(row.contact_date_of_birth),
      email: row.contact_email,
      firstName: row.contact_first_name,
      id: row.contact_id,
      lastName: row.contact_last_name,
    },
    createdAt: row.created_at.toISOString(),
    description: row.description,
    id: row.id,
  };
}

function toDateOnly(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
}
