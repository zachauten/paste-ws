#! /usr/bin/env deno run --allow-read --allow-write=./pastes --allow-net

import { Application, Context, encode, Hash, Router, Status } from "./deps.ts";

const app = new Application();
const router = new Router();
router
  .get("/self", async (context) => {
    context.response.body = "Running!";
  })
  .post("/", async (context) => {
    const body = context.request.body({ type: "form" });
    const paste = (await body.value).get("paste");
    if (!paste) context.throw(Status.BadRequest, "Request body empty");
    else {
      let hash = new Hash("sha1").digest(encode(paste)).hex();
      Deno.writeTextFile("pastes/" + hash, paste);
      context.response.status = Status.SeeOther;
      context.response.redirect(`paste/${hash}`);
    }
  });

app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (context: Context, next) => {
  await next();
  const rt = context.response.headers.get("X-Response-Time");
  console.log(`${context.request.method} ${context.request.url} - ${rt}`);
});

app.use(async (context: Context, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  context.response.headers.set("X-Response-Time", `${ms}ms`);
});

app.addEventListener("error", (event) => {
  console.error(event.error);
});

console.log("listening on port 8080");
await app.listen({ port: 8080 });
