all: consent-data-owner
consent-data-owner:
	rm -rf node_modules
	yarn install
	docker build -t enettet/consent-data-owner:latest .
push:
	docker push enettet/consent-data-owner:latest
