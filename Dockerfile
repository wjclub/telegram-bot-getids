# syntax=docker/dockerfile:1
FROM docker.io/node:17-alpine AS build-env
ENV NODE_ENV production

# Install dependencies first, as they change less often => better caching
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Copy actual code into the image.
COPY . .

# Run the actual program
CMD ["index.js"]
