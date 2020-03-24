FROM node:10.17.0 AS build-env
ADD . /app
WORKDIR /app
ENV NODE_ENV production

# Install dependencies, but stricter than `npm install`
RUN npm ci

# Skip fixing dev dependencies
RUN npm audit fix --only=prod

# Potentially remove unneeded decDependencies, might clas with package-lock.json
RUN npm prune --production


FROM gcr.io/distroless/nodejs
COPY --from=build-env /app /app
WORKDIR /app
CMD ["index.js"]
