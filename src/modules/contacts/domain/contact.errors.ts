export class ContactEmailAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`Contact with email ${email} already exists`);
    this.name = 'ContactEmailAlreadyExistsError';
  }
}

export class ContactNotFoundError extends Error {
  constructor(contactId: string) {
    super(`Contact ${contactId} was not found`);
    this.name = 'ContactNotFoundError';
  }
}

export class PhoneTypeNotFoundError extends Error {
  constructor(typeName: string) {
    super(`Phone type ${typeName} was not found`);
    this.name = 'PhoneTypeNotFoundError';
  }
}
