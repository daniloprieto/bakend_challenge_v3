export type ContactId = string;

export type PhoneType = {
  id: string;
  typeName: string;
};

export type Phone = {
  id: string;
  number: string;
  type: PhoneType;
};

export type Address = {
  id: string;
  locality: string;
  notes: string | null;
  number: number;
  street: string;
};

export type Contact = {
  addresses: Address[];
  createdAt: string;
  dateOfBirth: string;
  email: string;
  firstName: string;
  id: ContactId;
  lastName: string;
  phones: Phone[];
  updatedAt: string;
};

export type CreateContactPhone = {
  number: string;
  typeName: string;
};

export type CreateContactAddress = {
  locality: string;
  notes?: string | null;
  number: number;
  street: string;
};

export type CreateContactData = {
  addresses: CreateContactAddress[];
  dateOfBirth: string;
  email: string;
  firstName: string;
  lastName: string;
  phones: CreateContactPhone[];
};

export type ContactPersonalDataCriteria = {
  dateOfBirth?: string;
  firstName?: string;
  lastName?: string;
};

export type ContactPhoneCriteria = {
  number: string;
  typeName: string;
};

export type UpdateContactPersonalData = {
  dateOfBirth?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
};
