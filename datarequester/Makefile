all: consent-data-requester
consent-data-requester:
	rm -rf node_modules
	yarn install
	docker build -t enettet/consent-data-requester:latest .
push:
	docker push enettet/consent-data-requester:latest
