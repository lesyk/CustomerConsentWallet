FROM node:alpine

ADD package.json /dataowner/
ADD *.js /dataowner/

RUN \
  apk add --update git && \
  cd /dataowner && \
  npm install && \
  apk del git

WORKDIR /dataowner
ENTRYPOINT ["node"]
CMD ["index.js", "goliath-national-bank@example.com"]
