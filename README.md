Cerebro
------------
[![Docker Pulls](https://img.shields.io/docker/pulls/lmenezes/cerebro.svg)](https://hub.docker.com/r/lmenezes/cerebro)
![build](https://github.com/lmenezes/cerebro/workflows/build/badge.svg?branch=master)

cerebro is an open source (MIT License) elasticsearch web admin tool built using Scala, Play Framework, AngularJS and Bootstrap.

Compatible with Elasticsearch 7.x.

### Docker (recommended)

Build and run with Docker:

```sh
docker compose up -d
```

This starts Cerebro on [http://localhost:9000](http://localhost:9000) alongside an Elasticsearch 7.17.x instance on port 9200.

To build the image standalone:

```sh
docker build -t cerebro .
docker run -p 9000:9000 cerebro
```

Pre-built images are also available on [Docker Hub](https://hub.docker.com/r/lmenezes/cerebro/) and [GitHub Container Registry](https://github.com/lmenezes/cerebro/pkgs/container/cerebro).

### Running tests

All tests run inside Docker:

```sh
# Run backend (sbt) and frontend (karma) tests
docker compose -f docker-compose.test.yml run --rm backend-test
docker compose -f docker-compose.test.yml run --rm frontend-test

# Tear down
docker compose -f docker-compose.test.yml down -v
```

Backend tests use an Elasticsearch 7.17.x service container that starts automatically.

### Configuration

#### HTTP server address and port

You can run cerebro listening on a different port (defaults to 9000):

```sh
docker run -p 1234:1234 -e CEREBRO_PORT=1234 cerebro
```

#### LDAP config

LDAP can be configured using environment variables. Pass a file with all the env vars:

```bash
# Set it to ldap to activate ldap authorization
AUTH_TYPE=ldap

# Your ldap url
LDAP_URL=ldap://example.com:389

LDAP_BASE_DN=OU=users,DC=example,DC=com

# Usually method should be "simple" otherwise, set it to the SASL mechanisms
LDAP_METHOD=simple

# user-template executes a string.format() operation where
# username is passed in first, followed by base-dn. Some examples
#  - %s => leave user untouched
#  - %s@domain.com => append "@domain.com" to username
#  - uid=%s,%s => usual case of OpenLDAP
LDAP_USER_TEMPLATE=%s@example.com

# User identifier that can perform searches
LDAP_BIND_DN=admin@example.com
LDAP_BIND_PWD=adminpass

# Group membership settings (optional)

# If left unset LDAP_BASE_DN will be used
# LDAP_GROUP_BASE_DN=OU=users,DC=example,DC=com

# Attribute that represent the user, for example uid or mail
# LDAP_USER_ATTR=mail

# If left unset LDAP_USER_TEMPLATE will be used
# LDAP_USER_ATTR_TEMPLATE=%s

# Filter that tests membership of the group
# AD example => memberOf=CN=mygroup,ou=ouofthegroup,DC=domain,DC=com
# OpenLDAP example => CN=mygroup
# LDAP_GROUP=memberOf=CN=mygroup,ou=ouofthegroup,DC=domain,DC=com
```

```bash
docker run -p 9000:9000 --env-file env-ldap cerebro
```

There are configuration examples in the [examples folder](./examples).

#### Other settings

Other settings are exposed through the **conf/application.conf** file. Mount a custom config:

```sh
docker run -p 9000:9000 -v /path/to/application.conf:/opt/cerebro/conf/application.conf cerebro
```

Or pass JVM system properties:

```sh
docker run -p 9000:9000 cerebro -Dconfig.file=/opt/cerebro/conf/alternate.conf
```
