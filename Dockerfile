# # Étape de construction
# FROM node:alpine AS builder

# # Chemin de travail
# WORKDIR /app

# # Copier les fichiers de dépendances
# COPY package*.json ./

# # Installer les dépendances
# RUN npm install

# # Copier le reste des fichiers de l'application
# COPY . .

# # Construire l'application (si nécessaire)
# RUN npm run build

# # Étape de production
# FROM alpine:3.15 AS runner

# # Chemin de travail
# WORKDIR /app

# # Copier uniquement les fichiers nécessaires depuis l'étape de build
# COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/package*.json ./

# # Installer uniquement les dépendances de production
# RUN apk add --no-cache nodejs npm && npm install --production

# # Commande d'exécution
# CMD ["npm", "start"]


# FROM alpine:3.20

# WORKDIR /usr/src/app

# RUN apk add --no-cache nodejs npm

# COPY package*.json ./

# RUN npm install

# COPY dist/ ./dist/

# RUN addgroup -S node && adduser -S node -G node

# RUN chown -R node:node /usr/src/app

# USER node

# RUN npm run build || echo "No build step defined"

# CMD ["node", "dist/index.js"]



FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build || echo "No build step defined"

FROM alpine:3.20 AS runner

RUN apk add --no-cache nodejs npm

WORKDIR /usr/src/app

RUN addgroup -S node && adduser -S node -G node

COPY --from=builder --chown=node:node /usr/src/app/dist /usr/src/app/dist
COPY --from=builder --chown=node:node /usr/src/app/package*.json /usr/src/app/

RUN npm install --only=production

USER node

EXPOSE 8000

CMD ["node", "dist/index.js"]


