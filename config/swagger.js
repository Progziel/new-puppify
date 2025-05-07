const swaggerJsdoc = require("swagger-jsdoc");
require("dotenv").config();

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Classified App API for Testing",
      version: "1.0.0",
      description: "A simple dummy API with Swagger documentation for testing purposes",
    },
    servers: [
      {
        url: `http://${process.env.HOST || '0.0.0.0'}:${process.env.PORT || 3000}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js"], // Adjust path to point to index.js from config folder
};

module.exports = swaggerJsdoc(swaggerOptions);