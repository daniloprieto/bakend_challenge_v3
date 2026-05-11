import { Router } from 'express';

import { postgresPool } from '../../../../shared/database/postgres-pool.js';
import { CreateContactUseCase } from '../../application/create-contact.use-case.js';
import { DeleteContactUseCase } from '../../application/delete-contact.use-case.js';
import { FindContactByEmailUseCase } from '../../application/find-contact-by-email.use-case.js';
import { FindContactByPhoneUseCase } from '../../application/find-contact-by-phone.use-case.js';
import { FindContactsByPersonalDataUseCase } from '../../application/find-contacts-by-personal-data.use-case.js';
import { UpdateContactPersonalDataUseCase } from '../../application/update-contact-personal-data.use-case.js';
import { PostgresContactRepository } from '../persistence/postgres-contact.repository.js';
import { ContactController } from './contact.controller.js';

export function createContactRouter(): Router {
  const router = Router();
  const contactRepository = new PostgresContactRepository(postgresPool);
  const controller = new ContactController({
    createContact: new CreateContactUseCase(contactRepository),
    deleteContact: new DeleteContactUseCase(contactRepository),
    findContactByEmail: new FindContactByEmailUseCase(contactRepository),
    findContactByPhone: new FindContactByPhoneUseCase(contactRepository),
    findContactsByPersonalData: new FindContactsByPersonalDataUseCase(contactRepository),
    updateContactPersonalData: new UpdateContactPersonalDataUseCase(contactRepository),
  });

  router.post('/contacts', controller.create);
  router.get('/contacts', controller.findByPersonalData);
  router.get('/contacts/by-email', controller.findByEmail);
  router.get('/contacts/by-phone', controller.findByPhone);
  router.patch('/contacts/:id', controller.updatePersonalData);
  router.delete('/contacts/:id', controller.delete);

  return router;
}
