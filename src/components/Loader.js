// src/components/Loader.js
import React from "react";
import styled, { keyframes } from "styled-components";

function Loader() {
  return (
    <LoaderContainer>
      <Spinner />
      <p>Loading...</p>
    </LoaderContainer>
  );
}

export default Loader;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const Spinner = styled.div`
  border: 6px solid #f3f3f3;
  border-top: 6px solid #00796b;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spin} 1s linear infinite;
`;
