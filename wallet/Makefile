all: consent-docker
clean:
	rm -rf node_modules
	rm -rf bower_components
	rm -rf dist
consent-wallet:
	npm install
	node_modules/.bin/bower install
	node_modules/.bin/ember build --environment=production
consent-docker: clean consent-wallet
	docker build -t consent-wallet .
	docker tag consent-wallet enettet/consent-wallet
push:
	docker push enettet/consent-wallet
