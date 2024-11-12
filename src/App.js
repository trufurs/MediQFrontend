// src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import styled from "styled-components";
import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import Medicines from "./components/Medicines"; // New component

function App() {
  return (
    <Router>
      <AppContainer>
        <Sidebar />
        <MainContent>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/medicines" element={<Medicines />} />
          </Routes>
        </MainContent>
      </AppContainer>
    </Router>
  );
}

export default App;

const AppContainer = styled.div`
  display: flex;
  background-color: #f4f6f8;
  height: 100vh;
  overflow-y: hidden;
`;

const MainContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
