import React from "react";

const UserQuestion = ({ userMessage }) => {
  console.log("User", typeof userMessage);
  return (
    <div className="bg-gray-500 w-full p-4 rounded-md text-end font-medium items-center">
      {userMessage}
    </div>
  );
};

export default UserQuestion;
