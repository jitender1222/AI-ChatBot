import readline from "node:readline/promises";
import Groq from "groq-sdk";
import { tavily } from "@tavily/core";

const groq = new Groq({ apiKey: process.env.GROK_API_KEY });
const tvly = tavily({ apiKey: process.env.Tool_Calling });
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export async function main() {
  const messages = [
    {
      role: "system",
      content: `You are a smart personal assistant who answers the asked questions. 
          You have access to following tools: 
          1. searchWeb({query}:{query:string} )  `,
    },
  ];

  while (true) {
    const question = await rl.question("You:");
    if (question === "bye") {
      break;
    }
    messages.push({
      role: "user",
      content: question,
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
        console.log(`Assistant ${chatCompletions.choices[0].message.content}`);
        break;
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
  rl.close();
}

main();

async function webSearch({ query }) {
  console.log("Calling web search...");
  const response = await tvly.search(query);
  const finalResult = response.results
    .map((result) => result.content)
    .join("\n\n");
  return finalResult;
}
