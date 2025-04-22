# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Authentication system using NextAuth.js
  - Email/Password authentication
  - Google OAuth provider configuration
  - Protected routes and session management
  - Custom login/signup pages
  - JWT-based session handling with 30-minute timeout

- Trading interface implementation
  - Market overview component with real-time data
  - TradingView chart integration using Lightweight Charts
  - Order book visualization
  - Trading form with market/limit order support
  - Real-time price updates and calculations

- Dashboard layout and navigation
  - Responsive sidebar navigation
  - Protected dashboard routes
  - Portfolio page setup
  - Trading page integration

### Changed
- Updated project structure to Next.js 14 app directory
- Implemented dark theme with yellow accents
- Enhanced TypeScript type definitions
- Improved documentation and codebase organization

### Security
- Added JWT-based authentication
- Implemented protected API routes
- Added session management
- Enhanced input validation

## [0.1.0] - 2024-03-XX
- Initial release with basic project setup 