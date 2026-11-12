import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: { title: 'Review Kantin API', version: '1.0.0' },
  host: 'localhost:3000',
  basePath: '/',
  schemes: ['http'],
  securityDefinitions: {
    BearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Kirim JWT melalui header Authorization dengan skema Bearer.',
    },
  },
  definitions: {
    StallInput: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', example: 'Warung Baru' },
        category: { type: 'string', example: 'Nasi' },
        location: { type: 'string', example: 'Kantin FK' },
        description: { type: 'string' },
      },
    },
    StallUpdateInput: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Warung Baru' },
        category: { type: 'string', example: 'Nasi' },
        location: { type: 'string', example: 'Kantin FK' },
        description: { type: 'string' },
      },
    },
    RegisterInput: {
      type: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: { type: 'string', example: 'Sinta Maharani' },
        email: { type: 'string', example: 'sinta@example.test' },
        password: { type: 'string', example: 'password-kuat-123' },
      },
    },
    LoginInput: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', example: 'sinta@example.test' },
        password: { type: 'string', example: 'password-kuat-123' },
      },
    },
    ReviewInput: {
      type: 'object',
      required: ['rating'],
      properties: {
        rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
        comment: { type: 'string', example: 'Enak!' },
      },
    },
    ErrorResponse: {
      type: 'object',
      required: ['message'],
      properties: {
        message: { type: 'string', example: 'Validasi input gagal' },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              field: { type: 'string', example: 'name' },
              message: { type: 'string', example: 'Minimal 3 karakter' },
            },
          },
        },
      },
    },
  },
};

const outputFile = './src/docs/swagger-output.json';
const endpointsFiles = ['./src/index.ts'];

swaggerAutogen()(outputFile, endpointsFiles, doc);
