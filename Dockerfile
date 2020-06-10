FROM node:10.16.3
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
ENV PORT=8000
EXPOSE 8000
CMD node index.js