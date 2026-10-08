# Spec Delta

## Purpose

How the API runs safely: a health check for monitoring and tests, configuration that is
checked before the API starts, and logs that never contain credentials.

## ADDED Requirements

### Requirement: Health check
The API SHALL answer `GET /api/health` with status 200 and a body that matches the shared
health schema, without needing any credentials.

#### Scenario: health check responds
- **WHEN** a client calls `GET /api/health`
- **THEN** the API responds 200 with body `{ "status": "ok" }`

### Requirement: Configuration checked at startup
The API SHALL check its configuration before it starts listening. If a value is
missing or invalid, it SHALL stop with a message that names the setting, and it SHALL
NOT print the value itself.

#### Scenario: invalid configuration stops the API
- **WHEN** the API starts with a port that is not a number
- **THEN** startup fails with a message that names the port setting

#### Scenario: valid configuration starts the API
- **WHEN** the API starts with only the defaults from the example environment file
- **THEN** it starts and the health check responds

### Requirement: No credentials in logs
Request logs SHALL NOT contain the value of the `Authorization` header or of cookies.

#### Scenario: authorization header is redacted
- **WHEN** a request with an `Authorization` header is logged
- **THEN** the log entry does not contain the header value

### Requirement: Unknown routes return a problem detail
A request to an unknown API path SHALL get status 404 with a body in the problem detail
format (RFC 9457), so every error from the API has the same shape.

#### Scenario: unknown path
- **WHEN** a client calls `GET /api/does-not-exist`
- **THEN** the API responds 404 with content type `application/problem+json` and a body with `type`, `title` and `status`
