# FlowForge

FlowForge is an AI-powered developer collaboration and project management platform designed to bring project tracking, GitHub integration, real-time collaboration, deployment visibility, and intelligent developer assistance into a single platform.

The platform provides teams with a centralized workspace to manage projects, issues, tasks, repositories, pull requests, deployments, notifications, and development activity. It also integrates an AI assistant that can understand project context, retrieve relevant information, and interact with the platform through controlled backend tools.

The application is built with a production-oriented backend architecture, with a focus on scalability, security, reliability, asynchronous processing, and clean separation of responsibilities.

## Features

### Project and Task Management

- Create and manage organizations and teams
- Create and manage projects
- Create, update, assign, and track issues and tasks
- Add comments, labels, priorities, and milestones
- Search, filter, sort, and paginate project data
- Track project and team activity
- Manage role-based permissions

### Authentication and Authorization

- User registration and login
- Secure password hashing with bcrypt
- JWT-based authentication
- Access and refresh token handling
- Secure cookie-based authentication
- Session management where required
- Role-based access control
- Resource-level authorization
- Password reset and email verification
- OAuth 2.0 authentication with GitHub

### GitHub Integration

FlowForge connects with GitHub to provide development activity directly inside the platform.

Users can connect their GitHub accounts and access information such as:

- Repositories
- Branches
- Commits
- Issues
- Pull requests
- Deployments
- Repository activity

GitHub webhooks are used to receive events and synchronize relevant development activity with FlowForge.

Webhook processing includes signature verification, event validation, asynchronous processing, duplicate-event handling, and failure recovery.

### Real-Time Collaboration

FlowForge provides real-time communication and updates using WebSockets.

Real-time functionality includes:

- Team communication
- Real-time notifications
- Issue and task updates
- Deployment status updates
- Online presence
- Live activity updates

### Notifications and Background Processing

The platform supports both in-app and email notifications.

Operations that do not need to block an HTTP request are processed asynchronously using background jobs.

Examples include:

- Email delivery
- GitHub synchronization
- Notifications
- Deployment processing
- AI-related processing
- Scheduled tasks

Redis and BullMQ are used to manage queues, workers, retries, and background jobs.

### Caching

Redis is used to improve application performance by caching frequently accessed data.

Caching is applied to appropriate resources such as:

- Project information
- Dashboard data
- GitHub API responses
- Frequently requested application data

The application also handles cache expiration and invalidation to maintain data consistency.

### AI Developer Assistant

FlowForge includes an AI-powered assistant designed to help developers understand and interact with their projects.

The assistant can answer questions about:

- Projects
- Issues
- Tasks
- Pull requests
- GitHub activity
- Deployments
- Logs
- Project documentation

For application-specific questions, the assistant retrieves relevant project data before generating a response.

For example:

> "Which project currently has the most critical unresolved issues?"

or

> "Why did the latest deployment fail?"

The AI assistant is designed to work with application data rather than functioning as a standalone general-purpose chatbot.

### Retrieval-Augmented Generation

FlowForge uses Retrieval-Augmented Generation to provide the AI assistant with relevant project context.

Potential sources include:

- Project documentation
- README files
- Issues
- Pull requests
- Architecture documentation
- Development activity
- Internal knowledge

The RAG pipeline consists of document processing, chunking, embeddings, vector storage, semantic retrieval, context construction, and LLM generation.

### AI Tool Calling

The AI assistant can interact with FlowForge through controlled backend tools.

Examples include:

```text
getProject()
getIssues()
getDeployment()
getLogs()
getPullRequests()
createIssue()
createTask()

Tool execution is handled by the backend and follows the same authentication and authorization rules as normal API requests.

The AI does not receive unrestricted access to the application. Each tool has a defined purpose, validated input, and appropriate permission checks.

AI Security

The AI subsystem considers common risks associated with integrating LLMs into backend applications, including:

Prompt injection
Unauthorized data access
Sensitive information leakage
Excessive tool permissions
Hallucinations
Unsafe tool execution
Cross-user data access

Destructive or sensitive operations can require explicit user confirmation before execution.

Backend Architecture

FlowForge follows a modular monolithic architecture with clear separation between HTTP handling, business logic, data access, integrations, background processing, and AI functionality.

Client
   |
   v
Nginx / Reverse Proxy
   |
   v
Express API
   |
   +-------------------+
   |                   |
Middleware          WebSocket
   |                   |
   v                   v
Controllers       Real-Time Events
   |
   v
Services
   |
   v
Repositories
   |
   +-------------+-------------+
   |             |             |
   v             v             v
PostgreSQL     Redis        MongoDB
   |
   v
Application Data

Asynchronous operations are handled separately from the request-response lifecycle.

API Request
    |
    v
Service
    |
    v
Queue
    |
    v
Redis / BullMQ
    |
    v
Worker
    |
    +---------> Email
    |
    +---------> GitHub
    |
    +---------> Notifications
    |
    +---------> AI Processing
Database Architecture
PostgreSQL

PostgreSQL is used for structured and relational application data.

Primary entities include:

Users
Organizations
Teams
Projects
Issues
Tasks
Comments
Roles
Permissions
Notifications
Pull requests
Deployments
Audit records

Prisma is used as the ORM for database access, migrations, schema management, and type-safe queries.

The database design incorporates relationships, constraints, indexes, transactions, and query optimization.

MongoDB

MongoDB is used where a flexible document-oriented data model is beneficial, particularly for data such as AI conversations, flexible metadata, and other less-structured information.

Mongoose is used for schema definition and database interaction.

The use of PostgreSQL and MongoDB is based on the characteristics of the data rather than simply duplicating the same data across both databases.

API

FlowForge exposes versioned REST APIs following standard HTTP semantics.

/api/v1/

The API supports:

GET
POST
PUT
PATCH
DELETE

It also provides:

Route parameters
Query parameters
Filtering
Searching
Sorting
Pagination
Request validation
Consistent error responses
Authentication
Authorization
Rate limiting
API versioning
API documentation

Example endpoints:

POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout


GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/:id
PATCH  /api/v1/projects/:id
DELETE /api/v1/projects/:id


GET    /api/v1/issues
POST   /api/v1/issues
GET    /api/v1/issues/:id
PATCH  /api/v1/issues/:id
DELETE /api/v1/issues/:id


POST   /api/v1/github/webhook
POST   /api/v1/ai/chat

The exact API surface will evolve as the platform grows.

Security

Security is considered throughout the application rather than being limited to authentication.

The backend includes mechanisms such as:

Password hashing
JWT authentication
Secure cookies
OAuth 2.0
Role-based authorization
Resource-level authorization
Input validation
Rate limiting
CORS configuration
Security headers
Environment-based secrets
Webhook signature verification
Protection against common injection attacks
AI tool authorization

Sensitive credentials and configuration values are stored through environment variables and are never hardcoded into the application.

Background Processing

FlowForge uses Redis and BullMQ for asynchronous job processing.

The worker architecture supports:

Job queues
Retries
Exponential backoff
Failed jobs
Job prioritization
Idempotent processing
Worker failure handling

This allows resource-intensive operations to run independently from the API request lifecycle.

Real-Time Architecture

WebSockets are used for real-time communication between FlowForge and connected clients.

Events can originate from:

User actions
GitHub webhooks
Background workers
Deployment events
Notification services

The backend can publish relevant events to connected users or project-specific rooms.

Observability

FlowForge includes backend observability features to make production issues easier to identify and diagnose.

The application supports:

Structured logging
Log levels
Request identifiers
Error logging
Health checks
Database health checks
Redis health checks
Worker health monitoring
API performance monitoring

A health endpoint provides a high-level view of the application's dependencies.

GET /health
Testing

The project includes automated testing at multiple levels.

Unit Tests

Business logic, services, validators, and utilities are tested independently.

Integration Tests

Database operations, authentication flows, repositories, and service interactions are tested together.

API Tests

REST endpoints are tested for:

Successful requests
Validation failures
Authentication failures
Authorization failures
Resource-not-found cases
Server errors

Additional tests cover webhook processing, background jobs, and AI-related functionality.

Docker

FlowForge is containerized using Docker.

The development environment can include separate containers for:

Backend
PostgreSQL
Redis
Worker
Nginx

Docker Compose is used to manage the local multi-service environment.

The containerized architecture provides consistent development and deployment environments and simplifies service-to-service communication.

Deployment

The application is designed to run in a production cloud environment.

The deployment architecture follows:

GitHub
   |
   v
CI/CD Pipeline
   |
   v
Docker Build
   |
   v
Cloud Infrastructure
   |
   v
Nginx
   |
   v
FlowForge API

The deployment setup includes environment configuration, secure networking, container management, reverse proxy configuration, and HTTPS.

CI/CD

GitHub Actions is used to automate the development and deployment workflow.

The pipeline can perform:

Code checkout
Dependency installation
Linting
Automated tests
Application build
Docker image build
Deployment

This ensures that changes can be validated before reaching production.

Project Structure
flowforge/
│
├── src/
│   ├── config/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── middleware/
│   ├── validators/
│   ├── errors/
│   ├── utils/
│   ├── integrations/
│   │   ├── github/
│   │   └── email/
│   ├── queues/
│   ├── workers/
│   ├── events/
│   └── ai/
│       ├── prompts/
│       ├── retrieval/
│       ├── embeddings/
│       └── tools/
│
├── prisma/
│   └── schema.prisma
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── api/
│
├── docker/
│
├── Dockerfile
├── docker-compose.yml
├── package.json
├── .env.example
└── README.md
Technology Stack
Backend
Node.js
Express.js
Databases
PostgreSQL
Prisma
MongoDB
Mongoose
Authentication
JWT
Passport.js
OAuth 2.0
bcrypt
Caching and Queues
Redis
BullMQ
Real-Time Communication
WebSockets
Socket.IO
External Integrations
GitHub API
GitHub Webhooks
Nodemailer
AI
Large Language Models
Embeddings
Retrieval-Augmented Generation
Vector Database
AI Tool Calling
Optional local LLM integration through Ollama
DevOps
Docker
Docker Compose
Linux
Nginx
AWS
GitHub Actions
Testing
Jest or Vitest
Supertest
API Documentation
OpenAPI
Swagger
Engineering Principles

FlowForge follows several backend engineering principles:

Separation of concerns
Modular architecture
Secure-by-default design
Input validation
Explicit authorization
Centralized error handling
Asynchronous processing for long-running operations
Database query optimization
Appropriate caching
Idempotent event processing
Observability
Automated testing
Environment-based configuration
Infrastructure reproducibility
Least-privilege access

The project favors simple and maintainable solutions over unnecessary complexity. Technologies are introduced where they solve a genuine architectural or operational problem.

Future Scalability

The initial implementation follows a modular monolithic architecture. The system is designed so that individual components can be scaled independently as traffic and operational requirements increase.

Potential future architecture:

                    Load Balancer
                         |
            +------------+------------+
            |            |            |
            v            v            v
         API 1        API 2        API 3
            |            |            |
            +------------+------------+
                         |
                       Redis
                         |
              +----------+----------+
              |          |          |
              v          v          v
           Worker 1   Worker 2   Worker 3
                         |
                         v
                     Database

Potential scaling strategies include:

Horizontal API scaling
Load balancing
Redis-based distributed caching
Database indexing and optimization
Read replicas
Asynchronous processing
Queue-based workload distribution
Independent worker scaling
WebSocket scaling
Service decomposition when justified
Project Status

FlowForge is currently under active development.

The architecture and feature set may evolve as the platform grows, with emphasis on maintaining clean boundaries between application modules and keeping infrastructure decisions aligned with actual requirements.

License

This project is intended for educational and portfolio purposes.