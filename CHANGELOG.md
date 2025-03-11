# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-15

### Added

- **Core Features**
  - Mock server creation with `createMockServer()` factory function
  - Support for GET, POST, PUT, DELETE, and PATCH HTTP methods
  - Chainable API for defining mock endpoints

- **Data Generators**
  - `uuid()` - Generate random UUID v4 strings
  - `firstName()` / `lastName()` / `fullName()` - Generate random names
  - `email()` - Generate random email addresses
  - `date()` - Generate ISO 8601 formatted dates
  - `integer()` / `float()` - Generate random numbers with configurable ranges
  - `boolean()` - Generate random boolean values
  - `phone()` - Generate formatted phone numbers
  - `url()` - Generate random URLs
  - `lorem()` - Generate lorem ipsum text

- **Schema System**
  - Define response schemas using a simple DSL
  - Support for nested objects and arrays
  - Dynamic schema generation with generator references

- **Response Handling**
  - Configurable response delays for simulating network latency
  - Random delay ranges for realistic testing scenarios
  - Error simulation with configurable error rates

- **Request Interception**
  - Intercept fetch requests and return mock responses
  - Pattern matching for URL filtering
  - Passthrough support for non-mocked requests

- **Scenario Management**
  - Define and switch between different response scenarios
  - Support for happy path, error, and edge case testing

- **Validation**
  - Schema validation with detailed error messages
  - Request body validation against defined schemas
  - Custom validation rules support

- **Logging**
  - Request/response logging for debugging
  - Configurable log levels
  - Log history access for assertions in tests

- **State Management**
  - Persistent state across requests
  - State isolation for parallel test execution
  - State reset functionality

### Documentation

- Comprehensive README with usage examples
- JSDoc comments for all public APIs
- Example configurations for common use cases

### Testing

- Full test coverage for all modules
- Jest configuration with coverage reporting
- Integration tests for end-to-end scenarios
