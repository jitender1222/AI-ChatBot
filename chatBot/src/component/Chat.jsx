import React, { useRef, useState } from "react";
import UserQuestion from "./UserQuestion";
import LLMQuestion from "./LLMQuestion";
import UserInput from "./UserInput";
import Loader from "./Loader";
import { v4 as uuidv4 } from "uuid";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const idGenerate = useRef(uuidv4());

  console.log("id", idGenerate);

  const handleUserMessage = async (text) => {
    if (text.trim() === "") return;

    // Add user message
    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    // Call server and add LLM response
    const llmResponse = await callServer(text);
    const llmMsg = { role: "assistant", content: llmResponse };
    setMessages((prev) => [...prev, llmMsg]);
  };

  async function callServer(userText) {
    setLoading(true);
    const response = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        question: userText,
        threadId: idGenerate.current,
      }),
    });

    if (!response.ok) {
      throw new Error("There is something wrong in generating the response");
    }

    const result = await response.json();
    setLoading(false);
    return result.message.content; // assuming your backend sends { message: { content: "..." } }
  }

  return (
    <div className="flex flex-col mt-10 h-[90vh] p-4">
      {messages.length === 0 ? (
        <div className="flex justify-center items-center flex-1 text-center text-3xl font-serif">
          Hi, I'm ChatBot. Ask me anything...
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto flex flex-col gap-y-4">
          {messages.map((msg, index) =>
            msg.role === "user" ? (
              <UserQuestion key={index} userMessage={msg.content} />
            ) : (
              <LLMQuestion key={index} llmResponse={msg.content} />
            )
          )}
          {loading && <Loader />}
        </div>
      )}

      {/* Input */}
      <div>
        <UserInput onClickButton={handleUserMessage} />
      </div>
      <div className="text-center mt-12 font-serif">
        Made with ❤️ by Jitender
      </div>
    </div>
  );
};

export default Chat;
