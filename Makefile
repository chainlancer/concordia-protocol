service := clr-ea-services
version := 0.0.40
gcloud_proj_id := chainlancer-384913
cluster := chainlancer
gcr-image := gcr.io/${gcloud_proj_id}/${service}:${version}
root := $(abspath $(shell pwd))
port := 8080

list:
	@grep '^[^#[:space:]].*:' Makefile | grep -v ':=' | grep -v '^\.' | sed 's/:.*//g' | sed 's/://g' | sort

install:
	pip install bumpversion
	yarn install

# bumpversion

bumpversion-patch:
	bumpversion patch --allow-dirty

bumpversion-minor:
	bumpversion minor --allow-dirty

bumpversion-major:
	bumpversion major --allow-dirty

# ea

ea-build:
	yarn ea build

ea-dev:
	yarn ea dev

ea-test:
	yarn ea test

# sol

sol-compile:
	yarn --cwd sol hardhat compile

sol-operator-deploy-sepolia:
	cd sol && npx hardhat run scripts/operator/deploy.ts --network sepolia

sol-concordia-deploy-sepolia:
	cd sol && npx hardhat run scripts/concordia/deploy.ts --network sepolia

# lib

lib-test:
	yarn --cwd lib test

# docker

ea-docker-build:
	cd ea && docker build -t $(gcr-image) .

ea-docker-dev:
	make docker-build
	make docker-run

ea-docker-push:
	docker push $(gcr-image)

ea-docker-run:
	@docker run -itp $(port):$(port)  $(gcr-image)

# deploy

ea-deploy-sepolia:
	kubectl apply -f ea/deployments/sepolia/k8s/clr-ea-services.yml

ea-deploy-mainnet:
	# kubectl apply -f ea/deployments/mainnet/k8s/clr-ea-services.yml
	echo "TODO"

ea-build-push-deploy-sepolia:
	make bumpversion-patch
	make ea-build
	make ea-docker-build
	make ea-docker-push
	make ea-deploy-sepolia
