# Lancer Solidity Contracts
Lancer is a decentralized protocol leveraging blockchain technology to enable trustless atomic swaps of digital work between workers and clients.

## Overview

_a high level overview of Lancer's architecture_

### How?

The freelancer (proprietor) completes the work and creates an encrypted work bundle (W) by combining the decryption key (k), client's wallet public key (p), and the work bundle (w). The encrypted work bundle is then uploaded to the InterPlanetary File System (IPFS).

Once the client pays the contract in full, the freelancer provides the contract with the decryption key (k).

The smart contract calls a Chainlink External Adapter (EA) to fetch the encrypted work bundle (W) from IPFS.

The Chainlink EA uses the decryption key (k) to unwrap the encrypted work bundle (W) and obtain the original work package (w_p).

The Chainlink EA then hashes the work package (w_p) using the SHA3-256 algorithm and returns the result (H(w_p)) to the smart contract.

The smart contract compares the work agreement checksum (c) with the hashed work package (H(w_p)). If the two values match, the key is accepted, and the agreement is marked as "paid."

The client can decrypt the encrypted work bundle (W) using the decryption key (k) and their wallet public key (p) to obtain the completed work (w).

This process ensures the protection of both parties, with payment released only when the work is completed as agreed upon. The integration with Chainlink allows the Lancer protocol to securely and reliably fetch and process off-chain data, further enhancing its functionality and security.

**or as notation**

1. W = E(k, w⊕p)
2. Client ⟶ Payment ⟶ Contract
3. Proprietor ⟶ k ⟶ Contract
4. Contract ⟶ Chainlink EA ⟶ W (from IPFS)
5. w_p = D(k, W)
6. H(w_p) =? c
7. If H(w_p) = c, mark Agreement as "paid"
8. w = w_p⊕p

**where:**

- W represents the encrypted work bundle
- E is the encryption function
- k is the decryption key
- w is the work bundle
- p is the client's wallet public key
- ⊕ represents the XOR operation
- D is the decryption function
- w_p is the work package containing the original work and the client's public key
- H is the SHA3-256 hash function
- c is the work agreement checksum

## Development

_all of our testing will be done on the sepolia testnet since it is cumbersome to test chainlink functionality locally_

### Contracts

the following contracts must be deployed:

- [Operator](#operator)
- [Lancer](#lancer)

#### Operator

_An Operator contract is required to securely and efficiently manage communication between a Chainlink external adapter and the Chainlink node. It defines rules for job management, payment, and security, ensuring the integrity of the network._

```bash
# deploy operator contract
$ npx hardhat run scripts/operator/deploy.ts --network sepolia

# set authorized senders (TODO)
$ npx hardhat operatorSetAuthorizedSenders --network sepolia
```

#### Lancer

_The Lancer contract facilitates the creation, payment, approval, and updates of work agreements._

```bash
# deploy lancer contract
$ npx hardhat scripts/lancer/deploy.ts --network sepolia

# create work agreement
$ npx hardhat lancerCreateWorkAgreement --cid IPFS_CID --checksum CHECKSUM --network sepolia

# pay for work agreement
$ npx hardhat lancerPayWorkAgreement --wid WORK_AGREEMENT_ID --network sepolia

# update decryption key for work agreement
$ npx hardhat lancerUpdateDecryptionKey --network sepolia
```

## Chainlink

A Chainlink external adapter is necessary for the [encryption process](#overview).

### Deployment

in order to integrate with Chainlink we need to deploy some services:

- [Chainlink Node](#chainlink-node)
- [PostgreSQL](#postgresql)
- [External Adapter](#external-adapter)

#### Chainlink Node

_A Chainlink external adapter needs a Chainlink node to validate and process the data retrieved by the adapter. The node also handles job management and execution, which the adapter cannot perform alone._

##### Deployment

```bash
# deploy sepolia chainlink node
$ kubectl apply -f deployments/sepolia/k8s/clr-ea-node.yml
```

##### Interaction

```bash
# port forward
$ kubectl port-forward service/clr-ea-node 6688:6688
```

navigate to http://localhost:6688/ in browser and sign in with secrets from k8s

#### PostgreSQL

_Chainlink node uses a PostgreSQL database to store job metadata, configuration, security settings, and state information._

##### Deployment

https://bitnami.com/stack/postgresql/helm

##### Interaction

```bash
# get password from k8s secrets
$ export POSTGRES_PASSWORD=$(kubectl get secret --namespace default clr-ea-pg-postgresql -o jsonpath="{.data.postgres-password}" | base64 -d)

# connect to db
$ kubectl run clr-ea-pg-postgresql-client --rm --tty -i --restart='Never' --namespace default --image docker.io/bitnami/postgresql:15.2.0-debian-11-r26 --env="PGPASSWORD=$POSTGRES_PASSWORD" --command -- psql --host clr-ea-pg-postgresql -U postgres -d postgres -p 5432

# connect from outside cluster
$ kubectl port-forward --namespace default svc/clr-ea-pg-postgresql 5432:5432 & PGPASSWORD="$POSTGRES_PASSWORD" psql --host 127.0.0.1 -U postgres -d postgres -p 543
```

#### External Adapter

_the external adapter is an API service that fetches work bundles from IPFS, decodes them using a provided secret key, and finally returns a hash to the contract that can be used to compare against the work agreement's checksum_

##### Deployment

_ci/cd coming soon_

```bash
# build (ignore build error)
$ make ea-build

# bump version
$ make bumpversion-patch

# build image
$ make ea-docker-build

# push image to gcr
$ make ea-docker-push

# deploy ea service
$ make ea-deploy-sepolia
```

##### Interaction

```bash
# get service
$ kubectl get svc/clr-ea-services

# check health
$ curl http://<EXTERNAL-IP>:8080/health
```

**or using port forwarding**

```bash
# port forward
$ kubectl port-forward service/clr-ea-services 8080:8080

# check health
$ curl http://localhost:8080/health
```