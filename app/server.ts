import { createServer } from "node:http";

const server = createServer((_request, response) => {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("Portfolio server is running");
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
