/**
 * @fileoverview Built-in fake data generators for common types
 * @module generators
 */

/**
 * Generates a random UUID v4
 * @returns {string} A random UUID
 * @example
 * uuid() // => '550e8400-e29b-41d4-a716-446655440000'
 */
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Chris', 'Amanda', 'Robert', 'Lisa'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Wilson'];
const domains = ['example.com', 'test.org', 'mock.io', 'fake.net', 'sample.co'];

/**
 * Generates a random first name
 * @returns {string} A random first name
 * @example
 * firstName() // => 'John'
 */
function firstName() {
  return firstNames[Math.floor(Math.random() * firstNames.length)];
}

/**
 * Generates a random last name
 * @returns {string} A random last name
 * @example
 * lastName() // => 'Smith'
 */
function lastName() {
  return lastNames[Math.floor(Math.random() * lastNames.length)];
}

/**
 * Generates a random full name
 * @returns {string} A random full name
 * @example
 * fullName() // => 'John Smith'
 */
function fullName() {
  return `${firstName()} ${lastName()}`;
}

/**
 * Generates a random email address
 * @returns {string} A random email address
 * @example
 * email() // => 'john.smith42@example.com'
 */
function email() {
  const first = firstName().toLowerCase();
  const last = lastName().toLowerCase();
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const num = Math.floor(Math.random() * 100);
  return `${first}.${last}${num}@${domain}`;
}

/**
 * Generates a random date within a range
 * @param {Date} [start=new Date(2020, 0, 1)] - Start date
 * @param {Date} [end=new Date()] - End date
 * @returns {Date} A random date between start and end
 * @example
 * date(new Date(2023, 0, 1), new Date(2023, 11, 31))
 */
function date(start = new Date(2020, 0, 1), end = new Date()) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Generates a random ISO date string
 * @returns {string} A random ISO date string
 * @example
 * isoDate() // => '2023-06-15T10:30:00.000Z'
 */
function isoDate() {
  return date().toISOString();
}

/**
 * Generates a random integer within a range
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
 * float(0, 100, 2) // => 42.57
 */
function float(min = 0, max = 1000, decimals = 2) {
  const num = Math.random() * (max - min) + min;
  return parseFloat(num.toFixed(decimals));
}

/**
 * Generates a random boolean
 * @param {number} [probability=0.5] - Probability of true (0-1)
 * @returns {boolean} A random boolean
 * @example
 * boolean(0.7) // => true (70% chance)
 */
function boolean(probability = 0.5) {
  return Math.random() < probability;
}

/**
 * Picks a random element from an array
 * @param {Array} arr - Array to pick from
 * @returns {*} A random element from the array
 * @example
 * oneOf(['apple', 'banana', 'cherry']) // => 'banana'
 */
function oneOf(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return null;
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generates a random phone number
 * @returns {string} A random phone number
 * @example
 * phone() // => '+1-555-123-4567'
 */
function phone() {
  const areaCode = integer(100, 999);
  const prefix = integer(100, 999);
  const line = integer(1000, 9999);
  return `+1-${areaCode}-${prefix}-${line}`;
}

/**
 * Generates Lorem Ipsum text
 * @param {number} [words=10] - Number of words to generate
 * @returns {string} Lorem ipsum text
 * @example
 * lorem(5) // => 'Lorem ipsum dolor sit amet'
 */
function lorem(words = 10) {
  const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur',
    'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor',
    'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua'
  ];
  const result = [];
  for (let i = 0; i < words; i++) {
    result.push(loremWords[i % loremWords.length]);
  }
  return result.join(' ');
}

/**
 * Generates a random URL
 * @returns {string} A random URL
 * @example
 * url() // => 'https://example.com/path/abc123'
 */
function url() {
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const path = Math.random().toString(36).substring(7);
  return `https://${domain}/path/${path}`;
}

/** @type {Object.<string, Function>} */
const generators = {
  uuid,
  firstName,
  lastName,
  fullName,
  email,
  date,
  isoDate,
  integer,
  float,
  boolean,
  oneOf,
  phone,
  lorem,
  url
};

module.exports = { generators };
