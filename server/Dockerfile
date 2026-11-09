# AST LAB — IaC: end-of-life base image, runs as root, secret baked into the image.
FROM node:14
ENV DB_PASSWORD=Sup3rS3cr3tPassw0rd!
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3001
CMD ["node", "index.js"]
