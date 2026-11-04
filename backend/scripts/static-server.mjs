import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const root = resolve(process.cwd(), "out");
const mime = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

function resolveFile(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.(\/|\\|$))+/, "");
  const candidate = resolve(root, `.${sep}${clean}`);
  if (!candidate.startsWith(`${root}${sep}`) && candidate !== root) return null;
  const options = candidate.endsWith(sep)
    ? [join(candidate, "index.html")]
    : [candidate, `${candidate}.html`, join(candidate, "index.html")];
  return options.find((path) => existsSync(path) && statSync(path).isFile()) ?? join(root, "404.html");
}

const server = createServer((request, response) => {
  const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
  const file = resolveFile(pathname);
  if (!file || !existsSync(file)) {
    response.writeHead(404).end("Not found");
    return;
  }
  const notFound = file === join(root, "404.html") && pathname !== "/404.html";
  response.writeHead(notFound ? 404 : 200, {
    "content-type": mime[extname(file)] ?? "application/octet-stream",
    "x-content-type-options": "nosniff",
  });
  createReadStream(file).pipe(response);
});

server.listen(4000, "127.0.0.1");

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
