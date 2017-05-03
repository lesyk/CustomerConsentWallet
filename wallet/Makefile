all: consent-docker
clean:
	rm -rf node_modules
	rm -rf bower_components
	rm -rf dist
consent-wallet:
	yarn install
	node_modules/.bin/bower install
	node_modules/.bin/ember build --environment=development
consent-docker: clean consent-wallet
	docker build -t nettet/consent-wallet:latest .
push:
	docker push enettet/consent-wallet:latest
