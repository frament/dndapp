# Stage 1: Build the application
FROM node:lts AS build
# Set the working directory
WORKDIR /app
# Copy package.json and the lock file
COPY package.json package-lock.json ./
# Install dependencies
RUN npm ci --quiet --force
# Copy the rest of the application code
COPY . .
# Build the Angular app in production mode
#RUN npx nx build client --configuration=production
# Stage 2: Serve the application from Nginx
#FROM nginx:alpine
# Copy the build output to replace the default nginx contents.
#COPY --from=build /app/dist/client /usr/share/nginx/html
# Expose port 80
#EXPOSE 80
# Start nginx
#CMD ["nginx", "-g", "daemon off;"]
