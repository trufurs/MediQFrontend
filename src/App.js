// src/App.js
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import Section from "./components/Section";
import Loader from "./components/Loader";

function App() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://api.example.com/medicines");
        setMedicines(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;

  return (
    <AppContainer>
      <Sidebar />
      <MainContent>
        <Home />
        {medicines.map((medicine, index) => (
          <Section key={index} data={medicine} />
        ))}
      </MainContent>
    </AppContainer>
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
