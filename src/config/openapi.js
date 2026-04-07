const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "CodeMaya Smart Q&A API",
    version: "1.0.0",
    description:
      "Node.js/Express RAG API with JWT auth, per-user rate limiting, and Groq-backed LLM responses.",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local development server",
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
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Pratik Mande" },
          email: {
            type: "string",
            format: "email",
            example: "test@example.com",
          },
          password: { type: "string", example: "password123" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "test@example.com",
          },
          password: { type: "string", example: "password123" },
        },
      },
      AskRequest: {
        type: "object",
        required: ["question"],
        properties: {
          question: { type: "string", example: "What is the refund policy?" },
        },
      },
      AskResponse: {
        type: "object",
        properties: {
          answer: { type: "string" },
          sources: { type: "array", items: { type: "string" } },
          confidence: { type: "string", enum: ["high", "medium", "low"] },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          requestId: { type: "string" },
        },
      },
      PaginationMeta: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          total: { type: "integer", example: 25 },
          totalPages: { type: "integer", example: 3 },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        responses: {
          200: {
            description: "Server is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { status: { type: "string", example: "ok" } },
                },
              },
            },
          },
        },
      },
    },
    "/api/docs": {
      get: {
        tags: ["Documents"],
        summary: "List seeded knowledge documents",
        responses: {
          200: { description: "Documents listed successfully" },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          201: { description: "User registered successfully" },
          409: { description: "Email already registered" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and receive JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: { description: "Login successful" },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/api/ask": {
      post: {
        tags: ["Q&A"],
        summary: "Ask grounded question over seeded docs",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AskRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Structured grounded answer",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AskResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          429: {
            description: "Rate limited",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/ask/history": {
      get: {
        tags: ["Q&A"],
        summary: "Get recent ask history for authenticated user (paginated)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
          },
        ],
        responses: {
          200: {
            description: "History returned",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { type: "object" } },
                    pagination: { $ref: "#/components/schemas/PaginationMeta" },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = {
  openApiSpec,
};
