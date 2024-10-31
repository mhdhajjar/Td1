import { createServer } from 'http';
import { requestHandler } from './SystemInformations'; // Importer le gestionnaire de requêtes

// Définir le port pour le serveur
const port = 3000;

// Créer et démarrer le serveur HTTP
const server = createServer(requestHandler);

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
