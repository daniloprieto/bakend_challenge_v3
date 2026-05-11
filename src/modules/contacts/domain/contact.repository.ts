import type {
  Contact,
  ContactPersonalDataCriteria,
  ContactPhoneCriteria,
  CreateContactData,
} from './contact.entity.js';

export type ContactRepository = {
  create(data: CreateContactData): Promise<Contact>;
  existsByEmail(email: string): Promise<boolean>;
  findByEmail(email: string): Promise<Contact | null>;
  findByPersonalData(criteria: ContactPersonalDataCriteria): Promise<Contact[]>;
  findByPhone(criteria: ContactPhoneCriteria): Promise<Contact | null>;
};
