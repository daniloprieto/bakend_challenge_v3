import type { Contact, ContactPhoneCriteria } from '../domain/contact.entity.js';
import type { ContactRepository } from '../domain/contact.repository.js';

export class FindContactByPhoneUseCase {
  constructor(private readonly contactRepository: ContactRepository) {}

  async execute(criteria: ContactPhoneCriteria): Promise<Contact | null> {
    return this.contactRepository.findByPhone(criteria);
  }
}
