all: consent-data-requester
consent-data-requester:
	rm -rf node_modules
	yarn install
	docker build -t consent-data-requester .
	docker tag consent-data-requester enettet/consent-data-requester
push:
	docker push enettet/consent-data-requester
