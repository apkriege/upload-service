FROM node:20.0.0

WORKDIR /server

COPY package.json package-lock.json ./
RUN npm install

RUN mkdir coverage

COPY . .

RUN npm run build

EXPOSE 3002

CMD npm start

