FROM node:alpine

ADD package.json /opt/consent/dataowner/
ADD *.js /opt/consent/dataowner/
ADD node_modules /opt/consent/dataowner/node_modules

WORKDIR /opt/consent/dataowner

ENTRYPOINT ["node"]
CMD ["index.js", "goliath-national-bank@example.com", "SecretPassword1"]
