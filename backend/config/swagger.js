import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Prescripto Doctor Appointment API",
      version: "1.0.0",
      description:
        "Doctor Appointment Booking System – Monolithic Backend API with Event-Driven Microservices",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Local server",
      },
    ],
    components: {
      securitySchemes: {
        UserAuth: {
          type: "apiKey",
          in: "header",
          name: "token",
        },
        DoctorAuth: {
          type: "apiKey",
          in: "header",
          name: "dtoken",
        },
        AdminAuth: {
          type: "apiKey",
          in: "header",
          name: "atoken",
        },
      },
    },
    security: [],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
