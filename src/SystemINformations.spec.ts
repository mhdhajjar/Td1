import * as si from 'systeminformation';
import { IncomingMessage, ServerResponse } from 'http';
import { handleRoot, handleInfo, requestHandler } from './SystemInformations'; // Replace 'yourModule' with the actual module name

// Mocking the systeminformation module
jest.mock('systeminformation');

describe('API Handler Tests', () => {
  let res: ServerResponse;
  let writeHeadMock: jest.Mock;
  let endMock: jest.Mock;

  beforeEach(() => {
    // Create a mock response object
    writeHeadMock = jest.fn();
    endMock = jest.fn();
    res = {
      writeHead: writeHeadMock,
      end: endMock,
    } as unknown as ServerResponse; // Type assertion to mimic ServerResponse
  });

  describe('handleRoot', () => {
    it('should respond with a welcome message', () => {
      handleRoot(res);

      expect(writeHeadMock).toHaveBeenCalledWith(200, {
        'Content-Type': 'application/json',
      });
      expect(endMock).toHaveBeenCalledWith(
        JSON.stringify({ message: 'Welcome to the System Information API!' }),
      );
    });
  });

  describe('handleInfo', () => {
    it('should respond with system information', async () => {
      // Mocking the systeminformation library's methods
      (si.cpu as jest.Mock).mockResolvedValue({
        brand: 'Intel',
        speed: '3.5 GHz',
      });
      (si.mem as jest.Mock).mockResolvedValue({
        total: 16 * 1024 * 1024 * 1024,
      }); // 16 GB in bytes
      (si.osInfo as jest.Mock).mockResolvedValue({
        platform: 'linux',
        distro: 'Ubuntu',
      });

      await handleInfo(res);

      expect(writeHeadMock).toHaveBeenCalledWith(200, {
        'Content-Type': 'application/json',
      });
      expect(endMock).toHaveBeenCalledWith(
        JSON.stringify({
          cpu: { brand: 'Intel', speed: '3.5 GHz' },
          memory: { total: 16 * 1024 * 1024 * 1024 },
          os: { platform: 'linux', distro: 'Ubuntu' },
        }),
      );
    });

    it('should respond with an error if system information retrieval fails', async () => {
      // Mocking a failure in system information retrieval
      (si.cpu as jest.Mock).mockRejectedValue(
        new Error('Error retrieving CPU info'),
      );

      await handleInfo(res);

      expect(writeHeadMock).toHaveBeenCalledWith(500, {
        'Content-Type': 'application/json',
      });
      expect(endMock).toHaveBeenCalledWith(
        JSON.stringify({ error: 'Unable to retrieve system information' }),
      );
    });
  });

  describe('requestHandler', () => {
    it('should handle GET requests to root', async () => {
      const req = { method: 'GET', url: '/' } as IncomingMessage;
      await requestHandler(req, res);

      expect(writeHeadMock).toHaveBeenCalledWith(200, {
        'Content-Type': 'application/json',
      });
      expect(endMock).toHaveBeenCalledWith(
        JSON.stringify({ message: 'Welcome to the System Information API!' }),
      );
    });

    it('should handle GET requests to /info', async () => {
      const req = { method: 'GET', url: '/info' } as IncomingMessage;
      // Mocking the system information functions
      (si.cpu as jest.Mock).mockResolvedValue({
        brand: 'Intel',
        speed: '3.5 GHz',
      });
      (si.mem as jest.Mock).mockResolvedValue({
        total: 16 * 1024 * 1024 * 1024,
      });
      (si.osInfo as jest.Mock).mockResolvedValue({
        platform: 'linux',
        distro: 'Ubuntu',
      });

      await requestHandler(req, res);

      expect(writeHeadMock).toHaveBeenCalledWith(200, {
        'Content-Type': 'application/json',
      });
      expect(endMock).toHaveBeenCalledWith(
        JSON.stringify({
          cpu: { brand: 'Intel', speed: '3.5 GHz' },
          memory: { total: 16 * 1024 * 1024 * 1024 },
          os: { platform: 'linux', distro: 'Ubuntu' },
        }),
      );
    });

    it('should return 404 for unknown paths', async () => {
      const req = { method: 'GET', url: '/unknown' } as IncomingMessage;
      await requestHandler(req, res);

      expect(writeHeadMock).toHaveBeenCalledWith(404, {
        'Content-Type': 'application/json',
      });
      expect(endMock).toHaveBeenCalledWith(
        JSON.stringify({ error: 'Not Found' }),
      );
    });

    it('should return 405 for unsupported methods', async () => {
      const req = { method: 'POST', url: '/' } as IncomingMessage;
      await requestHandler(req, res);

      expect(writeHeadMock).toHaveBeenCalledWith(405, {
        'Content-Type': 'application/json',
      });
      expect(endMock).toHaveBeenCalledWith(
        JSON.stringify({ error: 'Method Not Allowed' }),
      );
    });
  });
});
