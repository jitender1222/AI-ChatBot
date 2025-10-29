import React, { useState } from "react";

const UserInput = ({ onClickButton }) => {
  const [text, setText] = useState("");
  const handleInput = (text) => {
    onClickButton(text);
    console.log("isnide the ", text);
    setText("");
  };
  return (
    <div className="w-full flex justify-center gap-2">
      <input
        value={text}
        placeholder="Enter a text to search"
        className="border-2 p-5 rounded-xl w-full max-w-3xl"
        onChange={(e) => setText(e.target.value)}
      />
      <button className="bg-gray-400 " onClick={() => handleInput(text)}>
        Submit
      </button>
    </div>
  );
};

export default UserInput;
