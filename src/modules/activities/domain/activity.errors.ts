export class ActivityContactNotFoundError extends Error {
  constructor(personId: string) {
    super(`Contact ${personId} was not found`);
    this.name = 'ActivityContactNotFoundError';
  }
}
