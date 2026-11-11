# syntax=docker/dockerfile:1
FROM node:22-slim
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund
COPY . .
RUN mkdir -p /data && chown -R node:node /app /data
# entrypoint 以 root 啟動：先修好 /data 擁有權（Synology 上 bind mount 常是
# root 擁有，否則 node 寫不進 app.db 會 SQLITE_CANTOPEN 崩潰），再降權為
# node 執行 app。不可在這裡寫 USER node，否則 entrypoint 無法 chown。
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENV NODE_ENV=production PORT=3000 DATA_DIR=/data
EXPOSE 3000
VOLUME ["/data"]
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "server.js"]
