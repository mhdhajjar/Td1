const { Pact } = require('@pact-foundation/pact');
const path = require('path');
const http = require('http');
const { handleRoot, handleInfo, requestHandler } = require('./SystemInformations');
const si = require('systeminformation');

const provider = new Pact({
  consumer: 'SystemInfoConsumer',
  provider: 'SystemInfoProvider',
  port: 1234,
  log: path.resolve(process.cwd(), 'logs', 'pact.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'INFO',
});

describe('Pact with SystemInfo API', () => {
  beforeAll(() => provider.setup()); // Démarrer le serveur Pact

  afterEach(() => provider.verify()); // Vérifier les interactions définies après chaque test

  afterAll(() => provider.finalize()); // Arrêter le serveur Pact

  describe('GET /', () => {
    beforeEach(() => {
      provider.addInteraction({
        uponReceiving: 'a request for the root route',
        withRequest: {
          method: 'GET',
          path: '/',
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: {
            message: 'Welcome to the System Information API!',
          },
        },
      });
    });

    it('should respond with a welcome message', async () => {
      const req = http.request({
        hostname: 'localhost',
        port: 1234,
        path: '/',
        method: 'GET',
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          expect(JSON.parse(data)).toEqual({
            message: 'Welcome to the System Information API!',
          });
        });
      });
      req.end();
    });
  });

  describe('GET /info', () => {
    beforeEach(() => {
      provider.addInteraction({
        uponReceiving: 'a request for system information',
        withRequest: {
          method: 'GET',
          path: '/info',
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: {
            cpu: {
              brand: 'Intel',
              speed: '3.5 GHz',
            },
            memory: {
              total: 16 * 1024 * 1024 * 1024,
            },
            os: {
              platform: 'linux',
              version: '5.4',
            },
          },
        },
      });
    });

    it('should respond with system information', async () => {
      // Simuler les réponses des fonctions systeminformation
      si.cpu.mockResolvedValue({ brand: 'Intel', speed: '3.5 GHz' });
      si.mem.mockResolvedValue({ total: 16 * 1024 * 1024 * 1024 });
      si.osInfo.mockResolvedValue({ platform: 'linux', version: '5.4' });

      const req = http.request({
        hostname: 'localhost',
        port: 1234,
        path: '/info',
        method: 'GET',
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          expect(JSON.parse(data)).toEqual({
            cpu: {
              brand: 'Intel',
              speed: '3.5 GHz',
            },
            memory: {
              total: 16 * 1024 * 1024 * 1024,
            },
            os: {
              platform: 'linux',
              version: '5.4',
            },
          });
        });
      });
      req.end();
    });
  });

  describe('GET /unknown', () => {
    beforeEach(() => {
      provider.addInteraction({
        uponReceiving: 'a request for an unknown route',
        withRequest: {
          method: 'GET',
          path: '/unknown',
        },
        willRespondWith: {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
          body: {
            error: 'Not Found',
          },
        },
      });
    });

    it('should respond with 404 for unknown routes', async () => {
      const req = http.request({
        hostname: 'localhost',
        port: 1234,
        path: '/unknown',
        method: 'GET',
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          expect(JSON.parse(data)).toEqual({
            error: 'Not Found',
          });
        });
      });
      req.end();
    });
  });
});
