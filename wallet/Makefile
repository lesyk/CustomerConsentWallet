all: consent-docker
consent-wallet:
	npm install
	node_modules/.bin/bower install
	node_modules/.bin/ember build --environment=production
consent-docker: consent-wallet
	docker build -t consent-wallet .
	docker tag consent-wallet enettet/consent-wallet
push:
	docker push enettet/consent-wallet
