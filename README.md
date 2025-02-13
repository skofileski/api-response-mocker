# api-response-mocker

A lightweight library for creating mock API responses with realistic data generation. Simplifies frontend development and testing by providing configurable mock endpoints without needing a real backend.

## Installation

```bash
npm install
```

## Usage

```javascript
import { createMocker } from 'api-response-mocker';

// Create a mocker instance with optional default delay
const mocker = createMocker({ delay: 100 });

// Define a mock endpoint with a schema
mocker.define('GET', '/users', {
  id: 'uuid',
  name: 'name',
  email: 'email',
  createdAt: 'date'
}, { count: 5 }); // Returns array of 5 users

// Define endpoint with custom options
mocker.define('GET', '/products', {
  id: 'uuid',
  title: 'string',
  price: { _type: 'float', min: 10, max: 500, decimals: 2 },
  inStock: 'boolean',
  category: { _type: 'choice', options: ['Electronics', 'Clothing', 'Books'] }
}, {
  delay: 200,      // Custom delay for this endpoint
  errorRate: 0.1,  // 10% chance of error
  errorStatus: 503 // Return 503 on simulated error
});

// Make a request
const response = await mocker.request('GET', '/users');
console.log(response.status); // 200
console.log(response.data);   // Array of 5 user objects
```

## Available Data Types

| Type | Description | Options |
|------|-------------|--------|
| `uuid` | UUID v4 string | - |
| `name` | Full name | - |
| `firstName` | First name only | - |
| `lastName` | Last name only | - |
| `email` | Email address | - |
| `date` | ISO date string | `start`, `end` |
| `integer` | Random integer | `min`, `max` |
| `float` | Random float | `min`, `max`, `decimals` |
| `boolean` | true/false | - |
| `string` | Random string | `length` |
| `phone` | Phone number | - |
| `url` | URL string | - |
| `paragraph` | Lorem ipsum text | - |
| `choice` | Pick from options | `options` (array) |

## Running Examples

```bash
npm run example
```

## License

MIT