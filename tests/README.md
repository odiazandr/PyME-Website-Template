# Tests

The deterministic suites cover memory contracts, data schemas, source routing, structured-data serialization, hosting security, generated artifacts, and production-validator acceptance/rejection. Playwright covers critical journeys and Axe-assisted accessibility in desktop, mobile, and 320-pixel Chromium through `npm run test:browser`; `test:browser:cross` includes the configured WebKit project for supported hosts. Browser evidence is deliberately separate from `npm test` so missing browser runtimes are reported independently rather than misclassified as source failures.
