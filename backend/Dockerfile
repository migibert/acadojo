# Use node:20-alpine as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application
RUN yarn build

# Expose port 3000
EXPOSE 3000

# Start the backend application
CMD ["node", "dist/main.js"]
