import React from "react";

const LLMQuestion = ({ llmResponse }) => {
  return (
    <div className="w-full p-4 rounded-md items-center">{llmResponse}</div>
  );
};

export default LLMQuestion;
