# System Architecture
## Abang Colek Mobile - Technical Design Document

**Document Version:** 1.0  
**Last Updated:** January 16, 2026  
**Author:** Abang Colek Team  
**Status:** Active Development

---

## Architecture Overview

The Abang Colek Mobile system architecture implements a modern, mobile-first design optimized for offline-first operation, real-time synchronization, and scalable growth. The architecture follows established patterns from distributed systems engineering, including event sourcing for audit trails, eventual consistency for data synchronization, and command-query responsibility segregation (CQRS) for separating read and write operations. The system is designed to operate reliably under adverse network conditions common at event locations while providing seamless user experiences through optimistic UI updates and background synchronization.

The architectural philosophy prioritizes mobile user experience above all other concerns, recognizing that the primary users are entrepreneurs operating in dynamic, high-pressure environments where every second counts. This philosophy manifests in several key design decisions including storing all user data locally for instant access without network latency, implementing optimistic updates that apply changes immediately in the UI before server confirmation, designing for graceful degradation where features remain functional even when backend services are unavailable, and minimizing battery consumption through efficient background sync strategies and judicious use of location services.

The system architecture is organized into six major subsystems working in concert. The **Mobile Client** runs on user devices as a React Native application managing UI rendering, local state, and data persistence. The **API Gateway** provides a unified entry point for all backend services exposing tRPC procedures with type-safe contracts. The **Application Services** implement business logic for events, hooks, campaigns, and WOCS commands. The **Data Layer** persists information across MySQL database, AsyncStorage, and S3 object storage. The **Integration Layer** connects to external services including WhatsApp Cloud API, OAuth providers, and payment gateways. The **Infrastructure Layer** provides cross-cutting concerns including monitoring, logging, and deployment automation.

---

## System Context Diagram

The system context diagram illustrates how Abang Colek Mobile interacts with external actors and systems. **Primary Actors** include founders who use the app to manage all business operations, booth operators who execute event setups and sales, content creators who produce TikTok videos and social media posts, and customers who participate in lucky draws and receive WhatsApp messages. **External Systems** include WhatsApp Cloud API for sending and receiving messages, Meta OAuth for user authentication, S3-compatible storage for file uploads, MySQL database for structured data persistence, and payment gateways for processing transactions.

Data flows between actors and systems follow well-defined patterns. Founders interact with the mobile app to create events, manage campaigns, and review analytics. The app stores data locally in AsyncStorage and syncs to MySQL when connectivity permits. Booth operators use the app to check off tasks and upload photos, which are compressed and uploaded to S3 storage. Content creators browse the hook library stored in MySQL and copy hooks to their clipboard for use in TikTok. The app tracks usage and syncs metrics back to the database. Customers receive WhatsApp messages sent through the Cloud API based on templates defined in the app. WOCS commands arrive via WhatsApp webhook, are parsed by the backend, and execute operations that update database records and trigger notifications back to users.

---

## Container Diagram

The container diagram decomposes the system into deployable units showing their responsibilities and interactions. **Mobile Application Container** is a React Native app built with Expo SDK 54 running on iOS, Android, and web platforms. The app contains UI components rendered with NativeWind styling, business logic implemented in TypeScript hooks and services, local data storage using AsyncStorage, and offline sync manager coordinating with backend. The app communicates with the API Gateway via HTTPS using tRPC client libraries.

**API Gateway Container** is a Node.js application built with Express and Fastify running on cloud hosting platforms. The gateway exposes tRPC routers for authentication, events, hooks, campaigns, WhatsApp, and WOCS. The gateway validates requests using Zod schemas, enforces authentication and authorization, and routes requests to appropriate application services. The gateway communicates with the database via Drizzle ORM and with external services via HTTP clients.

**Database Container** is a MySQL 8.0 instance running on managed database services like AWS RDS or Google Cloud SQL. The database stores structured data including users, events, hooks, campaigns, WOCS tasks, and audit logs. The database is accessed exclusively through Drizzle ORM ensuring type-safe queries and preventing SQL injection. The database is backed up automatically every 6 hours with 30-day retention.

**Object Storage Container** is an S3-compatible storage service like AWS S3 or DigitalOcean Spaces storing user-uploaded files including event photos, QR codes, and audio assets. Files are uploaded directly from the mobile app using pre-signed URLs generated by the API Gateway. Files are served via CDN for fast global access. Storage is configured with lifecycle policies automatically deleting files older than 1 year.

**Background Worker Container** is a Node.js application running scheduled jobs and processing async tasks. Workers execute cron jobs for daily reports, process queued WOCS commands, send scheduled WhatsApp messages, and perform database maintenance. Workers communicate with the database and external services using the same libraries as the API Gateway. Workers are deployed as separate containers for isolation and scalability.

---

## Component Diagram

The component diagram details the internal structure of major containers showing modules and their dependencies. **Mobile Application Components** are organized into layers following clean architecture principles. The **Presentation Layer** contains React components in the `app/` and `components/` directories, screens for each tab including dashboard, events, TikTok, lucky draw, WhatsApp bot, and more, and UI primitives like buttons, inputs, and cards styled with NativeWind. The **Application Layer** contains business logic in the `lib/` directory, TypeScript services for data transformation and validation, React hooks for state management and side effects, and utility functions for common operations like date formatting and string manipulation. The **Data Layer** contains persistence logic in `lib/storage.ts`, AsyncStorage wrappers for CRUD operations, sync manager coordinating with backend, and offline queue for pending operations.

**API Gateway Components** are organized by feature following domain-driven design. The **Router Layer** contains tRPC routers in `server/routers.ts`, procedures for each feature area, Zod schemas for input and output validation, and middleware for authentication and logging. The **Service Layer** contains business logic in `server/services/`, domain models representing business entities, use cases implementing business workflows, and integration adapters for external services. The **Data Layer** contains database access in `server/db.ts`, Drizzle ORM schema definitions, query builders for complex operations, and migration scripts for schema changes.

**Background Worker Components** are organized by job type. The **Scheduler** manages cron jobs using node-cron, registering job definitions with schedules, executing jobs on schedule, and logging job results. The **Task Processor** handles async tasks using BullMQ, consuming tasks from Redis queues, executing task logic, and updating task status. The **WOCS Executor** processes WhatsApp commands, parsing command syntax, validating permissions, executing operations, and sending responses.

---

## Data Architecture

### Data Models

The data architecture implements a normalized relational schema optimized for transactional consistency and query performance. **Core Domain Models** include User representing authenticated users with fields for id, email, name, phone, role, and timestamps; Event representing booth operations with fields for id, userId, name, date, location, fee, eoContact, status, checklist, photos, and notes; Hook representing TikTok content with fields for id, userId, text, tags, views, likes, shares, engagementRate, usedCount, and lastUsed; Campaign representing lucky draws with fields for id, userId, prize, requirements, startDate, endDate, googleFormUrl, and qrCode; and Entry representing campaign participants with fields for id, campaignId, name, phone, verified, and submittedAt.

**WOCS Domain Models** include WocsUser representing authorized admins and agents with fields for id, phone, role, and active; WocsTask representing command executions with fields for id, userId, command, params, status, priority, result, and timestamps; WocsTaskLog representing audit trail with fields for id, taskId, message, level, and timestamp; WocsAttachment representing file uploads with fields for id, taskId, filename, url, and size; WocsLandingVersion representing page versions with fields for id, slug, content, published, and version; and WocsAppConfig representing feature flags with fields for id, key, value, and description.

### Data Relationships

Relationships between models follow standard relational patterns. Users have one-to-many relationships with Events, Hooks, and Campaigns where each user owns multiple records. Campaigns have one-to-many relationships with Entries where each campaign has multiple participants. WocsUsers have one-to-many relationships with WocsTasks where each admin creates multiple commands. WocsTasks have one-to-many relationships with WocsTaskLogs and WocsAttachments where each task generates multiple log entries and attachments. Foreign keys enforce referential integrity with cascade delete for dependent records.

### Data Synchronization

Data synchronization implements eventual consistency between local AsyncStorage and remote MySQL database. The sync strategy follows a three-phase approach. **Phase 1: Local-First Writes** occur when users modify data. Changes are immediately written to AsyncStorage updating the local cache. A sync operation is queued in the offline manager with the operation type (create, update, delete), entity type, entity ID, and payload data. The UI updates optimistically showing the change instantly without waiting for server confirmation.

**Phase 2: Background Sync** occurs when connectivity is available. The sync manager dequeues pending operations in chronological order. For each operation, the manager calls the appropriate tRPC procedure sending the payload. If the server returns success, the manager updates the local record with server-generated fields like ID and timestamps and removes the operation from the queue. If the server returns an error, the manager increments the retry count and re-queues the operation with exponential backoff. After 5 failed attempts, the operation is marked as failed and requires manual intervention.

**Phase 3: Conflict Resolution** occurs when local and remote state diverge. The sync manager fetches the latest server state for the entity. If the server timestamp is newer than the local timestamp, the server state wins and overwrites local changes. If the local timestamp is newer, the local state wins and is pushed to the server. For complex entities like checklists with multiple fields, custom merge logic combines local and remote changes. Conflicts that cannot be automatically resolved are logged and presented to users for manual resolution.

### Data Migration

Database migrations manage schema evolution over time. Migrations are written using Drizzle Kit generating SQL scripts from TypeScript schema definitions. Each migration has an up script applying changes and a down script reverting changes. Migrations are versioned with timestamps ensuring consistent ordering. Before deployment, migrations are tested in staging environment verifying they apply cleanly and do not cause data loss. In production, migrations are applied automatically during deployment with rollback procedures available if issues arise.

---

## API Architecture

### tRPC Procedures

The API layer exposes functionality through tRPC procedures providing end-to-end type safety from server to client. Procedures are organized into routers by feature area. **Auth Router** includes login procedure accepting email and password, returning access and refresh tokens; logout procedure invalidating tokens; refresh procedure exchanging refresh token for new access token; and me procedure returning current user profile. **Events Router** includes list procedure returning paginated events with filtering and sorting; get procedure returning single event by ID; create procedure accepting event data and returning created event with generated ID; update procedure accepting event ID and partial data; and delete procedure accepting event ID and returning success confirmation.

**Hooks Router** includes list procedure returning paginated hooks with search and tag filtering; get procedure returning single hook by ID; create procedure accepting hook data; update procedure accepting hook ID and partial data including incrementing usage count; and delete procedure accepting hook ID. **Campaigns Router** includes list procedure returning paginated campaigns; get procedure returning single campaign with entry statistics; create procedure accepting campaign data and generating QR code; update procedure accepting campaign ID and partial data; and selectWinner procedure accepting campaign ID and returning randomly selected entry.

**WhatsApp Router** includes listTemplates procedure returning all message templates; sendMessage procedure accepting template ID, recipient phone, and variables, returning message ID; and getStats procedure returning delivery and response metrics. **WOCS Router** includes parseCommand procedure accepting message text and returning parsed command object; createTask procedure accepting command and params, returning task ID; getTask procedure returning task status and result; and listTasks procedure returning paginated tasks with filtering by status and priority.

### API Security

API security implements multiple layers of protection. **Authentication** requires valid access tokens for all protected procedures. Tokens are passed in the Authorization header using Bearer scheme. The API Gateway validates tokens by verifying JWT signatures, checking expiration timestamps, and confirming token has not been revoked. Invalid tokens return 401 Unauthorized responses. **Authorization** enforces role-based access control checking user roles against procedure requirements. Users can only access their own data. Agents can access data for assigned brands. Admins have full access. Unauthorized requests return 403 Forbidden responses.

**Input Validation** uses Zod schemas defining expected types, required fields, string lengths, numeric ranges, and custom business rules. Invalid inputs return 400 Bad Request responses with detailed error messages. **Rate Limiting** restricts API calls to 100 requests per minute per user preventing abuse. Exceeded limits return 429 Too Many Requests responses with Retry-After headers. **CORS** policies restrict API access to authorized origins including the mobile app and admin panel. Unauthorized origins return 403 Forbidden responses.

### API Versioning

API versioning enables backward-compatible evolution. The current API is version 1 with procedures prefixed by v1. Future versions will be added as v2, v3, etc. Multiple versions can coexist allowing gradual migration. Deprecated versions are supported for 6 months after replacement version is released. Deprecation warnings are returned in response headers. After the support period, deprecated versions return 410 Gone responses directing clients to upgrade.

---

## Integration Architecture

### WhatsApp Cloud API Integration

WhatsApp integration enables automated messaging and command-center functionality. **Webhook Configuration** registers the API Gateway URL with Meta receiving POST requests for incoming messages. Webhook verification uses a verify token matching the configured value. Webhook payloads contain message text, sender phone number, and timestamp. **Message Sending** uses the WhatsApp Cloud API sending text messages with templates. Templates are pre-approved by Meta defining message structure with variable placeholders. The API Gateway calls the send message endpoint with template ID, recipient phone, and variable values. Responses include message ID for tracking delivery status.

**WOCS Command Processing** parses incoming messages for command syntax. Commands start with a forward slash followed by command name and key-value pairs. Example: `/agent task: Setup booth\nfor: Siti\ndue: 2026-01-20`. The parser extracts command name and parameters using regex patterns. Parsed commands are validated against admin whitelist ensuring only authorized users can execute commands. Valid commands create tasks in the database and return confirmation messages. Invalid commands return error messages explaining syntax requirements.

### OAuth Integration

OAuth integration provides secure authentication without storing passwords. **Authorization Flow** implements OAuth 2.0 with PKCE. The mobile app generates a code verifier and code challenge. The app redirects users to the OAuth provider with client ID, redirect URI, and code challenge. Users authenticate with the provider entering credentials. The provider redirects back to the app with an authorization code. The app exchanges the code for tokens by calling the token endpoint with client ID, code, code verifier, and redirect URI. The provider returns access token, refresh token, and expiration time.

**Token Management** stores tokens securely in hardware-backed keystores. Access tokens are short-lived (1 hour) minimizing exposure if compromised. Refresh tokens are long-lived (30 days) enabling seamless re-authentication. The app automatically refreshes access tokens before expiration by calling the token endpoint with refresh token. If refresh fails, the app prompts users to re-authenticate. **Logout** revokes tokens by calling the revoke endpoint invalidating both access and refresh tokens.

### S3 Storage Integration

S3 integration provides scalable file storage. **Upload Flow** begins when users select photos in the app. The app requests a pre-signed URL from the API Gateway specifying filename and content type. The gateway generates a pre-signed URL with PUT permissions valid for 15 minutes. The app uploads the file directly to S3 using the pre-signed URL. After upload completes, the app calls the API Gateway to save the file URL in the database. **Download Flow** retrieves file URLs from the database and loads images using the expo-image library with caching enabled. Files are served via CDN for fast global access.

---

## Deployment Architecture

### Infrastructure Topology

The deployment architecture uses cloud-native services for scalability and reliability. **Compute Layer** runs containerized applications on managed services like AWS ECS or Google Cloud Run. The API Gateway and Background Workers are deployed as separate containers with independent scaling policies. Containers are configured with health checks, automatic restarts, and rolling updates for zero-downtime deployments. **Database Layer** uses managed MySQL services like AWS RDS or Google Cloud SQL with multi-AZ deployment for high availability. Database instances are configured with automatic backups, point-in-time recovery, and read replicas for scaling read-heavy workloads.

**Storage Layer** uses S3-compatible object storage with lifecycle policies and CDN integration. Files are stored in a single bucket with prefixes for organization. Lifecycle policies automatically delete files older than 1 year reducing storage costs. CloudFront or similar CDN caches files at edge locations for fast global access. **Networking Layer** uses load balancers distributing traffic across multiple API Gateway instances. Load balancers perform health checks removing unhealthy instances from rotation. SSL/TLS termination occurs at the load balancer with certificates managed by AWS Certificate Manager or Let's Encrypt.

### Scaling Strategy

The system scales horizontally adding capacity by deploying additional instances rather than vertically increasing instance size. **API Gateway Scaling** uses auto-scaling policies monitoring CPU utilization and request count. When CPU exceeds 70% for 5 minutes, new instances are added. When CPU drops below 30% for 15 minutes, instances are removed. Minimum instance count is 2 for high availability. Maximum instance count is 10 for cost control. **Database Scaling** uses read replicas for scaling read operations. Write operations go to the primary instance. Read operations are distributed across replicas using connection pooling. If the primary instance becomes a bottleneck, vertical scaling increases instance size.

**Storage Scaling** is automatic with S3 providing unlimited capacity. Costs scale linearly with storage usage and bandwidth. CDN caching reduces origin requests by 90% minimizing bandwidth costs. **Background Worker Scaling** uses queue depth as the scaling metric. When the task queue exceeds 100 items, new worker instances are added. When the queue is empty for 15 minutes, instances are removed.

### Disaster Recovery

Disaster recovery procedures ensure business continuity. **Backup Strategy** includes automated database backups every 6 hours with 30-day retention, S3 object versioning with 90-day retention, and application configuration backups in version control. **Recovery Objectives** target Recovery Time Objective (RTO) of 4 hours and Recovery Point Objective (RPO) of 6 hours. RTO measures time to restore service after failure. RPO measures maximum acceptable data loss.

**Recovery Procedures** vary by failure type. For database corruption, restore from the most recent backup and replay transaction logs to minimize data loss. For region outage, failover to a secondary region with replicated database and storage. For application bugs, rollback to the previous deployment using blue-green deployment strategy. **Disaster Recovery Testing** is conducted quarterly simulating various failure scenarios and validating recovery procedures.

---

## Security Architecture

### Threat Model

The threat model identifies potential security risks and mitigation strategies. **Threat 1: Unauthorized Access** occurs when attackers gain access to user accounts through stolen credentials or session hijacking. Mitigation includes strong password requirements, multi-factor authentication, secure token storage, and automatic session expiration. **Threat 2: Data Breach** occurs when attackers access sensitive data through SQL injection, API vulnerabilities, or database compromise. Mitigation includes parameterized queries, input validation, encryption at rest and in transit, and regular security audits.

**Threat 3: Denial of Service** occurs when attackers overwhelm the system with requests causing service disruption. Mitigation includes rate limiting, CAPTCHA for public endpoints, auto-scaling to absorb traffic spikes, and DDoS protection at the CDN layer. **Threat 4: Privilege Escalation** occurs when attackers gain elevated permissions through authorization bypass or role manipulation. Mitigation includes role-based access control, server-side authorization checks, audit logging, and regular permission reviews.

### Security Controls

Security controls implement defense-in-depth strategies. **Network Security** uses firewalls restricting inbound traffic to necessary ports (443 for HTTPS, 3306 for MySQL from API Gateway only), security groups isolating database and storage from public internet, and VPNs for administrative access. **Application Security** uses HTTPS for all communications, HSTS headers enforcing HTTPS, Content Security Policy preventing XSS, and CSRF tokens for state-changing operations.

**Data Security** uses encryption at rest with AES-256 for database and S3, encryption in transit with TLS 1.3, secure key management with cloud provider KMS, and data classification with different encryption for PII vs. non-sensitive data. **Operational Security** uses least privilege access granting minimum necessary permissions, audit logging recording all access and changes, security monitoring detecting anomalous behavior, and incident response procedures for security events.

---

## Performance Architecture

### Performance Optimization Strategies

Performance optimization focuses on minimizing latency and maximizing throughput. **Frontend Optimization** includes code splitting reducing initial bundle size by 40%, lazy loading deferring non-critical modules, image optimization compressing photos to 80% quality, and caching storing frequently accessed data locally. **Backend Optimization** includes database indexing reducing query time by 90%, query optimization using EXPLAIN to identify slow queries, response caching with 5-minute TTL for read-heavy endpoints, and connection pooling reusing database connections.

**Network Optimization** includes CDN caching serving static assets from edge locations, compression using gzip for text responses, HTTP/2 multiplexing multiple requests over single connection, and prefetching loading data before users navigate to screens. **Mobile Optimization** includes native driver animations running on UI thread, FlatList virtualization rendering only visible items, image lazy loading deferring offscreen images, and background sync deferring non-critical operations.

### Performance Monitoring

Performance monitoring tracks key metrics. **Client-Side Metrics** include time to interactive measuring app launch time, screen transition time measuring navigation performance, API call duration measuring network latency, and frame rate measuring animation smoothness. **Server-Side Metrics** include API response time measuring endpoint performance, database query time measuring data access performance, error rate measuring reliability, and throughput measuring requests per second.

**User Experience Metrics** include perceived performance measuring user satisfaction, conversion rate measuring feature adoption, and retention rate measuring long-term engagement. Metrics are collected using APM tools like New Relic or Datadog with dashboards visualizing trends and alerts triggering when thresholds are exceeded.

---

## Appendix

### Architectural Decision Records

**ADR-001: Mobile-First Architecture**  
**Decision:** Build mobile app as primary interface with web as secondary.  
**Rationale:** Target users are mobile-first entrepreneurs operating in the field.  
**Consequences:** Optimized UX for mobile but limited desktop functionality.

**ADR-002: Offline-First Data Strategy**  
**Decision:** Store all data locally with background sync to server.  
**Rationale:** Event locations often have poor connectivity.  
**Consequences:** Complex sync logic but excellent user experience.

**ADR-003: tRPC for API Layer**  
**Decision:** Use tRPC instead of REST or GraphQL.  
**Rationale:** End-to-end type safety and excellent developer experience.  
**Consequences:** Tight coupling between frontend and backend but faster development.

**ADR-004: MySQL for Primary Database**  
**Decision:** Use MySQL instead of PostgreSQL or MongoDB.  
**Rationale:** Mature ecosystem, excellent performance, and managed service availability.  
**Consequences:** Relational schema requires migrations but ensures data integrity.

### Glossary

**CQRS:** Command Query Responsibility Segregation, pattern separating read and write operations.

**Event Sourcing:** Pattern storing state changes as sequence of events.

**Eventual Consistency:** Model where data converges to consistent state over time.

**Optimistic UI:** Pattern updating UI immediately before server confirmation.

**PKCE:** Proof Key for Code Exchange, OAuth extension preventing code interception.

### References

This document draws on established architectural patterns and best practices. Key references include Martin Fowler's Patterns of Enterprise Application Architecture, Sam Newman's Building Microservices, and the Twelve-Factor App methodology.

### Change Log

**Version 1.0 (January 16, 2026):** Initial architecture documentation covering system context, containers, components, data architecture, API architecture, integration architecture, deployment architecture, security architecture, and performance architecture for Abang Colek Mobile Brand OS.

---

**Document Status:** Active Development  
**Next Review Date:** February 16, 2026  
**Approval:** Pending Architecture Review Board
