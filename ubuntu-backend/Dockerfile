# 1. Choose the base image - like choosing which operating system to use
# node:18-alpine = Node.js version 18 on a tiny Linux (Alpine)
FROM node:18-alpine

# 2. Set the working directory - like "cd /app" 
# Everything happens in this folder from now on
WORKDIR /app

# 3. Copy package.json and package-lock.json
# Why first? So Docker can cache this step if packages don't change
COPY package*.json ./

# 4. Install npm packages
# npm ci = clean install (deletes old packages, installs fresh)
# --omit=dev = skip development tools (like nodemon, testing libraries)
RUN npm ci --omit=dev

# 5. Copy all your code files into the container
# This includes server.js, models/, routes/, etc.
COPY . .

# 6. Create folders for file uploads
# mkdir -p = make directory (and parent directories if needed)
RUN mkdir -p uploads/profiles uploads/tours

# 7. Document which port the app uses
# This doesn't open the port, just tells others "this app needs port 5000"
EXPOSE 5000

# 8. Set environment variable
# NODE_ENV=production makes Node.js run faster and more securely
ENV NODE_ENV=production

# 9. Switch from root user to regular user
# Why? Security! If someone hacks the app, they won't have admin powers
USER node

# 10. The command to run when container starts
# This starts your Express server
CMD ["node", "server.js"]
