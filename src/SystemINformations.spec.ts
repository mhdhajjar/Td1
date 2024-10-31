import { IncomingMessage, ServerResponse } from 'http';
import { handleRoot, handleInfo, requestHandler } from './SystemInformations'; 
import * as si from 'systeminformation';

jest.mock('systeminformation'); 

describe('System Information API', () => {
  let mockResponse: ServerResponse;
  let mockEnd: jest.Mock;

  beforeEach(() => {
    mockEnd = jest.fn();
    mockResponse = {
      writeHead: jest.fn(),
      end: mockEnd,
    } as unknown as ServerResponse;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleRoot', () => {
    it('should return a welcome message', () => {
      handleRoot(mockResponse);

      expect(mockResponse.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'application/json' });
      expect(mockEnd).toHaveBeenCalledWith(JSON.stringify({ message: 'Welcome to the System Information API!' }));
    });
  });

  describe('handleInfo', () => {
    it('should return system information', async () => {
      // Mock des fonctions de systeminformation
      (si.cpu as jest.Mock).mockResolvedValue({ brand: 'Intel', speed: '3.5 GHz' });
      (si.mem as jest.Mock).mockResolvedValue({ total: 16 * 1024 * 1024 * 1024 });
      (si.osInfo as jest.Mock).mockResolvedValue({ platform: 'linux', version: '5.4' });

      await handleInfo(mockResponse);

      expect(mockResponse.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'application/json' });
      expect(mockEnd).toHaveBeenCalledWith(
        JSON.stringify({
          cpu: { brand: 'Intel', speed: '3.5 GHz' },
          memory: { total: 16 * 1024 * 1024 * 1024 },
          os: { platform: 'linux', version: '5.4' },
        })
      );
    });

    it('should return an error when failing to retrieve system information', async () => {
      (si.cpu as jest.Mock).mockRejectedValue(new Error('Error fetching CPU info'));

      await handleInfo(mockResponse);

      expect(mockResponse.writeHead).toHaveBeenCalledWith(500, { 'Content-Type': 'application/json' });
      expect(mockEnd).toHaveBeenCalledWith(JSON.stringify({ error: 'Unable to retrieve system information' }));
    });
  });

  describe('requestHandler', () => {
    it('should handle root route', async () => {
      const req = { method: 'GET', url: '/' } as IncomingMessage;

      await requestHandler(req, mockResponse);

      expect(mockResponse.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'application/json' });
      expect(mockEnd).toHaveBeenCalledWith(JSON.stringify({ message: 'Welcome to the System Information API!' }));
    });

    it('should handle info route', async () => {
      const req = { method: 'GET', url: '/info' } as IncomingMessage;
      (si.cpu as jest.Mock).mockResolvedValue({ brand: 'Intel', speed: '3.5 GHz' });
      (si.mem as jest.Mock).mockResolvedValue({ total: 16 * 1024 * 1024 * 1024 });
      (si.osInfo as jest.Mock).mockResolvedValue({ platform: 'linux', version: '5.4' });

      await requestHandler(req, mockResponse);

      expect(mockResponse.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'application/json' });
      expect(mockEnd).toHaveBeenCalledWith(
        JSON.stringify({
          cpu: { brand: 'Intel', speed: '3.5 GHz' },
          memory: { total: 16 * 1024 * 1024 * 1024 },
          os: { platform: 'linux', version: '5.4' },
        })
      );
    });

    it('should return 404 for unknown routes', async () => {
      const req = { method: 'GET', url: '/unknown' } as IncomingMessage;

      await requestHandler(req, mockResponse);

      expect(mockResponse.writeHead).toHaveBeenCalledWith(404, { 'Content-Type': 'application/json' });
      expect(mockEnd).toHaveBeenCalledWith(JSON.stringify({ error: 'Not Found' }));
    });

    it('should return 405 for unsupported methods', async () => {
      const req = { method: 'POST', url: '/' } as IncomingMessage;

      await requestHandler(req, mockResponse);

      expect(mockResponse.writeHead).toHaveBeenCalledWith(405, { 'Content-Type': 'application/json' });
      expect(mockEnd).toHaveBeenCalledWith(JSON.stringify({ error: 'Method Not Allowed' }));
    });
  });
});
