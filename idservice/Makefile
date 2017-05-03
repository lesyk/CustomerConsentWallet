all: consent-id-service
consent-id-service:
	rm -rf node_modules
	yarn install
	docker build -t enettet/consent-id-service:latest .
push:
	docker push enettet/consent-id-service:latest
