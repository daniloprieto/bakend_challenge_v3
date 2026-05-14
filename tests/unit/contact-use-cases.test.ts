import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CreateContactUseCase } from '../../src/modules/contacts/application/create-contact.use-case.js';
import { DeleteContactUseCase } from '../../src/modules/contacts/application/delete-contact.use-case.js';
import { FindContactByEmailUseCase } from '../../src/modules/contacts/application/find-contact-by-email.use-case.js';
import { FindContactByPhoneUseCase } from '../../src/modules/contacts/application/find-contact-by-phone.use-case.js';
import { FindContactsByPersonalDataUseCase } from '../../src/modules/contacts/application/find-contacts-by-personal-data.use-case.js';
import { UpdateContactPersonalDataUseCase } from '../../src/modules/contacts/application/update-contact-personal-data.use-case.js';
import { ContactEmailAlreadyExistsError } from '../../src/modules/contacts/domain/contact.errors.js';
import type {
  Contact,
  ContactPersonalDataCriteria,
  ContactPhoneCriteria,
  CreateContactData,
  UpdateContactPersonalData,
} from '../../src/modules/contacts/domain/contact.entity.js';
import type { ContactRepository } from '../../src/modules/contacts/domain/contact.repository.js';

const contact: Contact = {
  addresses: [
    {
      id: 'address-1',
      locality: 'Cordoba',
      notes: null,
      number: 100,
      street: 'San Martin',
    },
  ],
  createdAt: '2026-05-11T12:00:00.000Z',
  dateOfBirth: '1815-12-10',
  email: 'ada@example.com',
  firstName: 'Ada',
  id: '1',
  lastName: 'Lovelace',
  phones: [
    {
      id: 'phone-1',
      number: '555-1000',
      type: {
        id: 'phone-type-1',
        typeName: 'mobile',
      },
    },
  ],
  updatedAt: '2026-05-11T12:00:00.000Z',
};

const createContactData: CreateContactData = {
  addresses: [
    {
      locality: 'Cordoba',
      notes: null,
      number: 100,
      street: 'San Martin',
    },
  ],
  dateOfBirth: contact.dateOfBirth,
  email: contact.email,
  firstName: contact.firstName,
  lastName: contact.lastName,
  phones: [
    {
      number: '555-1000',
      typeName: 'mobile',
    },
  ],
};

class ContactRepositoryStub implements ContactRepository {
  createCalls: CreateContactData[] = [];
  deleteByIdCalls: string[] = [];
  existsByEmailCalls: string[] = [];
  findByEmailCalls: string[] = [];
  findByPersonalDataCalls: ContactPersonalDataCriteria[] = [];
  findByPhoneCalls: ContactPhoneCriteria[] = [];
  updatePersonalDataCalls: Array<{
    contactId: string;
    data: UpdateContactPersonalData;
  }> = [];

  constructor(
    private readonly responses: {
      create?: Contact;
      deleteById?: boolean;
      existsByEmail?: boolean;
      findByEmail?: Contact | null;
      findByPersonalData?: Contact[];
      findByPhone?: Contact | null;
      updatePersonalData?: Contact | null;
    } = {},
  ) {}

  async create(data: CreateContactData): Promise<Contact> {
    this.createCalls.push(data);
    return this.responses.create ?? contact;
  }

  async deleteById(contactId: string): Promise<boolean> {
    this.deleteByIdCalls.push(contactId);
    return this.responses.deleteById ?? true;
  }

  async existsByEmail(email: string): Promise<boolean> {
    this.existsByEmailCalls.push(email);
    return this.responses.existsByEmail ?? false;
  }

  async findByEmail(email: string): Promise<Contact | null> {
    this.findByEmailCalls.push(email);
    return this.responses.findByEmail ?? contact;
  }

  async findByPersonalData(criteria: ContactPersonalDataCriteria): Promise<Contact[]> {
    this.findByPersonalDataCalls.push(criteria);
    return this.responses.findByPersonalData ?? [contact];
  }

  async findByPhone(criteria: ContactPhoneCriteria): Promise<Contact | null> {
    this.findByPhoneCalls.push(criteria);
    return this.responses.findByPhone ?? contact;
  }

  async updatePersonalData(
    contactId: string,
    data: UpdateContactPersonalData,
  ): Promise<Contact | null> {
    this.updatePersonalDataCalls.push({ contactId, data });
    return this.responses.updatePersonalData ?? contact;
  }
}

describe('contact use cases', () => {
  it('creates a contact when the email is available', async () => {
    const repository = new ContactRepositoryStub();
    const useCase = new CreateContactUseCase(repository);

    const result = await useCase.execute(createContactData);

    assert.equal(result, contact);
    assert.deepEqual(repository.existsByEmailCalls, [createContactData.email]);
    assert.deepEqual(repository.createCalls, [createContactData]);
  });

  it('rejects duplicated email before creating a contact', async () => {
    const repository = new ContactRepositoryStub({ existsByEmail: true });
    const useCase = new CreateContactUseCase(repository);

    await assert.rejects(
      () => useCase.execute(createContactData),
      ContactEmailAlreadyExistsError,
    );
    assert.deepEqual(repository.existsByEmailCalls, [createContactData.email]);
    assert.deepEqual(repository.createCalls, []);
  });

  it('finds a contact by email', async () => {
    const repository = new ContactRepositoryStub();
    const useCase = new FindContactByEmailUseCase(repository);

    const result = await useCase.execute(contact.email);

    assert.equal(result, contact);
    assert.deepEqual(repository.findByEmailCalls, [contact.email]);
  });

  it('finds contacts by personal data', async () => {
    const repository = new ContactRepositoryStub();
    const useCase = new FindContactsByPersonalDataUseCase(repository);
    const criteria = {
      dateOfBirth: '1815-12-10',
      firstName: 'Ada',
      lastName: 'Lovelace',
    };

    const result = await useCase.execute(criteria);

    assert.deepEqual(result, [contact]);
    assert.deepEqual(repository.findByPersonalDataCalls, [criteria]);
  });

  it('finds a contact by phone number and type', async () => {
    const repository = new ContactRepositoryStub();
    const useCase = new FindContactByPhoneUseCase(repository);
    const criteria = { number: '555-1000', typeName: 'mobile' };

    const result = await useCase.execute(criteria);

    assert.equal(result, contact);
    assert.deepEqual(repository.findByPhoneCalls, [criteria]);
  });

  it('updates contact personal data', async () => {
    const repository = new ContactRepositoryStub();
    const useCase = new UpdateContactPersonalDataUseCase(repository);
    const update = { firstName: 'Ada Augusta' };

    const result = await useCase.execute(contact.id, update);

    assert.equal(result, contact);
    assert.deepEqual(repository.updatePersonalDataCalls, [
      { contactId: contact.id, data: update },
    ]);
  });

  it('deletes a contact by id', async () => {
    const repository = new ContactRepositoryStub();
    const useCase = new DeleteContactUseCase(repository);

    const result = await useCase.execute(contact.id);

    assert.equal(result, true);
    assert.deepEqual(repository.deleteByIdCalls, [contact.id]);
  });
});
