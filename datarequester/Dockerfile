FROM node:alpine

ADD package.json /opt/consent/datarequester/
ADD *.js /opt/consent/datarequester/
ADD node_modules /opt/consent/datarequester/node_modules

WORKDIR /opt/consent/datarequester

ENTRYPOINT ["node"]
CMD ["index.js", "aperture-science-inc@example.com"]
