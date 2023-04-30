# Chainlancer Solidity Contracts
Chainlancer is a decentralized escrow platform that uses blockchain technology to facilitate secure and reliable digital work exchanges between freelancers and clients. 

## Deployment

### Postgres

```bash
# get password from k8s secrets
$ export POSTGRES_PASSWORD=$(kubectl get secret --namespace default clr-ea-pg-postgresql -o jsonpath="{.data.postgres-password}" | base64 -d)

# connect to db
$ kubectl run clr-ea-pg-postgresql-client --rm --tty -i --restart='Never' --namespace default --image docker.io/bitnami/postgresql:15.2.0-debian-11-r26 --env="PGPASSWORD=$POSTGRES_PASSWORD" --command -- psql --host clr-ea-pg-postgresql -U postgres -d postgres -p 5432

# connect from outside cluster
$ kubectl port-forward --namespace default svc/clr-ea-pg-postgresql 5432:5432 & PGPASSWORD="$POSTGRES_PASSWORD" psql --host 127.0.0.1 -U postgres -d postgres -p 543
```