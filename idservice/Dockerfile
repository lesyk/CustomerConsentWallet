FROM node:alpine

ADD package.json /idservice/
ADD *.js /idservice/

RUN \
  apk add --update git && \
  cd /idservice && \
  npm install && \
  apk del git

WORKDIR /idservice
ENTRYPOINT ["node"]
CMD ["index.js"]
