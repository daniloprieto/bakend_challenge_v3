import type { Contact, ContactPersonalDataCriteria } from '../domain/contact.entity.js';
import type { ContactRepository } from '../domain/contact.repository.js';

export class FindContactsByPersonalDataUseCase {
  constructor(private readonly contactRepository: ContactRepository) {}

  async execute(criteria: ContactPersonalDataCriteria): Promise<Contact[]> {
    return this.contactRepository.findByPersonalData(criteria);
  }
}
