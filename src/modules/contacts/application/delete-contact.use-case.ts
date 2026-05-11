import type { ContactRepository } from '../domain/contact.repository.js';

export class DeleteContactUseCase {
  constructor(private readonly contactRepository: ContactRepository) {}

  async execute(contactId: string): Promise<boolean> {
    return this.contactRepository.deleteById(contactId);
  }
}
