import { createServer } from 'http';
import { requestHandler } from './SystemInformations';

const port = 3000;

const server = createServer(requestHandler);

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
