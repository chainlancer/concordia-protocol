service := clr-ea-services
version := 0.0.9
gcloud_proj_id := chainlancer-384913
cluster := chainlancer
gcr-image := gcr.io/${gcloud_proj_id}/${service}:${version}
root := $(abspath $(shell pwd))
port := 8080

list:
	@grep '^[^#[:space:]].*:' Makefile | grep -v ':=' | grep -v '^\.' | sed 's/:.*//g' | sed 's/://g' | sort

install-dependencies:
	pip install bumpversion
	npm install

# develop

build:
	tsc

dev:
	make build
	yarn start

# bumpversion

bumpversion-patch:
	bumpversion patch --allow-dirty

bumpversion-minor:
	bumpversion minor --allow-dirty

bumpversion-major:
	bumpversion major --allow-dirty

# docker

docker-build:
	docker build -t $(gcr-image) .

docker-dev:
	make docker-build
	make docker-run

docker-push:
	docker push $(gcr-image)

docker-run:
	@docker run -itp $(port):$(port)  $(gcr-image)

# kubernetes

k8s-deploy-sepolia:
	kubectl apply -f deployments/sepolia/k8s/clr-ea-services.yml

k8s-deploy-mainnet:
	# kubectl apply -f deployments/mainnet/k8s/clr-ea-services.yml
	echo "TODO"

k8s-build-push-deploy-sepolia:
	make bumpversion-patch
	make docker-build
	make docker-push
	make k8s-deploy-sepolia

# docker-compose

docker-compose-sepolia:
	cd docker/sepolia && docker-compose up

docker-compose-mainnet:
	echo "TODO"

deploy-operator-sepolia:
	npx hardhat run scripts/deploy-operator.ts --network sepolia

deploy-operator-mainnet:
	echo "TODO"

deploy-chainlancer-sepolia:
	npx hardhat run scripts/deploy-chainlancer.ts --network sepolia

deploy-chainlancer-mainnet:
	echo "TODO"

