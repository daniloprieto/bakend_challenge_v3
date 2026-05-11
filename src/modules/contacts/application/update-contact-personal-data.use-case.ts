import type { Contact, UpdateContactPersonalData } from '../domain/contact.entity.js';
import type { ContactRepository } from '../domain/contact.repository.js';

export class UpdateContactPersonalDataUseCase {
  constructor(private readonly contactRepository: ContactRepository) {}

  async execute(
    contactId: string,
    data: UpdateContactPersonalData,
  ): Promise<Contact | null> {
    return this.contactRepository.updatePersonalData(contactId, data);
  }
}
