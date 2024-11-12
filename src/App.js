// src/App.js
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import Navbar from "./components/Navbar";
import Section from "./components/Section";
import Loader from "./components/Loader";

function App() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from the backend API
    const fetchData = async () => {
      try {
        const response = await axios.get("https://127.0.0.1/medicines");
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
      <Navbar />
      <Content>
        {medicines.map((medicine, index) => (
          <Section key={index} data={medicine} />
        ))}
      </Content>
    </AppContainer>
  );
}

export default App;

// Styled components for layout
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: hidden;
  scroll-behavior: smooth;
  font-family: Arial, sans-serif;
  background-color: #f4f6f8;
`;

const Content = styled.div`
  width: 100%;
  max-width: 1200px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 30px;
`;
