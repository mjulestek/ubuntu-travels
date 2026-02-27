# Use nginx alpine for serving static files
# Nginx is a high-performance web server perfect for static content
# Alpine variant keeps the image small (~23MB)
FROM nginx:alpine

# Copy all frontend files to nginx's default serving directory
# Nginx serves files from /usr/share/nginx/html by default
COPY . /usr/share/nginx/html

# Copy custom nginx configuration if needed
# This line is optional - uncomment if you create nginx.conf
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (HTTP)
# This is the default port nginx listens on
EXPOSE 80

# Nginx runs as daemon by default, but Docker needs foreground process
# The default CMD in nginx:alpine already handles this correctly
# CMD ["nginx", "-g", "daemon off;"]
