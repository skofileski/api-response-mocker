/**
 * @module generators
 * @description Built-in fake data generators for common types
 */

/**
 * Generates a random UUID v4
 * @returns {string} A randomly generated UUID
 * @example
 * uuid() // => '550e8400-e29b-41d4-a716-446655440000'
 */
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generates a random first name
 * @returns {string} A randomly selected first name
 * @example
 * firstName() // => 'Alice'
 */
function firstName() {
  const names = [
    'Alice', 'Bob', 'Charlie', 'Diana', 'Edward',
    'Fiona', 'George', 'Hannah', 'Ivan', 'Julia',
    'Kevin', 'Laura', 'Michael', 'Nancy', 'Oscar',
  ];
  return names[Math.floor(Math.random() * names.length)];
}

/**
 * Generates a random last name
 * @returns {string} A randomly selected last name
 * @example
 * lastName() // => 'Smith'
 */
function lastName() {
  const names = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
    'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore',
  ];
  return names[Math.floor(Math.random() * names.length)];
}

/**
 * Generates a full name combining first and last name
 * @returns {string} A full name
 * @example
 * fullName() // => 'Alice Smith'
 */
function fullName() {
  return `${firstName()} ${lastName()}`;
}

/**
 * Generates a random email address
 * @returns {string} A randomly generated email address
 * @example
 * email() // => 'alice.smith42@example.com'
 */
function email() {
  const domains = ['example.com', 'test.org', 'mock.io', 'fake.net', 'demo.dev'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const name = `${firstName().toLowerCase()}.${lastName().toLowerCase()}`;
  const num = Math.floor(Math.random() * 100);
  return `${name}${num}@${domain}`;
}

/**
 * Generates a random date within the past year
 * @returns {string} An ISO 8601 formatted date string
 * @example
 * date() // => '2024-03-15T10:30:00.000Z'
 */
function date() {
  const now = Date.now();
  const pastYear = now - 365 * 24 * 60 * 60 * 1000;
  const randomTime = pastYear + Math.random() * (now - pastYear);
  return new Date(randomTime).toISOString();
}

/**
 * Generates a random integer within a specified range
 * @param {number} [min=0] - Minimum value (inclusive)
 * @param {number} [max=1000] - Maximum value (inclusive)
 * @returns {number} A random integer
 * @example
 * integer(1, 100) // => 42
 */
function integer(min = 0, max = 1000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random floating-point number
 * @param {number} [min=0] - Minimum value
 * @param {number} [max=1000] - Maximum value
 * @param {number} [decimals=2] - Number of decimal places
 * @returns {number} A random float
 * @example
 * float(0, 100, 2) // => 42.17
 */
function float(min = 0, max = 1000, decimals = 2) {
  const num = Math.random() * (max - min) + min;
  return parseFloat(num.toFixed(decimals));
}

/**
 * Generates a random boolean value
 * @returns {boolean} Either true or false
 * @example
 * boolean() // => true
 */
function boolean() {
  return Math.random() > 0.5;
}

/**
 * Generates a random phone number
 * @returns {string} A formatted phone number
 * @example
 * phone() // => '+1-555-123-4567'
 */
function phone() {
  const areaCode = integer(200, 999);
  const prefix = integer(100, 999);
  const line = integer(1000, 9999);
  return `+1-${areaCode}-${prefix}-${line}`;
}

/**
 * Generates a random URL
 * @returns {string} A randomly generated URL
 * @example
 * url() // => 'https://example.com/path/resource'
 */
function url() {
  const domains = ['example.com', 'test.org', 'mock.io', 'demo.dev'];
  const paths = ['api', 'users', 'posts', 'items', 'data', 'resource'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const path = paths[Math.floor(Math.random() * paths.length)];
  return `https://${domain}/${path}/${uuid().slice(0, 8)}`;
}

/**
 * Generates lorem ipsum text
 * @param {number} [words=10] - Number of words to generate
 * @returns {string} Lorem ipsum text
 * @example
 * lorem(5) // => 'Lorem ipsum dolor sit amet'
 */
function lorem(words = 10) {
  const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur',
    'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor',
    'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua',
  ];

  const result = [];
  for (let i = 0; i < words; i++) {
    result.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
  }

  const text = result.join(' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Collection of all available generators
 * @type {Object.<string, Function>}
 */
const generators = {
  uuid,
  firstName,
  lastName,
  fullName,
  email,
  date,
  integer,
  float,
  boolean,
  phone,
  url,
  lorem,
};

module.exports = { generators };
