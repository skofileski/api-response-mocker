/**
 * Built-in fake data generators for common data types
 */
export class FakeDataGenerator {
	constructor() {
		this.generators = {
			uuid: () => this._uuid(),
			name: () => this._randomFrom(FIRST_NAMES) + ' ' + this._randomFrom(LAST_NAMES),
			firstName: () => this._randomFrom(FIRST_NAMES),
			lastName: () => this._randomFrom(LAST_NAMES),
			email: () => this._email(),
			date: (opts) => this._date(opts),
			integer: (opts) => this._integer(opts),
			float: (opts) => this._float(opts),
			boolean: () => Math.random() > 0.5,
			string: (opts) => this._string(opts),
			phone: () => this._phone(),
			url: () => `https://${this._randomFrom(DOMAINS)}/${this._randomString(8)}`,
			paragraph: () => this._randomFrom(PARAGRAPHS),
			choice: (opts) => this._randomFrom(opts.options || [])
		};
	}

	/**
	 * Generate a value based on type
	 * @param {string} type - Data type to generate
	 * @param {object} options - Generation options
	 * @returns {*} Generated value
	 */
	generate(type, options = {}) {
		const generator = this.generators[type];
		if (!generator) {
			return `[unknown:${type}]`;
		}
		return generator(options);
	}

	/**
	 * Register a custom generator
	 * @param {string} name - Generator name
	 * @param {function} fn - Generator function
	 */
	register(name, fn) {
		this.generators[name] = fn;
	}

	_uuid() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
			const r = Math.random() * 16 | 0;
			const v = c === 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

	_email() {
		const name = this._randomFrom(FIRST_NAMES).toLowerCase();
		const num = Math.floor(Math.random() * 100);
		return `${name}${num}@${this._randomFrom(DOMAINS)}`;
	}

	_date(opts = {}) {
		const start = opts.start ? new Date(opts.start) : new Date('2020-01-01');
		const end = opts.end ? new Date(opts.end) : new Date();
		const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
		return date.toISOString();
	}

	_integer(opts = {}) {
		const min = opts.min ?? 0;
		const max = opts.max ?? 1000;
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	_float(opts = {}) {
		const min = opts.min ?? 0;
		const max = opts.max ?? 100;
		const decimals = opts.decimals ?? 2;
		return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
	}

	_string(opts = {}) {
		const length = opts.length ?? 10;
		return this._randomString(length);
	}

	_phone() {
		const area = Math.floor(Math.random() * 900) + 100;
		const prefix = Math.floor(Math.random() * 900) + 100;
		const line = Math.floor(Math.random() * 9000) + 1000;
		return `(${area}) ${prefix}-${line}`;
	}

	_randomString(length) {
		const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
		return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
	}

	_randomFrom(array) {
		return array[Math.floor(Math.random() * array.length)];
	}
}

// Sample data pools
const FIRST_NAMES = ['James', 'Emma', 'Oliver', 'Sophia', 'William', 'Ava', 'Benjamin', 'Isabella', 'Lucas', 'Mia'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const DOMAINS = ['example.com', 'test.org', 'demo.net', 'sample.io', 'mock.dev'];
const PARAGRAPHS = [
	'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
	'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
	'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
	'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.'
];