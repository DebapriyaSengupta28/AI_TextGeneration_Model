import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./index.module.css";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const formatText = (text) => {
    // Replace asterisks with strong tags
    return text.replace(/\*{2}(.+?)\*{2}/g, '<strong>$1</strong>');
  };

  const sendMessage = async () => {
    if (input.trim() === "") return;

    setIsLoading(true);

    const userMessage = { type: "user", text: input };
    setMessages([...messages, userMessage]);

    try {
      const response = await axios.post("/api/chatbot", { input });
      const formattedOutput = formatText(response.data.output.replace(/\n/g, "<br>"));
      const botMessage = { type: "bot", text: formattedOutput };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = { type: "bot", text: "Oops! Something went wrong. Please try again later." };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }

    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.chatWindow}>
        {messages.length === 0 ? (
          <div className={styles.startConversation}>This Model Can Not Have Conversations Due To Limitations</div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={message.type === "user" ? styles.userMessage : styles.botMessage}
              dangerouslySetInnerHTML={{ __html: message.text }}
            />
          ))
        )}
        {isLoading && <div className={styles.loadingMessage}>Loading...</div>}
      </div>
      <div className={styles.inputContainer}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={styles.input}
          placeholder="Type your message..."
          disabled={isLoading}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={sendMessage}
          className={styles.button}
          disabled={isLoading}
        >
          Send
        </button>
      </div>
    </div>
  );
}