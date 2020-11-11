FROM docker.pkg.github.com/zachauten/docker-deno/deno:1.2.3

COPY . .
RUN deno cache deps.ts
RUN deno info
RUN mkdir pastes

CMD ["run", "--allow-net", "--allow-read", "--allow-write=./pastes", "app.ts"]
EXPOSE 8080

