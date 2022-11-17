# EbisusBay Web

## Run docker images locally

Note: Instructions only for MacOS.

```
cd /<pathtorepository>/eb_web
```

Build and run:

```
docker-compose -f docker-compose.yml up --build --remove-orphans
```

Note: Use "-d" to run containers in the background

Verify stack:

```
% docker ps
CONTAINER ID   IMAGE                                   COMMAND                  CREATED         STATUS                   PORTS                  NAMES
a3262fec588f   ebisusbay-frontend_ebisusbay-frontend   "/docker-entrypoint.…"   9 seconds ago   Up 8 seconds (healthy)   0.0.0.0:8080->80/tcp   ebisusbay-frontend
```

Delete stack:

```
docker-compose down
```

### Connect to individual container via "SSH"

```
docker exec -it --user root ebisusbay-frontend /bin/bash
```

### Allow app to be accessed by external devices on the local network

Open up package.json and edit the start script to include `--host 0.0.0.0`. e.g.:

```
"start": "react-scripts start --host 0.0.0.0",
```

### Enable HTTPS on localhost

Modify the start command to the following:

```
set HTTPS=true&&npm start
```

Additional info can be found here: https://create-react-app.dev/docs/using-https-in-development/

### Useful commands

Delete:

- all stopped containers
- all networks not used by at least one container
- all dangling images
- all dangling build cache

```
docker system prune
```

Delete:

- Same as above + all volumes not used by at least one container

```
docker system prune --volumes
```
