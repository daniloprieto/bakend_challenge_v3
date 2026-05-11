import type { Pool, PoolClient } from 'pg';

import {
  ContactNotFoundError,
  PhoneTypeNotFoundError,
} from '../../domain/contact.errors.js';
import type {
  Address,
  Contact,
  ContactPersonalDataCriteria,
  ContactPhoneCriteria,
  CreateContactAddress,
  CreateContactData,
  CreateContactPhone,
  Phone,
  UpdateContactPersonalData,
} from '../../domain/contact.entity.js';
import type { ContactRepository } from '../../domain/contact.repository.js';

type PersonRow = {
  created_at: Date;
  date_of_birth: Date | string;
  email: string;
  first_name: string;
  id: string;
  last_name: string;
  updated_at: Date;
};

type PhoneTypeRow = {
  id: string;
  type_name: string;
};

type PhoneRow = {
  id: string;
  number: string;
  phone_type_id: string;
  type_name: string;
};

type AddressRow = {
  id: string;
  locality: string;
  notes: string | null;
  number: number;
  street: string;
};

export class PostgresContactRepository implements ContactRepository {
  constructor(private readonly pool: Pool) {}

  async create(data: CreateContactData): Promise<Contact> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const person = await this.insertPerson(client, data);

      for (const phone of data.phones) {
        await this.insertPhone(client, person.id, phone);
      }

      for (const address of data.addresses) {
        await this.insertAddress(client, person.id, address);
      }

      const contact = await this.findById(client, person.id);

      if (!contact) {
        throw new ContactNotFoundError(person.id);
      }

      await client.query('COMMIT');

      return contact;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    const result = await this.pool.query<{ exists: boolean }>(
      'SELECT EXISTS (SELECT 1 FROM person WHERE LOWER(email) = LOWER($1))',
      [email],
    );

    return result.rows[0]?.exists ?? false;
  }

  async deleteById(contactId: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM person WHERE id = $1', [contactId]);

    return (result.rowCount ?? 0) > 0;
  }

  async findByEmail(email: string): Promise<Contact | null> {
    const result = await this.pool.query<PersonRow>(
      'SELECT * FROM person WHERE LOWER(email) = LOWER($1) LIMIT 1',
      [email],
    );
    const person = result.rows[0];

    if (!person) {
      return null;
    }

    return this.buildContact(this.pool, person);
  }

  async findByPersonalData(criteria: ContactPersonalDataCriteria): Promise<Contact[]> {
    const filters: string[] = [];
    const values: string[] = [];

    if (criteria.firstName) {
      values.push(`%${criteria.firstName}%`);
      filters.push(`first_name ILIKE $${values.length}`);
    }

    if (criteria.lastName) {
      values.push(`%${criteria.lastName}%`);
      filters.push(`last_name ILIKE $${values.length}`);
    }

    if (criteria.dateOfBirth) {
      values.push(criteria.dateOfBirth);
      filters.push(`date_of_birth = $${values.length}`);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
    const result = await this.pool.query<PersonRow>(
      `SELECT * FROM person ${whereClause} ORDER BY last_name, first_name, id`,
      values,
    );

    return Promise.all(result.rows.map((person) => this.buildContact(this.pool, person)));
  }

  async findByPhone(criteria: ContactPhoneCriteria): Promise<Contact | null> {
    const result = await this.pool.query<PersonRow>(
      `
        SELECT person.*
        FROM person
        INNER JOIN phone ON phone.person_id = person.id
        INNER JOIN phone_type ON phone_type.id = phone.phone_type_id
        WHERE phone.number = $1
          AND LOWER(phone_type.type_name) = LOWER($2)
        LIMIT 1
      `,
      [criteria.number, criteria.typeName],
    );
    const person = result.rows[0];

    if (!person) {
      return null;
    }

    return this.buildContact(this.pool, person);
  }

  async updatePersonalData(
    contactId: string,
    data: UpdateContactPersonalData,
  ): Promise<Contact | null> {
    const updates: string[] = [];
    const values: string[] = [];

    if (data.firstName !== undefined) {
      values.push(data.firstName);
      updates.push(`first_name = $${values.length}`);
    }

    if (data.lastName !== undefined) {
      values.push(data.lastName);
      updates.push(`last_name = $${values.length}`);
    }

    if (data.dateOfBirth !== undefined) {
      values.push(data.dateOfBirth);
      updates.push(`date_of_birth = $${values.length}`);
    }

    if (data.email !== undefined) {
      values.push(data.email);
      updates.push(`email = $${values.length}`);
    }

    if (updates.length === 0) {
      return this.findById(this.pool, contactId);
    }

    values.push(contactId);
    const result = await this.pool.query<PersonRow>(
      `
        UPDATE person
        SET ${updates.join(', ')},
            updated_at = NOW()
        WHERE id = $${values.length}
        RETURNING *
      `,
      values,
    );
    const person = result.rows[0];

    if (!person) {
      return null;
    }

    return this.buildContact(this.pool, person);
  }

  private async insertPerson(
    client: PoolClient,
    data: CreateContactData,
  ): Promise<PersonRow> {
    const result = await client.query<PersonRow>(
      `
        INSERT INTO person (first_name, last_name, date_of_birth, email)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      [data.firstName, data.lastName, data.dateOfBirth, data.email],
    );
    const person = result.rows[0];

    if (!person) {
      throw new Error('Failed to create contact');
    }

    return person;
  }

  private async insertPhone(
    client: PoolClient,
    personId: string,
    phone: CreateContactPhone,
  ): Promise<void> {
    const phoneType = await this.findPhoneTypeByName(client, phone.typeName);

    await client.query(
      `
        INSERT INTO phone (number, person_id, phone_type_id)
        VALUES ($1, $2, $3)
      `,
      [phone.number, personId, phoneType.id],
    );
  }

  private async insertAddress(
    client: PoolClient,
    personId: string,
    address: CreateContactAddress,
  ): Promise<void> {
    await client.query(
      `
        INSERT INTO address (person_id, locality, street, number, notes)
        VALUES ($1, $2, $3, $4, $5)
      `,
      [personId, address.locality, address.street, address.number, address.notes ?? null],
    );
  }

  private async findById(
    client: Pool | PoolClient,
    personId: string,
  ): Promise<Contact | null> {
    const result = await client.query<PersonRow>(
      'SELECT * FROM person WHERE id = $1 LIMIT 1',
      [personId],
    );
    const person = result.rows[0];

    if (!person) {
      return null;
    }

    return this.buildContact(client, person);
  }

  private async findPhoneTypeByName(
    client: Pool | PoolClient,
    typeName: string,
  ): Promise<PhoneTypeRow> {
    const result = await client.query<PhoneTypeRow>(
      'SELECT id, type_name FROM phone_type WHERE LOWER(type_name) = LOWER($1)',
      [typeName],
    );
    const phoneType = result.rows[0];

    if (!phoneType) {
      throw new PhoneTypeNotFoundError(typeName);
    }

    return phoneType;
  }

  private async buildContact(
    client: Pool | PoolClient,
    person: PersonRow,
  ): Promise<Contact> {
    const [phones, addresses] = await Promise.all([
      this.findPhonesByPersonId(client, person.id),
      this.findAddressesByPersonId(client, person.id),
    ]);

    return {
      addresses,
      createdAt: person.created_at.toISOString(),
      dateOfBirth: toDateOnly(person.date_of_birth),
      email: person.email,
      firstName: person.first_name,
      id: person.id,
      lastName: person.last_name,
      phones,
      updatedAt: person.updated_at.toISOString(),
    };
  }

  private async findPhonesByPersonId(
    client: Pool | PoolClient,
    personId: string,
  ): Promise<Phone[]> {
    const result = await client.query<PhoneRow>(
      `
        SELECT
          phone.id,
          phone.number,
          phone_type.id AS phone_type_id,
          phone_type.type_name
        FROM phone
        INNER JOIN phone_type ON phone_type.id = phone.phone_type_id
        WHERE phone.person_id = $1
        ORDER BY phone.id
      `,
      [personId],
    );

    return result.rows.map((row) => ({
      id: row.id,
      number: row.number,
      type: {
        id: row.phone_type_id,
        typeName: row.type_name,
      },
    }));
  }

  private async findAddressesByPersonId(
    client: Pool | PoolClient,
    personId: string,
  ): Promise<Address[]> {
    const result = await client.query<AddressRow>(
      `
        SELECT id, locality, street, number, notes
        FROM address
        WHERE person_id = $1
        ORDER BY id
      `,
      [personId],
    );

    return result.rows.map((row) => ({
      id: row.id,
      locality: row.locality,
      notes: row.notes,
      number: row.number,
      street: row.street,
    }));
  }
}

function toDateOnly(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
}
