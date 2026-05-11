import type { RequestHandler } from 'express';

import type { CreateContactUseCase } from '../../application/create-contact.use-case.js';
import type { DeleteContactUseCase } from '../../application/delete-contact.use-case.js';
import type { FindContactByEmailUseCase } from '../../application/find-contact-by-email.use-case.js';
import type { FindContactByPhoneUseCase } from '../../application/find-contact-by-phone.use-case.js';
import type { FindContactsByPersonalDataUseCase } from '../../application/find-contacts-by-personal-data.use-case.js';
import type { UpdateContactPersonalDataUseCase } from '../../application/update-contact-personal-data.use-case.js';
import {
  ContactEmailAlreadyExistsError,
  PhoneTypeNotFoundError,
} from '../../domain/contact.errors.js';
import { HttpError } from '../../../../shared/http/errors/http-error.js';
import { asyncHandler } from '../../../../shared/http/async-handler.js';
import {
  contactParamsSchema,
  createContactSchema,
  findContactByEmailSchema,
  findContactByPhoneSchema,
  findContactsByPersonalDataSchema,
  updateContactPersonalDataSchema,
} from './contact.schemas.js';

type ContactControllerDependencies = {
  createContact: CreateContactUseCase;
  deleteContact: DeleteContactUseCase;
  findContactByEmail: FindContactByEmailUseCase;
  findContactByPhone: FindContactByPhoneUseCase;
  findContactsByPersonalData: FindContactsByPersonalDataUseCase;
  updateContactPersonalData: UpdateContactPersonalDataUseCase;
};

export class ContactController {
  constructor(private readonly dependencies: ContactControllerDependencies) {}

  create: RequestHandler = asyncHandler(async (request, response) => {
    const input = createContactSchema.parse(request.body);

    try {
      const contact = await this.dependencies.createContact.execute(input);
      response.status(201).json(contact);
    } catch (error) {
      throw mapContactError(error);
    }
  });

  findByEmail: RequestHandler = asyncHandler(async (request, response) => {
    const query = findContactByEmailSchema.parse(request.query);
    const contact = await this.dependencies.findContactByEmail.execute(query.email);

    if (!contact) {
      throw new HttpError('Contact not found', 404, 'CONTACT_NOT_FOUND');
    }

    response.status(200).json(contact);
  });

  findByPhone: RequestHandler = asyncHandler(async (request, response) => {
    const query = findContactByPhoneSchema.parse(request.query);
    const contact = await this.dependencies.findContactByPhone.execute(query);

    if (!contact) {
      throw new HttpError('Contact not found', 404, 'CONTACT_NOT_FOUND');
    }

    response.status(200).json(contact);
  });

  findByPersonalData: RequestHandler = asyncHandler(async (request, response) => {
    const query = findContactsByPersonalDataSchema.parse(request.query);
    const contacts = await this.dependencies.findContactsByPersonalData.execute(query);

    response.status(200).json(contacts);
  });

  updatePersonalData: RequestHandler = asyncHandler(async (request, response) => {
    const params = contactParamsSchema.parse(request.params);
    const input = updateContactPersonalDataSchema.parse(request.body);

    try {
      const contact = await this.dependencies.updateContactPersonalData.execute(
        params.id,
        input,
      );

      if (!contact) {
        throw new HttpError('Contact not found', 404, 'CONTACT_NOT_FOUND');
      }

      response.status(200).json(contact);
    } catch (error) {
      throw mapContactError(error);
    }
  });

  delete: RequestHandler = asyncHandler(async (request, response) => {
    const params = contactParamsSchema.parse(request.params);
    const wasDeleted = await this.dependencies.deleteContact.execute(params.id);

    if (!wasDeleted) {
      throw new HttpError('Contact not found', 404, 'CONTACT_NOT_FOUND');
    }

    response.status(204).send();
  });
}

function mapContactError(error: unknown): unknown {
  if (error instanceof ContactEmailAlreadyExistsError) {
    return new HttpError(error.message, 409, 'CONTACT_EMAIL_ALREADY_EXISTS');
  }

  if (error instanceof PhoneTypeNotFoundError) {
    return new HttpError(error.message, 400, 'PHONE_TYPE_NOT_FOUND');
  }

  return error;
}
