import { useEffect, useState, type SubmitEvent } from "react";
import { createRoot } from "react-dom/client";
import { io } from "socket.io-client";
import "./style.css";

type Post = {
  id: number;
  text: string;
};

const socket = io({ autoConnect: false, transports: ["websocket"] });

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    function receivePost(post: Post) {
      setPosts((current) => [post, ...current]);
    }

    socket.on("posts", setPosts);
    socket.on("post", receivePost);
    socket.connect();

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);

  function addPost(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!text.trim()) return;

    socket.emit("post:create", text);
    setText("");
  }

  return (
    <main className="container">
      <header className="header">
        <h1>Socket Board</h1>
      </header>

      <section className="composer" aria-label="新しい投稿">
        <form onSubmit={addPost}>
          <label htmlFor="post-text">投稿する</label>
          <textarea
            id="post-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={500}
            rows={4}
            placeholder="ここに投稿内容を入力してください"
          />
          <div className="form-footer">
            <button type="submit" disabled={!text.trim()}>投稿する</button>
          </div>
        </form>
      </section>

      <section className="board" aria-label="投稿一覧">
        <ul className="post-list">
          {posts.map((post) => (
            <li key={post.id} className="post">
              <p>{post.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
