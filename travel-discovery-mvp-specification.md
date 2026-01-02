# Travel Discovery Application — MVP Specification

---

## Document Information

| Attribute | Value |
|-----------|-------|
| Version | 1.0 |
| Status | Draft |
| Last Updated | January 2026 |
| Classification | Internal |

---

## 1. Executive Summary

Travel Discovery is an AI-powered travel planning application that transforms destination research into an intuitive, explorable experience. Rather than presenting information as static lists or articles, the application visualizes travel knowledge as an interconnected graph where users navigate through nodes representing destinations, activities, accommodations, dining options, transportation methods, and cultural insights.

The core interaction model centers on progressive discovery. Users begin with a natural language prompt describing their travel interests or constraints. The system generates an initial graph of relevant concepts, with each node serving as a potential gateway to deeper exploration. Selecting any node transitions the view to center on that selection, revealing new connections and recommendations tailored to that specific context.

The application leverages large language model capabilities to generate rich, contextual information on demand while implementing intelligent caching to optimize costs and response times. All discovery sessions persist to a database, allowing users to resume exploration across sessions and revisit previous research.

---

## 2. Product Vision and Objectives

### 2.1 Problem Statement

Current travel planning tools force users into predefined workflows that may not match their exploration style. Search engines return overwhelming lists requiring significant cognitive effort to synthesize. Guidebooks and articles present curated but static perspectives. Travel booking platforms optimize for transactions rather than discovery.

Travelers often have vague or evolving preferences that crystallize through exploration. They want to understand how destinations connect, what experiences complement each other, and what local insights might transform a good trip into a memorable one. Existing tools poorly support this organic discovery process.

### 2.2 Solution Overview

Travel Discovery addresses these challenges by presenting travel information as a navigable knowledge graph. This approach offers several advantages over traditional tools.

First, it supports non-linear exploration. Users can follow their curiosity rather than a prescribed path, diving deep into specific interests or broadening their view as desired.

Second, it provides contextual recommendations. Each node's children are generated with full awareness of the parent context, ensuring suggestions remain relevant to the user's evolving focus.

Third, it enables progressive refinement. Users start with broad concepts and naturally narrow toward specific plans through their navigation choices.

Fourth, it preserves research. All exploration persists, allowing users to return to any point in their discovery journey without losing prior work.

### 2.3 MVP Success Criteria

The MVP will be considered successful if it achieves the following outcomes within 90 days of launch.

Users create at least 100 discovery sessions, demonstrating baseline adoption and interest in the core concept.

Average session depth exceeds five nodes explored, indicating the graph navigation model provides sufficient value to encourage continued exploration.

Return session rate exceeds 30 percent, showing users find value in resuming previous discoveries or starting new ones.

Cache hit rate exceeds 60 percent after 30 days of operation, validating the caching strategy and demonstrating cost efficiency.

System maintains sub-200-millisecond response times for cached content and sub-5-second response times for AI-generated content, ensuring the experience feels responsive.

---

## 3. User Experience Specification

### 3.1 Primary Interface Layout

The application presents a full-screen canvas as its primary workspace, with a collapsible sidebar on the left edge and a debug console in the top-right corner.

The canvas occupies the majority of screen real estate and renders the current graph view. Users interact with this space through mouse or touch gestures including pan to reposition the viewport, zoom to adjust scale, and click to select nodes. The graph centers on the current mother node with connected child nodes arranged around it.

The sidebar provides navigation and session management capabilities. In its expanded state, it occupies approximately 280 pixels of width. Users can collapse it to a narrow strip showing only icons, maximizing canvas space when desired. The sidebar contains three distinct sections stacked vertically.

The debug console appears as a semi-transparent overlay in the top-right corner. It displays a scrolling log of system events and user actions, primarily serving development and troubleshooting purposes. Users can collapse it to a small toggle button when not needed.

### 3.2 Graph Visualization Behavior

The graph renders nodes as rounded rectangular cards containing summary information about the entity they represent. Node cards display a title, category indicator, and brief description or key attributes. Visual styling differentiates node types through color coding, iconography, and border treatments.

Template nodes appear with solid borders and muted background colors corresponding to their category. Destination nodes use a blue palette, activity nodes use green, accommodation nodes use amber, food nodes use red, transportation nodes use purple, and culture nodes use teal.

Discovery nodes appear with dashed borders and subtle gradient backgrounds, visually distinguishing them as AI-generated recommendations rather than structured data entries. They also display a small sparkle icon indicating their generated nature.

Edges connect related nodes as curved lines with subtle animations suggesting directionality from parent to child. Edge thickness or opacity may vary based on relationship strength or relevance scores.

Loading states appear when content is being fetched or generated. Nodes awaiting content display a pulsing animation with a skeleton placeholder. The loading node's border animates to indicate active processing.

### 3.3 Navigation Interaction Model

When a user clicks on any node, the system initiates a view transition that makes the selected node the new center of attention. This transition involves several coordinated actions.

The viewport animates smoothly to center on the selected node, with the animation completing within 300 milliseconds to maintain responsiveness without feeling abrupt.

The system checks whether child nodes for the selected node have already been loaded. If they exist in the session state, they animate into view around the new mother node. If not, the system initiates content generation, displaying loading placeholders while awaiting results.

The navigation history updates to record this transition. The selected node becomes the new current position, and users can subsequently navigate backward to the previous mother node or forward if they had previously navigated back.

The previous graph view fades from prominence but remains accessible through history navigation. This creates a breadcrumb trail of the user's exploration path.

### 3.4 Sidebar Components

The sidebar contains three primary sections, each serving distinct functions in the user workflow.

The New Discovery section appears at the top of the sidebar and contains a form for initiating new exploration sessions. The form presents a text area accepting natural language prompts up to 1000 characters. Placeholder text suggests example prompts to guide users unfamiliar with the system. A submit button triggers the discovery process, which generates an initial graph and creates a new session record.

The Discovery History section lists all previous discovery sessions created by the user. Each entry displays the initial prompt text, creation date, and last accessed date. Entries are sorted by last accessed date with most recent first. Clicking any entry loads that session's current state, restoring the graph and navigation position. Users can delete sessions through a contextual menu accessed via right-click or long-press.

The Navigation Trail section shows the current path through the active discovery session. It presents a vertical list of nodes from the root to the current mother node, styled as interactive breadcrumbs. Each entry shows the node title and category. Clicking any entry navigates directly to that point in history, with the graph view updating accordingly. Forward entries appear when the user has navigated backward, showing the path they can re-traverse.

### 3.5 Debug Console Functionality

The debug console serves as a development and diagnostic tool, providing visibility into system operations without requiring browser developer tools.

The console displays log entries in chronological order, with newest entries appearing at the bottom and the view auto-scrolling to follow new entries. Each entry shows a timestamp with millisecond precision, a category tag, an event name, and relevant payload data.

Log categories include User Actions for clicks, form submissions, and navigation events; API Calls for request initiation, response receipt, and timing information; Cache Operations for hits, misses, and storage events; State Changes for store updates and graph modifications; and Errors for exceptions, failed requests, and validation failures.

Users can filter the log by category using toggle buttons at the top of the console. A clear button removes all current entries. A collapse button minimizes the console to a small floating indicator showing the count of logged events.

The console is enabled by default in development environments and can be enabled in production through a configuration flag or query parameter for troubleshooting purposes.

---

## 4. Node Type Specifications

### 4.1 Template Nodes

Template nodes follow predefined schemas based on their category, ensuring consistent data structure across all nodes of the same type. The system defines six template categories for the MVP.

Destination nodes represent geographic locations at various scales from countries to specific neighborhoods. They contain the following attributes: a name identifying the location, a country providing national context, a description offering a narrative overview in two to four sentences, climate information summarizing typical weather patterns and seasonal variations, a best time to visit recommendation with rationale, highlights listing three to five notable features or attractions, and travel tips providing three to five practical suggestions for visitors.

Activity nodes represent experiences, excursions, or things to do. They contain a name identifying the activity, a type classification from adventure, cultural, relaxation, nature, or entertainment, a duration estimate in hours or days, a difficulty rating of easy, moderate, or challenging, a description explaining the experience in two to three sentences, a price range indicator using one to four dollar signs, and seasonality notes about when the activity is available or optimal.

Accommodation nodes represent lodging options. They contain a name identifying the property or type, a type classification from hotel, hostel, apartment, resort, or boutique, a price range indicator using one to four dollar signs, an amenities list of notable features, a location description of the area or neighborhood, and a description providing a narrative overview in two to three sentences.

Food and Dining nodes represent culinary experiences. They contain a name identifying the restaurant, market, or food type, a cuisine type classification, a price range indicator using one to four dollar signs, a description explaining the experience in two to three sentences, and a must-try list of three to five recommended dishes or items.

Transportation nodes represent travel methods between or within destinations. They contain a type classification from flight, train, bus, ferry, rental, or local transit, a routes list of common paths or connections, a duration estimate for typical journeys, a cost range for typical fares, a frequency note about how often service operates, and tips providing practical suggestions for travelers.

Culture nodes represent customs, traditions, and social contexts. They contain an aspect name identifying the cultural element, a description explaining its significance in two to three sentences, an etiquette list of three to five dos and don'ts, and an experiences list of ways to engage with this cultural aspect.

### 4.2 Discovery Nodes

Discovery nodes differ fundamentally from template nodes in that their content structure is not predetermined. Instead, the AI generates appropriate content based on the parent node's context and the nature of the recommendation.

Discovery nodes always contain a title summarizing the recommendation, a category indicating which template type the recommendation most closely resembles, a teaser providing a one-sentence hook explaining why this discovery is relevant, a relevance score from zero to one indicating how strongly this recommendation connects to the parent context, and content containing the detailed information which follows the schema of the indicated category.

The AI generates discovery nodes by analyzing the parent node's complete content and context, then identifying complementary, contrasting, or unexpected connections that would enrich the user's exploration. Discoveries might include hidden gems that tourists typically miss, local alternatives to popular attractions, seasonal events or experiences, practical considerations the user might not have anticipated, or connections to the user's implicit interests based on their exploration path.

### 4.3 Node Generation Rules

When generating child nodes for any mother node, the system follows specific rules to ensure coherent and useful results.

Each mother node generates between three and eight child nodes, with the exact number determined by the richness of available content and the specificity of the parent context. Broader concepts like countries generate more children than narrow concepts like specific restaurants.

The mix of template and discovery nodes varies based on parent type. Destination nodes generate mostly template children across multiple categories plus one or two discovery nodes. Activity nodes generate related activities, relevant accommodation, and dining options. Accommodation nodes generate nearby activities, dining, and transportation. Food nodes generate related culinary experiences and cultural context. Transportation nodes generate destination endpoints and practical tips. Culture nodes generate related experiences and relevant etiquette across categories.

Discovery nodes as parents follow the same rules as the template category they most closely match, ensuring exploration can continue indefinitely regardless of how the user arrived at their current position.

The system avoids generating duplicate or near-duplicate nodes within the same session. Before generation, the AI receives a list of existing siblings and explicitly avoids repeating them.

---

## 5. AI Service Specification

### 5.1 Model Selection and Configuration

The application uses Claude Sonnet 4.5 accessed through Amazon Bedrock as its language model provider. This model offers strong performance on structured generation tasks with reasonable latency and cost characteristics suitable for an interactive application.

The model is invoked with consistent parameters across all generation requests: a maximum token limit of 4096 tokens to accommodate detailed node content, a temperature setting of 0.7 to balance creativity with consistency, and standard sampling parameters.

### 5.2 Prompt Engineering Approach

Prompts to the language model follow a structured format designed to produce reliable, parseable outputs while allowing flexibility in content quality.

All prompts begin with a role definition establishing the AI as a knowledgeable travel expert with specific capabilities. This framing helps produce appropriately detailed and practical information.

The prompt then provides context about the current exploration state, including the mother node's complete content, the user's original discovery prompt, and a summary of the exploration path that led to the current position. This context enables the model to generate highly relevant children.

The prompt specifies the exact output format required, whether generating template nodes with specific schemas or discovery nodes with flexible content. Output format specifications include field names, types, constraints, and examples.

Finally, the prompt includes quality guidelines instructing the model to produce specific, actionable information rather than generic advice; maintain consistency with provided context; include practical details travelers can act upon; and acknowledge limitations or seasonal variations where relevant.

### 5.3 Content Caching Strategy

The caching system prevents redundant API calls by storing generated content keyed to the context that produced it. This approach recognizes that identical parent contexts should produce identical children, making regeneration wasteful.

Cache keys are computed by hashing the combination of parent node content, node type being generated, and category if applicable. This produces a 32-character identifier that uniquely represents the generation context.

When a node's children are requested, the system first checks the cache for each child node type and category combination. If cached content exists and has not expired, it is returned immediately without invoking the model. Cache misses trigger model invocation with results stored for future requests.

Cached entries expire after 30 days, balancing cost savings against the possibility that improved prompts or model updates might produce better content. The DynamoDB time-to-live feature handles automatic expiration without application intervention.

The cache stores complete response data including the generated content, model version used, generation timestamp, and context hash. This metadata supports cache invalidation strategies if needed in future versions.

### 5.4 Error Handling and Fallbacks

Model invocation can fail for various reasons including service unavailability, rate limiting, timeout, or invalid responses. The system handles each failure mode appropriately.

Service unavailability triggers exponential backoff retry with a maximum of three attempts. If all retries fail, the user sees an error message suggesting they try again later.

Rate limiting responses trigger a delayed retry based on the retry-after header if provided, otherwise using a default one-minute delay. The user sees a message indicating high demand and estimating wait time.

Timeout errors, defined as responses taking longer than 30 seconds, cancel the request and trigger a single retry. Persistent timeouts produce an error message.

Invalid responses that cannot be parsed as expected JSON trigger a single retry with slightly modified prompt formatting. If the retry also fails, the system logs the malformed response for debugging and shows an error message.

All errors are logged with full context to the debug console and backend logging infrastructure for analysis and improvement.

---

## 6. Data Architecture

### 6.1 Database Technology Selection

The application uses Amazon DynamoDB as its primary data store. This choice aligns with the serverless architecture, offers predictable performance at scale, and provides native integration with AWS Lambda and other services.

DynamoDB's flexible schema supports the varying content structures across node categories without requiring migrations. Its single-table design pattern enables efficient access patterns while maintaining data locality.

The pay-per-request billing mode matches the expected usage pattern of variable, unpredictable load during the MVP phase without requiring capacity planning.

### 6.2 Table Design

The database uses four logical tables, though future optimization might consolidate these using single-table design principles.

The Discoveries table stores metadata about discovery sessions. The primary key is a composite of partition key using the pattern DISCOVERY followed by a unique identifier and sort key of METADATA. Attributes include the discovery identifier, user identifier for future multi-user support, the initial prompt text, the root node identifier, creation timestamp, last accessed timestamp, and status indicator for active or archived.

The Nodes table stores all node data across all sessions. The primary key uses partition key pattern NODE followed by a unique identifier and sort key of METADATA. Attributes include the node identifier, discovery identifier linking to the parent session, parent node identifier which is null for root nodes, node type as template or discovery, category classification, title text, content object containing the category-specific data, position coordinates for graph layout, a flag indicating whether children have been loaded, creation timestamp, and source context hash for cache correlation. A global secondary index on discovery identifier enables efficient retrieval of all nodes within a session.

The AI Cache table stores generated content for reuse. The primary key uses partition key pattern CACHE followed by the context hash and sort key combining node type and category. Attributes include the context hash, node type, category, generated content object, model version string, creation timestamp, and time-to-live value for automatic expiration.

The Sessions table stores user session state for resumability. The primary key uses partition key pattern SESSION followed by the session identifier and sort key of STATE. Attributes include the session identifier, discovery identifier, user identifier, current node identifier, navigation history as an array of entries, current history index, and last update timestamp.

### 6.3 Access Patterns

The data model supports the following primary access patterns required by the application.

Creating a new discovery involves writing to the Discoveries table and creating an initial root node in the Nodes table.

Loading a discovery requires reading the discovery metadata, querying all nodes for that discovery using the secondary index, and reading the session state.

Loading node children involves reading the parent node, checking the cache for each expected child, generating missing children via AI, writing new nodes to the Nodes table, writing generated content to the cache, and updating the parent node's children loaded flag.

Navigating between nodes requires reading the target node and updating the session state with new position and history.

Listing discovery history involves querying the Discoveries table filtered by user identifier and sorted by last accessed date.

Saving session state involves writing to the Sessions table with the current graph state and navigation position.

### 6.4 Data Retention and Cleanup

Discovery data persists indefinitely unless explicitly deleted by users. The archived status allows soft deletion with potential recovery.

Cache data automatically expires after 30 days through DynamoDB TTL, requiring no application intervention for cleanup.

Session state updates on each navigation action, maintaining current position for resumability. Sessions without activity for 90 days may be candidates for cleanup in future versions.

No personally identifiable information is stored in the MVP beyond an anonymous user identifier. Future versions implementing authentication will require additional data handling considerations.

---

## 7. System Architecture

### 7.1 High-Level Architecture Overview

The system follows a serverless architecture pattern leveraging AWS managed services to minimize operational overhead while maintaining scalability and cost efficiency.

Users access the application through a web browser, with the React single-page application served from Amazon S3 through CloudFront for global distribution and HTTPS termination.

The frontend communicates with backend services through Amazon API Gateway, which provides request routing, throttling, and API key management.

Backend logic executes in AWS Lambda functions, with separate functions handling discovery management, node operations, session state, and AI service integration.

Data persists in Amazon DynamoDB tables as described in the data architecture section.

AI capabilities are provided by Amazon Bedrock, which hosts the Claude Sonnet model and handles inference infrastructure.

### 7.2 Frontend Architecture

The frontend is a single-page application built with React and TypeScript. Vite serves as the build tool and development server, offering fast hot module replacement and optimized production builds.

React Flow provides the graph visualization canvas, handling node rendering, edge drawing, viewport controls, and interaction events. The library's extensibility allows custom node components matching the application's visual design.

Zustand manages application state through multiple focused stores. The graph store holds the current mother node, visible nodes and edges, and computed layout positions. The session store tracks the active discovery, navigation history, and synchronization status. The debug store accumulates log entries and manages console visibility.

TailwindCSS provides utility-first styling, enabling rapid iteration on visual design without maintaining separate stylesheet files.

The application communicates with backend services through a centralized API service module that handles request construction, response parsing, error handling, and retry logic.

### 7.3 Backend Architecture

The backend consists of four Lambda functions, each responsible for a coherent set of operations.

The Discovery Handler manages discovery session lifecycle including creation, retrieval, listing, and deletion. When creating a discovery, it generates the initial root node and first generation of children by invoking the AI service.

The Node Handler manages node data including retrieval of individual nodes, loading of children for a node, and node creation. Child loading involves cache checks and AI generation as needed.

The Session Handler manages user session state including reading current state and writing updated state after navigation. It ensures users can resume their exploration from any device.

The AI Service encapsulates all interaction with Amazon Bedrock including prompt construction, model invocation, response parsing, and cache management. Other handlers invoke this service rather than calling Bedrock directly.

A shared Lambda Layer contains common utilities used across all functions including the DynamoDB client wrapper, response formatting helpers, error handling utilities, and shared type definitions.

### 7.4 API Design

The API follows RESTful conventions with JSON request and response bodies.

The discoveries resource supports POST to create a new discovery from a prompt, GET to list all discoveries for the user, and GET with identifier to retrieve a specific discovery with its nodes.

The nodes resource supports GET with identifier to retrieve a specific node and GET with identifier and children subresource to retrieve or generate child nodes.

The sessions resource supports GET with identifier to retrieve current session state and PUT with identifier to update session state.

The AI resource supports POST with generate subresource to generate content, though this is primarily used internally by other handlers.

All responses follow a consistent envelope format with appropriate HTTP status codes, error structures for failure cases, and pagination for list endpoints.

### 7.5 Security Architecture

The MVP implements baseline security appropriate for a non-authenticated application.

All traffic uses HTTPS with TLS 1.2 or higher. CloudFront terminates TLS for frontend requests, and API Gateway terminates TLS for API requests.

API Gateway throttling prevents abuse by limiting request rates per API key. Default limits allow 100 requests per second with a burst capacity of 200.

CORS configuration restricts API access to the frontend domain in production, preventing unauthorized cross-origin requests.

Input validation occurs at multiple layers. API Gateway validates request structure against defined schemas. Lambda handlers validate business logic constraints. DynamoDB conditions prevent invalid state transitions.

DynamoDB tables use encryption at rest with AWS-managed keys. No additional application-layer encryption is implemented for the MVP.

Lambda functions operate with minimal IAM permissions, accessing only the specific DynamoDB tables and Bedrock models required for their function.

---

## 8. Infrastructure Specification

### 8.1 Infrastructure as Code Approach

All infrastructure is defined using AWS Cloud Development Kit with TypeScript. This approach ensures infrastructure definitions are version-controlled, reviewable, and repeatable across environments.

The CDK application organizes infrastructure into logical stacks that can be deployed independently or together.

The Frontend Stack provisions the S3 bucket for static asset hosting, CloudFront distribution for content delivery, and Origin Access Identity for secure S3 access.

The Database Stack provisions all DynamoDB tables with appropriate key schemas, global secondary indexes, and configuration settings.

The API Stack provisions the API Gateway REST API, Lambda functions, IAM roles and policies, and the shared Lambda Layer.

The Pipeline Stack provisions the CI/CD pipeline resources if using AWS-native deployment rather than GitHub Actions.

### 8.2 Environment Configuration

The system supports multiple deployment environments with configuration varying appropriately.

Development environments use relaxed CORS settings, enabled debug features, reduced DynamoDB provisioning, and verbose logging.

Staging environments mirror production configuration with separate resources, enabling pre-production validation.

Production environments use restrictive CORS settings, disabled debug features by default, production DynamoDB settings, and standard logging levels.

Environment-specific configuration is injected through CDK context values and Lambda environment variables, avoiding any hardcoded values in application code.

### 8.3 Scalability Considerations

The architecture supports significant scale without modification due to its serverless nature.

Lambda functions automatically scale based on incoming request volume, with AWS managing the underlying compute infrastructure.

DynamoDB tables use on-demand capacity mode, automatically scaling read and write capacity based on actual usage patterns.

CloudFront caches static assets at edge locations globally, reducing origin load and improving user experience.

The primary scaling constraint is the Bedrock model invocation rate, which has account-level limits. The caching strategy mitigates this by reducing the percentage of requests requiring model invocation over time.

### 8.4 Monitoring and Observability

AWS CloudWatch provides baseline monitoring capabilities for all components.

Lambda functions emit standard metrics including invocation count, duration, error rate, and throttling. Custom metrics track cache hit rates and AI generation latency.

API Gateway emits request count, latency, and error rate metrics at the API and endpoint level.

DynamoDB emits consumed capacity, throttled request, and latency metrics.

CloudWatch Logs capture structured log output from all Lambda functions, with log groups configured for 30-day retention.

CloudWatch Alarms notify operators of critical conditions including elevated error rates, unusual latency, and approaching service limits.

---

## 9. Deployment Pipeline

### 9.1 Continuous Integration Process

The CI process executes on every push to the repository and every pull request targeting the main branch.

The process begins with dependency installation using locked versions from package-lock files to ensure reproducible builds.

Linting checks verify code style compliance using ESLint with TypeScript-specific rules. All warnings are treated as errors in CI.

Type checking verifies TypeScript compilation succeeds without errors across all packages in the monorepo.

Unit tests execute using Vitest for frontend code and Jest for backend code. Tests run in parallel with coverage reporting enabled.

Integration tests execute against mock services, verifying correct interaction patterns between components.

Build steps compile TypeScript to JavaScript, bundle frontend assets, and package Lambda deployment artifacts.

All steps must pass for the pipeline to proceed. Failures block merge for pull requests and halt deployment for main branch pushes.

### 9.2 Continuous Deployment Process

Deployment executes automatically when changes merge to the main branch, following successful CI completion.

AWS credentials are obtained through GitHub Actions OIDC integration with an IAM role, avoiding long-lived access keys.

CDK deployment synthesizes CloudFormation templates and applies changes to the target AWS account. The deployment requires no manual approval for the MVP phase.

Frontend assets deploy to the S3 bucket using sync with delete to remove obsolete files.

CloudFront cache invalidation ensures users receive updated assets immediately rather than waiting for cache expiration.

Post-deployment verification runs smoke tests against the deployed API endpoints, confirming basic functionality.

Deployment notifications report success or failure to the team through configured channels.

### 9.3 Rollback Procedures

Infrastructure rollback uses CloudFormation's native rollback capability. Failed deployments automatically revert to the previous successful state.

Frontend rollback can be achieved by redeploying a previous git commit or by restoring S3 objects from versioning if enabled.

Lambda function rollback uses version aliases, allowing instant traffic shift to a previous function version without redeployment.

Database changes require careful consideration as DynamoDB does not support automatic rollback. The MVP avoids breaking schema changes by using flexible document structures.

---

## 10. Testing Strategy

### 10.1 Testing Philosophy

The testing strategy prioritizes confidence in critical paths while maintaining reasonable development velocity. Tests focus on behavior rather than implementation details, enabling refactoring without test breakage.

The testing pyramid guides effort allocation: many unit tests for pure functions and isolated components, fewer integration tests for component interactions, and minimal end-to-end tests for critical user journeys.

All tests must pass before merge to main branch. Flaky tests are treated as high-priority bugs requiring immediate attention.

### 10.2 Frontend Testing Approach

Unit tests cover React components in isolation, verifying rendering behavior, user interaction handling, and prop-based variations. React Testing Library encourages testing from the user's perspective rather than implementation details.

Store tests verify state management logic, including initial state, action effects, and derived state computations. Zustand stores are tested as plain JavaScript modules.

Service tests verify API client behavior including request construction, response parsing, error handling, and retry logic. Mock Service Worker intercepts network requests for realistic testing.

Integration tests verify component compositions, particularly the interaction between graph visualization, state management, and API services.

### 10.3 Backend Testing Approach

Unit tests cover individual functions within handlers and services. Pure functions are tested extensively with various input combinations. Functions with dependencies use mocking to isolate the unit under test.

Handler tests verify Lambda function entry points including request parsing, business logic execution, and response formatting. They use synthetic API Gateway events as inputs.

Integration tests verify correct interaction with DynamoDB using DynamoDB Local for realistic behavior without affecting real tables.

AI service tests verify prompt construction and response parsing using mocked Bedrock responses. Actual model invocation is tested separately in staging environments.

### 10.4 Coverage Requirements

The project maintains minimum coverage thresholds enforced by CI.

Frontend coverage must meet or exceed 80 percent for component code, 90 percent for store code, and 85 percent for service code.

Backend coverage must meet or exceed 85 percent for handler code, 90 percent for service code, and 95 percent for utility code.

Coverage reports are generated during CI and stored as build artifacts. Coverage trends are tracked to identify degradation over time.

---

## 11. Coding Standards and Conventions

### 11.1 TypeScript Standards

All code uses TypeScript with strict mode enabled. The noImplicitAny, strictNullChecks, and strictFunctionTypes options are all enabled.

Types are defined explicitly for function parameters, return values, and complex object structures. Type inference is acceptable for simple local variables where the type is obvious.

Interface definitions use descriptive names reflecting their purpose. Generic types are used where appropriate to enable reuse.

Enums are avoided in favor of union types of string literals, which provide better type safety and runtime behavior.

Null and undefined are handled explicitly. Optional chaining and nullish coalescing operators are preferred over explicit null checks where appropriate.

### 11.2 Code Organization

Code is organized by feature rather than by type. Each feature directory contains its components, hooks, services, and tests together.

Shared utilities live in dedicated directories at the appropriate scope, whether shared within a package or across the entire monorepo.

Circular dependencies are prohibited. The dependency graph must be acyclic, enforced by linting rules.

File naming uses kebab-case for all files except React components, which use PascalCase matching the component name.

### 11.3 Duplication Avoidance

Code duplication is actively prevented through multiple mechanisms.

Shared logic is extracted into utility functions or custom hooks as soon as a second use case emerges.

Common patterns are abstracted into higher-order components, render props, or composition patterns as appropriate.

Backend handlers share common logic through the shared Lambda Layer, avoiding reimplementation across functions.

Linting rules flag similar code blocks, prompting developers to extract shared abstractions.

Code review specifically checks for duplication, both within the changed files and against existing codebase patterns.

### 11.4 Configuration Management

No values are hardcoded in application code. All configuration flows through environment variables or configuration files.

Frontend configuration uses Vite's environment variable system with the VITE prefix convention.

Backend configuration uses Lambda environment variables injected through CDK deployment.

Default values are defined in centralized configuration modules, making them visible and maintainable.

Sensitive values are never committed to source control. Secrets use AWS Secrets Manager or Systems Manager Parameter Store.

Magic numbers are extracted into named constants with descriptive names explaining their purpose.

---

## 12. Error Handling Standards

### 12.1 Error Classification

Errors are classified into categories that determine handling behavior.

Validation errors result from invalid user input and are recoverable by correcting the input. They return 400-series HTTP status codes with specific field-level error information.

Authentication errors result from missing or invalid credentials. They return 401 status and prompt appropriate user action.

Authorization errors result from insufficient permissions for the requested action. They return 403 status with guidance on required permissions.

Not found errors result from requests for non-existent resources. They return 404 status with clear resource identification.

Conflict errors result from operations that cannot complete due to state conflicts. They return 409 status with information about the conflicting state.

Internal errors result from unexpected system failures. They return 500 status with a correlation identifier for support investigation while hiding implementation details from users.

### 12.2 Error Response Format

All error responses follow a consistent JSON structure containing an error code as a machine-readable identifier, a message as a human-readable description, optional details as an object with additional context, and an optional correlation identifier for support purposes.

Error messages are written for end-user consumption where appropriate, avoiding technical jargon and providing actionable guidance when possible.

### 12.3 Error Logging

All errors are logged with consistent structured format including timestamp, error code, message, stack trace for internal errors, request context, and user context where available.

Error logs are distinguished from informational logs through log levels, enabling filtering and alerting based on severity.

Sensitive information is excluded from error logs, including credentials, personal data, and internal system details that could aid attackers.

---

## 13. MVP Scope Definition

### 13.1 Included Features

The MVP includes all functionality necessary to validate the core product hypothesis.

Graph-based visualization allows users to view travel information as interconnected nodes with interactive navigation.

Two node types provide both structured template content and AI-generated discovery recommendations.

AI content generation leverages Claude Sonnet to produce relevant, contextual information on demand.

Content caching stores generated content to improve response times and reduce API costs.

Session persistence allows users to save and resume discovery sessions across browser sessions.

Navigation history enables non-linear exploration with the ability to revisit previous exploration points.

Sidebar interface provides access to new discoveries, history, and navigation without leaving the main view.

Debug console supports development and troubleshooting with visibility into system operations.

Complete deployment pipeline enables rapid iteration with automated testing and deployment.

### 13.2 Excluded Features

The following features are explicitly out of scope for the MVP and planned for future phases.

User authentication is excluded. The MVP uses anonymous sessions identified by browser-stored identifiers. User accounts, login, and profile management are deferred.

Multi-user collaboration is excluded. Each session belongs to a single anonymous user. Sharing, commenting, and collaborative planning are deferred.

Custom node templates are excluded. Users cannot define their own node categories or modify existing schemas.

Offline support is excluded. The application requires network connectivity for all operations.

Mobile-responsive design is excluded. The MVP targets desktop browsers with responsive enhancements deferred.

Export functionality is excluded. Users cannot export discoveries as PDFs, itineraries, or other formats.

Booking integrations are excluded. The application provides information only without connecting to reservation systems.

Personalization is excluded. The system does not learn user preferences or customize recommendations based on history.

Analytics are excluded. Usage tracking beyond basic CloudWatch metrics is deferred.

Multi-language support is excluded. The MVP supports English only.

### 13.3 Technical Debt Acceptance

The following technical shortcuts are accepted for MVP velocity with commitment to address post-launch.

Testing coverage may fall below targets for experimental features, with coverage debt tracked and prioritized.

Error handling may be simplified in edge cases, with enhancement based on observed production behavior.

Performance optimization is deferred where baseline performance meets requirements.

Documentation may be minimal for internal interfaces, with enhancement based on team needs.

---

## 14. Performance Requirements

### 14.1 Response Time Targets

The application must meet response time targets to provide a responsive user experience.

Initial page load must complete within 2 seconds on broadband connections, measured as time to interactive.

Cached content retrieval must complete within 200 milliseconds from request initiation to rendered response.

AI-generated content must complete within 5 seconds, with appropriate loading indication throughout.

Navigation transitions must complete within 300 milliseconds for visual animation completion.

Sidebar interactions must respond within 100 milliseconds to feel instantaneous.

### 14.2 Throughput Expectations

The MVP targets modest throughput aligned with initial user volume expectations.

The system should support 100 concurrent users without degradation.

The system should handle 1000 API requests per minute at steady state.

The system should handle burst traffic of 5000 requests per minute for short periods.

### 14.3 Availability Targets

The MVP targets standard availability appropriate for a non-critical application.

Target uptime is 99.5 percent measured monthly, allowing approximately 3.6 hours of downtime per month.

Planned maintenance windows are communicated 24 hours in advance when possible.

Unplanned outages are communicated through status page updates as soon as identified.

---

## 15. Future Considerations

### 15.1 Authentication and Authorization

Future versions will implement user authentication through Amazon Cognito or a similar identity provider. This enables personalization, cross-device synchronization, and user-specific data isolation.

Authorization rules will control access to discoveries, enabling private, shared, and public visibility settings.

Social authentication options will reduce friction for user registration.

### 15.2 Collaboration Features

Future versions may support collaborative discovery sessions where multiple users explore together.

Real-time synchronization will show collaborator positions and actions within shared sessions.

Comments and annotations will allow users to mark up discoveries with notes and reactions.

Sharing controls will allow users to invite others to view or collaborate on discoveries.

### 15.3 Integration Opportunities

Future versions may integrate with external services to enhance utility.

Booking platform integrations could enable direct reservation of discovered accommodations, activities, and transportation.

Calendar integrations could help users plan timing for their discoveries.

Map integrations could provide geographic context for destination nodes.

Weather integrations could provide current and forecast conditions for destinations.

### 15.4 Platform Expansion

Future versions may expand beyond web browsers.

Native mobile applications could provide improved mobile experience with offline capabilities.

Browser extensions could enable saving discoveries from travel content encountered on other sites.

API access could enable third-party developers to build on the discovery platform.

---

## Appendix A: Glossary

**Discovery**: A user session exploring travel possibilities, initiated by a natural language prompt and containing a connected graph of nodes.

**Discovery Node**: A node type whose content is generated by the AI based on parent context rather than following a predefined template.

**Edge**: A visual connection between two nodes representing their relationship in the knowledge graph.

**Mother Node**: The currently focused node at the center of the graph view, whose children are displayed and available for selection.

**Navigation History**: The ordered sequence of mother nodes visited during a discovery session, enabling backward and forward traversal.

**Node**: A discrete unit of travel information rendered as an interactive card in the graph visualization.

**Template Node**: A node type whose content structure follows a predefined schema based on its category.

---

## Appendix B: Node Category Reference

**Destination**: Geographic locations including countries, regions, cities, and neighborhoods. Contains name, country, description, climate, best time to visit, highlights, and travel tips.

**Activity**: Experiences and things to do including tours, adventures, attractions, and events. Contains name, type, duration, difficulty, description, price range, and seasonality.

**Accommodation**: Lodging options including hotels, hostels, apartments, and resorts. Contains name, type, price range, amenities, location, and description.

**Food and Dining**: Culinary experiences including restaurants, markets, and food types. Contains name, cuisine type, price range, description, and must-try items.

**Transportation**: Travel methods including flights, trains, buses, ferries, rentals, and local transit. Contains type, routes, duration, cost, frequency, and tips.

**Culture**: Customs and social context including traditions, etiquette, and practices. Contains aspect name, description, etiquette guidelines, and related experiences.

---

## Appendix C: API Endpoint Reference

**POST /discoveries**: Creates a new discovery session from a user prompt. Accepts prompt text in request body. Returns discovery metadata and initial graph.

**GET /discoveries**: Lists all discovery sessions for the current user. Returns array of discovery summaries sorted by last access date.

**GET /discoveries/{id}**: Retrieves a specific discovery session with all its nodes. Returns complete discovery data including node graph.

**GET /nodes/{id}**: Retrieves a specific node by identifier. Returns complete node data including content.

**GET /nodes/{id}/children**: Retrieves or generates child nodes for a parent. Returns array of child nodes and edges, with cache status indicator.

**GET /sessions/{id}**: Retrieves current session state including navigation position. Returns session data with history and current index.

**PUT /sessions/{id}**: Updates session state after navigation. Accepts new position and history in request body. Returns confirmation.

**POST /ai/generate**: Internal endpoint for AI content generation. Accepts generation context in request body. Returns generated content with cache status.

---

*End of Specification Document*
