# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-01-03
### Added
- **Core Infrastructure**: AWS CDK setup with DynamoDB (Discoveries, Nodes, Sessions, Cache), Lambda (Node.js 20.x), and API Gateway.
- **Frontend**: React application with Vite, Tailwind CSS, and React Flow for graph visualization.
- **Deployment**: Automated CI/CD pipeline using GitHub Actions for both Backend and Frontend (`dev` environment).
- **Security**:
  - Implemented **Simple Token Authentication** (Shared Secret) via `Authorization: Bearer <token>` header.
  - Restricted **CORS** to allow only the CloudFront distribution and localhost.
- **Features**:
  - Interactive "Start Journey" flow with immediate graph loading.
  - "My Trips" sidebar history to persist and reload past discovery sessions.
  - CloudFront CDN hosting for the frontend.

### Fixed
- Resolved `MODULE_NOT_FOUND` errors in CI by optimizing dependency hoisting in the monorepo.
- Fixed "Blank Screen" on initial trip creation by implementing auto-fetch of the root node.
- Fixed build errors in Frontend (`unused React import`, `unused variables`).
