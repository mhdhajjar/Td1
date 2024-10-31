# # Utiliser une image Alpine avec Node.js
# FROM alpine:3.15

# # Installer Node.js et npm
# RUN apk add --no-cache nodejs npm

# # Définir le répertoire de travail
# WORKDIR /app

# # Ajouter un utilisateur non root pour des raisons de sécurité
# RUN addgroup -S node && adduser -S node -G node

# # Copier les fichiers package.json et package-lock.json dans le conteneur
# COPY package*.json ./

# # Installer les dépendances du projet
# RUN npm install

# # Copier tout le code source de l'application
# COPY --chown=node:node ./src /app/src
# COPY --chown=node:node tsconfig.json ./

# # Compiler le projet TypeScript
# RUN npm run build

# # Passer à l'utilisateur non root
# USER node

# # Lancer l'application (après compilation)
# CMD ["npm", "start"]





FROM alpine:3.15 as builder

RUN apk add --no-cache nodejs npm

WORKDIR /app

COPY package*.json ./

# Run npm install to generate node_modules
RUN npm install

# Now copy node_modules to prod_node_modules
RUN cp -R node_modules prod_node_modules

COPY ./src /app/src
COPY tsconfig.json ./

RUN npm run build

# Final Stage
FROM alpine:3.15 as runner

RUN apk add --no-cache nodejs

WORKDIR /app

COPY --from=builder --chown=node:node /app/dist /app/dist
COPY --from=builder --chown=node:node package*.json ./
COPY --from=builder /app/prod_node_modules ./node_modules

RUN addgroup -S node && adduser -S node -G node

USER node

CMD ["node", "dist/index.js"]

