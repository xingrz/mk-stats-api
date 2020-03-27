FROM node:10.13-alpine

RUN mkdir /opt/app
WORKDIR /opt/app

ENV NODE_ENV=production \
    PORT=80

COPY package.json package-lock.json /opt/app/
RUN npm install

COPY . /opt/app/

EXPOSE ${PORT}

CMD ["npm", "start"]
