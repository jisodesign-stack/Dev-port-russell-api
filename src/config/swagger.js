const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Port de Plaisance Russell - API',
            version: '1.0.0',
            description: 'API de gestion du Port de Plaisance Russell - Catways, Réservations, Utilisateurs',
            contact: { name: 'Capitainerie', email: 'contact@port-russell.fr' }
        },
        servers: [{ url: 'http://localhost:4000', description: 'Développement' }],
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
            },
            schemas: {
                Catway: {
                    type: 'object',
                    required: ['catwayNumber', 'catwayType', 'catwayState'],
                    properties: {
                        catwayNumber: { type: 'integer', example: 1 },
                        catwayType: { type: 'string', enum: ['long', 'short'], example: 'short' },
                        catwayState: { type: 'string', example: 'bon état' }
                    }
                },
                Reservation: {
                    type: 'object',
                    required: ['catwayNumber', 'clientName', 'boatName', 'startDate', 'endDate'],
                    properties: {
                        catwayNumber: { type: 'integer', example: 1 },
                        clientName: { type: 'string', example: 'Jean Dupont' },
                        boatName: { type: 'string', example: 'Le Magnifique' },
                        startDate: { type: 'string', format: 'date-time' },
                        endDate: { type: 'string', format: 'date-time' }
                    }
                },
                User: {
                    type: 'object',
                    required: ['username', 'email', 'password'],
                    properties: {
                        username: { type: 'string', example: 'jdupont' },
                        email: { type: 'string', format: 'email', example: 'jean@email.fr' },
                        password: { type: 'string', format: 'password' }
                    }
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ['./src/controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = { swaggerUi, swaggerSpec };
