import Groq from "groq-sdk";
import NodeCache from "node-cache";
import { tavily } from "@tavily/core";

const groq = new Groq({ apiKey: process.env.GROK_API_KEY });
const tvly = tavily({ apiKey: process.env.Tool_Calling });
const myCache = new NodeCache({ stdTTL: 60 * 60 * 24 });

export async function askingLLMQuestion(userMessage, threadId) {
  const baseMessages = [
    {
      role: "system",
      content: `You are a smart personal assistant who answers the asked questions. 
      If you know the answer to a question,answer it directly in plain english.
      If the answer requires real-time,local,or up-to-date information,or if you don't know the answer,
          You have access to following tools: 
          1. searchWeb({query}:{query:string} )  
          2. current date and time: ${new Date().toUTCString()} 

          Do not mention the tool unless needed.
          `,
    },
  ];

  const messages = myCache.get(threadId) ?? baseMessages;
  console.log("threadId", threadId);

  messages.push({
    role: "user",
    content: userMessage,
  });
  while (true) {
    const chatCompletions = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      messages: messages,
      tools: [
        {
          type: "function",
          function: {
            name: "webSearch",
            description:
              "Search the latest information and realtime data on the internet",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The search query to perform search on",
                },
              },
              required: ["query"],
            },
          },
        },
      ],
      tool_choice: "auto",
    });
    messages.push(chatCompletions.choices[0].message);
    const toolCalls = chatCompletions.choices[0].message.tool_calls;
    if (!toolCalls) {
      myCache.set(threadId, messages);
      return chatCompletions.choices[0].message;
    }
    for (const tool of toolCalls) {
      const functionName = tool.function.name;
      const functionParams = tool.function.arguments;

      if (functionName == "webSearch") {
        const toolResult = await webSearch(JSON.parse(functionParams));
        messages.push({
          tool_call_id: tool.id,
          role: "tool",
          name: functionName,
          content: toolResult,
        });
      }
    }
  }
}

async function webSearch({ query }) {
  console.log("Calling web search...");
  const response = await tvly.search(query);
  const finalResult = response.results
    .map((result) => result.content)
    .join("\n\n");
  return finalResult;
}
