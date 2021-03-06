'use strict';

const assert = require('chai').assert;
const { startDriver, stopDriver } = require('../lib/webdriver');
const chromedriver = require('chromedriver');
const chrome = require('selenium-webdriver/chrome');

describe('startDriver', () => {
	let config, browser;
	beforeEach(() => {
		browser = 'chrome-headless';
		config = {
			get browser() {
				return browser;
			}
		};
	});

	afterEach(async () => {
		stopDriver(config);
		const service = chrome.getDefaultService();
		if (service.isRunning()) {
			await service.stop();

			// An unfortunately hacky way to clean up
			// the service. Stop will shut it down,
			// but it doesn't reset the local state
			service.address_ = null;
			chrome.setDefaultService(null);
		}
	});

	it('creates a driver', async () => {
		await startDriver(config);

		assert.isObject(config.driver);
		assert.isFunction(config.driver.manage);
	});

	xit('sets the config.browser as the browser', done => {
		browser = 'chrome';
		startDriver(config)
			.then(config => config.driver.getCapabilities())
			.then(capabilities => {
				assert.equal(capabilities.get('browserName'), browser);
			})
			.then(done, done);
	});

	it('sets the browser as chrome with chrome-headless', async () => {
		browser = 'chrome-headless';
		await startDriver(config);
		const capabilities = await config.driver.getCapabilities();

		assert.equal(capabilities.get('browserName'), 'chrome');
	});

	it('uses the chromedriver path with chrome-headless', async () => {
		browser = 'chrome-headless';
		await startDriver(config);
		const service = chrome.getDefaultService();

		assert.equal(service.executable_, chromedriver.path);
	});

	it('sets the --headless flag with chrome-headless', async () => {
		browser = 'chrome-headless';
		const { builder } = await startDriver(config);
		const capabilities = await builder.getCapabilities();
		const chromeOptions = capabilities.get('chromeOptions');

		assert.isObject(chromeOptions);
		assert.deepEqual(chromeOptions.args, ['--headless']);
	});
});

describe('stopDriver', () => {
	it('calls browser.quit', () => {
		let called = 0;
		stopDriver({
			browser: 'chrome-headless',
			driver: { quit: () => called++ }
		});
		assert.equal(called, 1);
	});
});
