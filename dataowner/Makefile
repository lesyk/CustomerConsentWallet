all: consent-data-owner
consent-data-owner:
	docker build -t consent-data-owner .
	docker tag consent-data-owner enettet/consent-data-owner
push:
	docker push enettet/consent-data-owner
