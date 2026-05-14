export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Backend Challenge V3 API',
    version: '1.0.0',
    description: 'REST API for contacts and contact activities.',
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Local development server',
    },
  ],
  tags: [{ name: 'Health' }, { name: 'Contacts' }, { name: 'Activities' }],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Get API health status',
        responses: {
          '200': {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthStatus' },
              },
            },
          },
        },
      },
    },
    '/contacts': {
      post: {
        tags: ['Contacts'],
        summary: 'Create a contact',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateContactRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Contact created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Contact' },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '409': { $ref: '#/components/responses/ConflictError' },
        },
      },
      get: {
        tags: ['Contacts'],
        summary: 'Find contacts by personal data',
        parameters: [
          { $ref: '#/components/parameters/FirstName' },
          { $ref: '#/components/parameters/LastName' },
          { $ref: '#/components/parameters/DateOfBirth' },
        ],
        responses: {
          '200': {
            description: 'Matching contacts',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Contact' },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
    '/contacts/by-email': {
      get: {
        tags: ['Contacts'],
        summary: 'Find a contact by email',
        parameters: [{ $ref: '#/components/parameters/Email' }],
        responses: {
          '200': {
            description: 'Contact found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Contact' },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/contacts/by-phone': {
      get: {
        tags: ['Contacts'],
        summary: 'Find a contact by phone number and type',
        parameters: [
          { $ref: '#/components/parameters/PhoneNumber' },
          { $ref: '#/components/parameters/PhoneTypeName' },
        ],
        responses: {
          '200': {
            description: 'Contact found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Contact' },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/contacts/{id}': {
      patch: {
        tags: ['Contacts'],
        summary: 'Update contact personal data',
        parameters: [{ $ref: '#/components/parameters/Id' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateContactRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Contact updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Contact' },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '404': { $ref: '#/components/responses/NotFoundError' },
          '409': { $ref: '#/components/responses/ConflictError' },
        },
      },
      delete: {
        tags: ['Contacts'],
        summary: 'Delete a contact',
        parameters: [{ $ref: '#/components/parameters/Id' }],
        responses: {
          '204': { description: 'Contact deleted' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/activities': {
      post: {
        tags: ['Activities'],
        summary: 'Create a contact activity',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateActivityRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Activity created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Activity' },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
      get: {
        tags: ['Activities'],
        summary: 'Find activities by contact and activity type',
        parameters: [
          { $ref: '#/components/parameters/PersonId' },
          { $ref: '#/components/parameters/ActivityType' },
        ],
        responses: {
          '200': {
            description: 'Matching activities',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Activity' },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
  },
  components: {
    parameters: {
      Id: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', pattern: '^\\d+$' },
      },
      PersonId: {
        name: 'personId',
        in: 'query',
        required: true,
        schema: { type: 'string', pattern: '^\\d+$' },
      },
      Email: {
        name: 'email',
        in: 'query',
        required: true,
        schema: { type: 'string', format: 'email' },
      },
      FirstName: {
        name: 'firstName',
        in: 'query',
        required: false,
        schema: { type: 'string', minLength: 1 },
      },
      LastName: {
        name: 'lastName',
        in: 'query',
        required: false,
        schema: { type: 'string', minLength: 1 },
      },
      DateOfBirth: {
        name: 'dateOfBirth',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'date' },
      },
      PhoneNumber: {
        name: 'number',
        in: 'query',
        required: true,
        schema: { type: 'string', minLength: 1 },
      },
      PhoneTypeName: {
        name: 'typeName',
        in: 'query',
        required: true,
        schema: { type: 'string', example: 'mobile' },
      },
      ActivityType: {
        name: 'activityType',
        in: 'query',
        required: true,
        schema: { $ref: '#/components/schemas/ActivityType' },
      },
    },
    responses: {
      ValidationError: {
        description: 'Invalid request data',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      ConflictError: {
        description: 'Resource conflict',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
    },
    schemas: {
      ActivityType: {
        type: 'string',
        enum: ['call', 'meeting', 'email'],
      },
      HealthStatus: {
        type: 'object',
        required: ['environment', 'service', 'status', 'timestamp', 'uptime'],
        properties: {
          environment: { type: 'string', example: 'development' },
          service: { type: 'string', example: 'backend-challenge-v3' },
          status: { type: 'string', example: 'ok' },
          timestamp: { type: 'string', format: 'date-time' },
          uptime: { type: 'number', example: 12.34 },
        },
      },
      CreateContactRequest: {
        type: 'object',
        required: ['firstName', 'lastName', 'dateOfBirth', 'email'],
        properties: {
          firstName: { type: 'string', example: 'Ada' },
          lastName: { type: 'string', example: 'Lovelace' },
          dateOfBirth: { type: 'string', format: 'date', example: '1815-12-10' },
          email: { type: 'string', format: 'email', example: 'ada@example.com' },
          phones: {
            type: 'array',
            items: { $ref: '#/components/schemas/CreatePhone' },
          },
          addresses: {
            type: 'array',
            items: { $ref: '#/components/schemas/CreateAddress' },
          },
        },
      },
      UpdateContactRequest: {
        type: 'object',
        minProperties: 1,
        properties: {
          firstName: { type: 'string', example: 'Ada Augusta' },
          lastName: { type: 'string', example: 'Lovelace' },
          dateOfBirth: { type: 'string', format: 'date', example: '1815-12-10' },
          email: {
            type: 'string',
            format: 'email',
            example: 'ada.augusta@example.com',
          },
        },
      },
      CreatePhone: {
        type: 'object',
        required: ['number', 'typeName'],
        properties: {
          number: { type: 'string', example: '555-1000' },
          typeName: { type: 'string', example: 'mobile' },
        },
      },
      CreateAddress: {
        type: 'object',
        required: ['locality', 'street', 'number'],
        properties: {
          locality: { type: 'string', example: 'Cordoba' },
          street: { type: 'string', example: 'San Martin' },
          number: { type: 'integer', example: 100 },
          notes: { type: 'string', nullable: true, example: 'Main address' },
        },
      },
      Contact: {
        type: 'object',
        required: [
          'id',
          'firstName',
          'lastName',
          'dateOfBirth',
          'email',
          'phones',
          'addresses',
          'createdAt',
          'updatedAt',
        ],
        properties: {
          id: { type: 'string', example: '1' },
          firstName: { type: 'string', example: 'Ada' },
          lastName: { type: 'string', example: 'Lovelace' },
          dateOfBirth: { type: 'string', format: 'date', example: '1815-12-10' },
          email: { type: 'string', format: 'email', example: 'ada@example.com' },
          phones: {
            type: 'array',
            items: { $ref: '#/components/schemas/Phone' },
          },
          addresses: {
            type: 'array',
            items: { $ref: '#/components/schemas/Address' },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Phone: {
        type: 'object',
        required: ['id', 'number', 'type'],
        properties: {
          id: { type: 'string', example: '1' },
          number: { type: 'string', example: '555-1000' },
          type: { $ref: '#/components/schemas/PhoneType' },
        },
      },
      PhoneType: {
        type: 'object',
        required: ['id', 'typeName'],
        properties: {
          id: { type: 'string', example: '1' },
          typeName: { type: 'string', example: 'mobile' },
        },
      },
      Address: {
        type: 'object',
        required: ['id', 'locality', 'street', 'number', 'notes'],
        properties: {
          id: { type: 'string', example: '1' },
          locality: { type: 'string', example: 'Cordoba' },
          street: { type: 'string', example: 'San Martin' },
          number: { type: 'integer', example: 100 },
          notes: { type: 'string', nullable: true, example: 'Main address' },
        },
      },
      CreateActivityRequest: {
        type: 'object',
        required: ['personId', 'activityType', 'activityDate'],
        properties: {
          personId: { type: 'string', example: '1' },
          activityType: { $ref: '#/components/schemas/ActivityType' },
          activityDate: {
            type: 'string',
            format: 'date-time',
            example: '2026-05-11T12:00:00.000Z',
          },
          description: {
            type: 'string',
            nullable: true,
            example: 'Follow-up call',
          },
        },
      },
      Activity: {
        type: 'object',
        required: [
          'id',
          'activityType',
          'activityDate',
          'description',
          'contact',
          'createdAt',
        ],
        properties: {
          id: { type: 'string', example: '1' },
          activityType: { $ref: '#/components/schemas/ActivityType' },
          activityDate: { type: 'string', format: 'date-time' },
          description: { type: 'string', nullable: true },
          contact: { $ref: '#/components/schemas/ActivityContact' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      ActivityContact: {
        type: 'object',
        required: ['id', 'firstName', 'lastName', 'email', 'dateOfBirth'],
        properties: {
          id: { type: 'string', example: '1' },
          firstName: { type: 'string', example: 'Ada' },
          lastName: { type: 'string', example: 'Lovelace' },
          email: { type: 'string', format: 'email', example: 'ada@example.com' },
          dateOfBirth: { type: 'string', format: 'date', example: '1815-12-10' },
        },
      },
      ErrorResponse: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'object',
            required: ['code', 'message'],
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Invalid request data' },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['path', 'message'],
                  properties: {
                    path: { type: 'string', example: 'email' },
                    message: { type: 'string', example: 'Invalid email address' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;
