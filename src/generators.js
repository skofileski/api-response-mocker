/**
 * @fileoverview Built-in fake data generators for common types
 * @module generators
 */

/**
 * Generate a random UUID v4
 * @returns {string} A random UUID
 */
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate a random email address
 * @returns {string} A random email address
 */
function email() {
  const domains = ['example.com', 'test.org', 'mock.net', 'fake.io'];
  const name = firstName().toLowerCase();
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${name}${Math.floor(Math.random() * 1000)}@${domain}`;
}

/**
 * Generate a random first name
 * @returns {string} A random first name
 */
function firstName() {
  const names = [
    'Alice', 'Bob', 'Charlie', 'Diana', 'Edward',
    'Fiona', 'George', 'Hannah', 'Ivan', 'Julia',
  ];
  return names[Math.floor(Math.random() * names.length)];
}

/**
 * Generate a random last name
 * @returns {string} A random last name
 */
function lastName() {
  const names = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
    'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  ];
  return names[Math.floor(Math.random() * names.length)];
}

/**
 * Generate a random full name
 * @returns {string} A random full name
 */
function fullName() {
  return `${firstName()} ${lastName()}`;
}

/**
 * Generate a random date within range
 * @param {Object} options - Date generation options
 * @param {Date} [options.start] - Start date (default: 1 year ago)
 * @param {Date} [options.end] - End date (default: now)
 * @returns {string} An ISO date string
 */
function date(options = {}) {
  const end = options.end || new Date();
  const start = options.start || new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);
  const timestamp = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(timestamp).toISOString();
}

/**
 * Generate a random integer within range
 * @param {Object} options - Integer generation options
 * @param {number} [options.min=0] - Minimum value
 * @param {number} [options.max=1000] - Maximum value
 * @returns {number} A random integer
 */
function integer(options = {}) {
  const min = options.min ?? 0;
  const max = options.max ?? 1000;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random float within range
 * @param {Object} options - Float generation options
 * @param {number} [options.min=0] - Minimum value
 * @param {number} [options.max=1000] - Maximum value
 * @param {number} [options.decimals=2] - Number of decimal places
 * @returns {number} A random float
 */
function float(options = {}) {
  const min = options.min ?? 0;
  const max = options.max ?? 1000;
  const decimals = options.decimals ?? 2;
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

/**
 * Generate a random boolean
 * @param {Object} options - Boolean generation options
 * @param {number} [options.probability=0.5] - Probability of true
 * @returns {boolean} A random boolean
 */
function boolean(options = {}) {
  const probability = options.probability ?? 0.5;
  return Math.random() < probability;
}

/**
 * Generate a random phone number
 * @returns {string} A random phone number
 */
function phone() {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const prefix = Math.floor(Math.random() * 900) + 100;
  const lineNumber = Math.floor(Math.random() * 9000) + 1000;
  return `(${areaCode}) ${prefix}-${lineNumber}`;
}

/**
 * Generate random lorem ipsum text
 * @param {Object} options - Lorem generation options
 * @param {number} [options.words=10] - Number of words
 * @returns {string} Random lorem ipsum text
 */
function lorem(options = {}) {
  const wordList = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur',
    'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor',
    'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua',
  ];
  const count = options.words ?? 10;
  const words = [];
  for (let i = 0; i < count; i++) {
    words.push(wordList[Math.floor(Math.random() * wordList.length)]);
  }
  return words.join(' ');
}

/**
 * Pick a random item from an array
 * @param {Array} array - Array to pick from
 * @returns {*} A random item from the array
 */
function pick(array) {
  if (!Array.isArray(array) || array.length === 0) {
    return null;
  }
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate a random URL
 * @returns {string} A random URL
 */
function url() {
  const protocols = ['http', 'https'];
  const domains = ['example', 'test', 'mock', 'fake', 'sample'];
  const tlds = ['com', 'org', 'net', 'io'];
  const protocol = pick(protocols);
  const domain = pick(domains);
  const tld = pick(tlds);
  return `${protocol}://${domain}.${tld}`;
}

/**
 * All available generators
 * @type {Object.<string, Function>}
 */
const generators = {
  uuid,
  email,
  firstName,
  lastName,
  fullName,
  date,
  integer,
  float,
  boolean,
  phone,
  lorem,
  pick,
  url,
};

module.exports = { generators };
