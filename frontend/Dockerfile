# Use an official Node.js image
FROM node:20-alpine AS node

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json /app
RUN npm install

# Expose port 3000 and start the app
EXPOSE 3000
CMD ["npm", "start"]