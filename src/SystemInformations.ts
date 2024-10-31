import * as si from 'systeminformation';
import { IncomingMessage, ServerResponse } from 'http';

export const handleRoot = (res: ServerResponse): void => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({ message: 'Welcome to the System Information API!' }),
  );
};

export const handleInfo = async (res: ServerResponse): Promise<void> => {
  try {
    const cpuInfo = await si.cpu();
    const memInfo = await si.mem();
    const osInfo = await si.osInfo();

    const systemInfo = {
      cpu: cpuInfo,
      memory: memInfo,
      os: osInfo,
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(systemInfo));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unable to retrieve system information' }));
  }
};

export const requestHandler = async (
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> => {
  if (req.method === 'GET') {
    if (req.url === '/') {
      handleRoot(res);
    } else if (req.url === '/info') {
      await handleInfo(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found' }));
    }
  } else {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }
};
