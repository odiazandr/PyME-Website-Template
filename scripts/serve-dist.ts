import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, relative, resolve } from "node:path";
import { ROOT } from "./lib/validation.ts";

const dist = resolve(ROOT, "dist");
const port = Number(process.env.PYME_TEST_PORT ?? 4321);
const types: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};

const server = createServer((request, response) => {
  let pathname: string;
  try {
    pathname = decodeURIComponent(
      new URL(request.url ?? "/", "http://local").pathname,
    );
  } catch {
    response.writeHead(400).end("Bad request");
    return;
  }

  const requested = resolve(dist, `.${pathname}`);
  const escaped = relative(dist, requested);
  if (escaped.startsWith("..")) {
    response.writeHead(400).end("Bad request");
    return;
  }

  let file = requested;
  if (existsSync(file) && statSync(file).isDirectory())
    file = resolve(file, "index.html");
  let status = 200;
  if (!existsSync(file) || !statSync(file).isFile()) {
    file = resolve(dist, "404.html");
    status = 404;
  }
  response.writeHead(status, {
    "Content-Type": types[extname(file)] ?? "application/octet-stream",
  });
  createReadStream(file).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`TEST SERVER: http://127.0.0.1:${port}`);
});

const close = () => server.close(() => process.exit(0));
process.on("SIGINT", close);
process.on("SIGTERM", close);
