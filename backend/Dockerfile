FROM node:22-bookworm-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install --production

# Bundle app source
COPY . .

# Expose port (default in server.js is 5000)
EXPOSE 5000

CMD [ "npm", "start" ]
