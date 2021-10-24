# syntax=docker/dockerfile:1
FROM docker.io/node:16-alpine AS build-env

# Install dependencies first, as they change less ofteh => better caching
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Copy actual code into the image.
COPY . .

FROM docker.io/node:16-alpine
ENV NODE_ENV production

COPY --from=build-env /app /app
WORKDIR /app
CMD ["index.js"]