#Start with a lightweight Linux image that has node.js installed
FROM node:20-alpine

#Tell docker the folder 
WORKDIR /app

#Copy only package.json first
COPY package*.json ./

RUN npm install

# Copy the rest
COPY . .

#Prisma

RUN npx prisma generate

#Expose the port
EXPOSE 5000

#Command to start our server
CMD ["npm","run","dev"]
