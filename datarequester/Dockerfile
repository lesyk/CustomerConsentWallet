FROM node:alpine

ADD package.json /opt/consent/datarequester/
ADD *.js /opt/consent/datarequester/
ADD *.sol /opt/consent/datarequester/
ADD node_modules /opt/consent/datarequester/node_modules

WORKDIR /opt/consent/datarequester

ENTRYPOINT ["node"]
CMD ["index.js", "aperture-science-inc@example.com", "SecretPassword1", "0x368535A22837bcFAa08c271b3f078e7741d3f797"]
