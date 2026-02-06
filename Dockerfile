FROM node:22-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with cache mount
RUN --mount=type=cache,target=/root/.npm \
    npm install

# Copy rest of the application
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
