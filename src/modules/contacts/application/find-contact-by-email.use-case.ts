import type { Contact } from '../domain/contact.entity.js';
import type { ContactRepository } from '../domain/contact.repository.js';

export class FindContactByEmailUseCase {
  constructor(private readonly contactRepository: ContactRepository) {}

  async execute(email: string): Promise<Contact | null> {
    return this.contactRepository.findByEmail(email);
  }
}
