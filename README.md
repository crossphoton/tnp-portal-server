# TNP Portal Backend and REST API

Portal for TNP Cell of IIIT Raichur.

## Structure

- api - REST API
- src
  - database - interaction with db
  - user - new user and session management

## Local Development

### REQUIREMENTS
(RAW)
- NodeJS
- [dotenv](https://www.npmjs.com/package/dotenv-cli)
- Postgres
- Redis

(Docker and Docker Compose)
- [Docker](https://www.docker.com/)
- Docker Compose

> Note: use docker for database (or ease)

### Setting Up (RAW)

1. Clone repo
2. Install packages ```yarn install```
3. Create database `tnp_portal` in postgres (Use psql or anything of choice)
4. Enable expiry notifications in redis
   - `config set notify-keyspace-events Ex`
5. Setup `.env`
   - correct db url
   - correct redis url
   - enable database sync (Set `TNP_PORTAL_SYNC_DB` to `true`; at least for first time)
6. Start development server using `yarn dev`

### Setting Up (Docker)

> With current configs, image should be built every time on changes.

1. Clone repo
2. Run `docker-compose up -d`

> If there are changes in files build the image again using `docker-compose build`.