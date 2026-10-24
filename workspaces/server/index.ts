import { DatabaseSync } from "node:sqlite";
import type { Server as HttpServer } from "node:http";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { Server } from "socket.io";

type Post = {
  id: number;
  text: string;
};

const db = new DatabaseSync("./data/app.sqlite");
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL
  )
`);

const app = new Hono();
const io = new Server();

io.on("connection", (socket) => {
  const posts = db.prepare("SELECT id, text FROM posts ORDER BY id DESC").all() as Post[];
  socket.emit("posts", posts);

  socket.on("post:create", (value: unknown) => {
    const text = typeof value === "string" ? value.trim() : "";

    if (text.length < 1 || text.length > 500) return;

    const result = db.prepare("INSERT INTO posts (text) VALUES (?)").run(text);
    const post: Post = { id: Number(result.lastInsertRowid), text };

    io.emit("post", post);
  });
});

const port = Number(process.env.PORT ?? 3001);
const server = serve({ fetch: app.fetch, port, hostname: "localhost" });
io.attach(server as HttpServer);

console.log(`Hono: http://localhost:${port}`);
