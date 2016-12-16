all: consent-id-service
consent-id-service:
	docker build -t consent-id-service .
	docker tag consent-id-service enettet/consent-id-service
push:
	docker push enettet/consent-id-service
