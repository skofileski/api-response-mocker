/**
 * Built-in fake data generators for common types
 */

const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const domains = ['example.com', 'test.org', 'demo.net', 'sample.io', 'mock.dev'];
const loremWords = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua'];

function randomItem(array) {
  if (!Array.isArray(array) || array.length === 0) {
    return null;
  }
  return array[Math.floor(Math.random() * array.length)];
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function firstName() {
  return randomItem(firstNames) || 'John';
}

function lastName() {
  return randomItem(lastNames) || 'Doe';
}

function fullName() {
  return `${firstName()} ${lastName()}`;
}

function email(domain) {
  const fn = firstName().toLowerCase();
  const ln = lastName().toLowerCase();
  const d = domain || randomItem(domains) || 'example.com';
  return `${fn}.${ln}@${d}`;
}

function integer(min = 0, max = 1000) {
  const minVal = typeof min === 'number' && !isNaN(min) ? Math.floor(min) : 0;
  const maxVal = typeof max === 'number' && !isNaN(max) ? Math.floor(max) : 1000;
  const actualMin = Math.min(minVal, maxVal);
  const actualMax = Math.max(minVal, maxVal);
  return Math.floor(Math.random() * (actualMax - actualMin + 1)) + actualMin;
}

function float(min = 0, max = 1000, decimals = 2) {
  const minVal = typeof min === 'number' && !isNaN(min) ? min : 0;
  const maxVal = typeof max === 'number' && !isNaN(max) ? max : 1000;
  const decVal = typeof decimals === 'number' && !isNaN(decimals) && decimals >= 0 ? decimals : 2;
  const actualMin = Math.min(minVal, maxVal);
  const actualMax = Math.max(minVal, maxVal);
  const value = Math.random() * (actualMax - actualMin) + actualMin;
  return parseFloat(value.toFixed(decVal));
}

function boolean() {
  return Math.random() > 0.5;
}

function date(startYear = 2020, endYear = 2024) {
  const start = typeof startYear === 'number' && !isNaN(startYear) ? startYear : 2020;
  const end = typeof endYear === 'number' && !isNaN(endYear) ? endYear : 2024;
  const actualStart = Math.min(start, end);
  const actualEnd = Math.max(start, end);
  const startDate = new Date(actualStart, 0, 1);
  const endDate = new Date(actualEnd, 11, 31);
  const timestamp = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
  return new Date(timestamp).toISOString().split('T')[0];
}

function datetime(startYear = 2020, endYear = 2024) {
  const start = typeof startYear === 'number' && !isNaN(startYear) ? startYear : 2020;
  const end = typeof endYear === 'number' && !isNaN(endYear) ? endYear : 2024;
  const actualStart = Math.min(start, end);
  const actualEnd = Math.max(start, end);
  const startDate = new Date(actualStart, 0, 1);
  const endDate = new Date(actualEnd, 11, 31);
  const timestamp = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
  return new Date(timestamp).toISOString();
}

function timestamp() {
  return Date.now();
}

function lorem(wordCount = 10) {
  const count = typeof wordCount === 'number' && !isNaN(wordCount) && wordCount > 0 ? wordCount : 10;
  const words = [];
  for (let i = 0; i < count; i++) {
    words.push(randomItem(loremWords) || 'lorem');
  }
  return words.join(' ');
}

function paragraph(sentenceCount = 3) {
  const count = typeof sentenceCount === 'number' && !isNaN(sentenceCount) && sentenceCount > 0 ? sentenceCount : 3;
  const sentences = [];
  for (let i = 0; i < count; i++) {
    const wordCount = integer(8, 15);
    let sentence = lorem(wordCount);
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
    sentences.push(sentence);
  }
  return sentences.join(' ');
}

function phone() {
  const areaCode = integer(200, 999);
  const prefix = integer(200, 999);
  const line = integer(1000, 9999);
  return `(${areaCode}) ${prefix}-${line}`;
}

function url(protocol = 'https') {
  const proto = typeof protocol === 'string' && protocol ? protocol : 'https';
  const domain = randomItem(domains) || 'example.com';
  const path = lorem(2).toLowerCase().replace(/\s+/g, '-');
  return `${proto}://${domain}/${path}`;
}

function pick(options) {
  if (!Array.isArray(options) || options.length === 0) {
    return null;
  }
  return randomItem(options);
}

function sequence(name = 'default') {
  if (!sequence.counters) {
    sequence.counters = {};
  }
  const key = String(name);
  if (!sequence.counters[key]) {
    sequence.counters[key] = 0;
  }
  return ++sequence.counters[key];
}

sequence.reset = function(name) {
  if (!sequence.counters) return;
  if (name) {
    delete sequence.counters[String(name)];
  } else {
    sequence.counters = {};
  }
};

module.exports = {
  uuid,
  firstName,
  lastName,
  fullName,
  email,
  integer,
  float,
  boolean,
  date,
  datetime,
  timestamp,
  lorem,
  paragraph,
  phone,
  url,
  pick,
  sequence,
  randomItem
};
