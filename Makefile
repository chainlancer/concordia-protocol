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

