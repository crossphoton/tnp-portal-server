FROM node:16-alpine

WORKDIR /app
COPY . .
RUN yarn install
ENV PORT=80

HEALTHCHECK --interval=1m --timeout=1s \
	CMD wget http://localhost:$PORT/_health -q -O - > /dev/null 2>&1

CMD ["yarn", "start"]
EXPOSE $PORT
