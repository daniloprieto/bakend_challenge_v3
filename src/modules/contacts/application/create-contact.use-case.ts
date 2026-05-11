import { ContactEmailAlreadyExistsError } from '../domain/contact.errors.js';
import type { Contact, CreateContactData } from '../domain/contact.entity.js';
import type { ContactRepository } from '../domain/contact.repository.js';

export class CreateContactUseCase {
  constructor(private readonly contactRepository: ContactRepository) {}

  async execute(data: CreateContactData): Promise<Contact> {
    const emailAlreadyExists = await this.contactRepository.existsByEmail(data.email);

    if (emailAlreadyExists) {
      throw new ContactEmailAlreadyExistsError(data.email);
    }

    return this.contactRepository.create(data);
  }
}
