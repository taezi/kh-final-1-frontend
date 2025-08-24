import React, { useState } from "react";
import axios from "axios";
import { generateAI } from "../service/aiAPI";
export default function DateaiPage(params) {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await generateAI(prompt);
      setResponse(response);
    } catch (err) {
      console.error(err);
      setResponse("에러가 발생했습니다");
    }
  };
  return (
    <>
      <div className="top-blank"></div>
      <div className="container">
        <div className="left-container"></div>
        <div className="main-container">
          <h3>ai페이지</h3>
          <div
            style={{
              maxWidth: "600px",
              margin: "50px auto",
              fontFamily: "Arial",
            }}
          >
            <h2>🤖 Gemini AI 검색</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="궁금한 내용을 입력하세요..."
                style={{ width: "70%", padding: "10px" }}
              />
              <button
                type="submit"
                style={{ padding: "10px 20px", marginLeft: "10px" }}
              >
                검색
              </button>
            </form>

            {response && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  border: "1px solid #ccc",
                }}
              >
                <strong>AI 응답:</strong>
                <p>{response}</p>
              </div>
            )}
          </div>
        </div>
        <div className="right-container"></div>
      </div>
    </>
  );
}
