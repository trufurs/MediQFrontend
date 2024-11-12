// src/components/Home.js
import React from "react";
import styled from "styled-components";
import { FaPills, FaBell, FaStore } from "react-icons/fa";

function Home() {
  return (
    <HomeContainer>
      <Banner>
        <h1>Welcome to MediQ</h1>
        <p>Your one-stop solution for all your medical needs.</p>
        <Button>Explore Now</Button>
      </Banner>
      
      <Features>
        <FeatureCard>
          <FaPills size={40} color="#00796b" />
          <h3>Medicine Information</h3>
          <p>Access a comprehensive database of medicines and their uses.</p>
        </FeatureCard>

        <FeatureCard>
          <FaBell size={40} color="#00796b" />
          <h3>Reminders</h3>
          <p>Set up reminders for your medication and never miss a dose.</p>
        </FeatureCard>

        <FeatureCard>
          <FaStore size={40} color="#00796b" />
          <h3>Nearby Stores</h3>
          <p>Find nearby pharmacies and hospitals with ease.</p>
        </FeatureCard>
      </Features>
    </HomeContainer>
  );
}

export default Home;

// Styled Components for the Home Section
const HomeContainer = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Banner = styled.div`
  text-align: center;

  h1 {
    font-size: 2.5rem;
    color: #00796b;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1.2rem;
    color: #555;
  }
`;

const Button = styled.button`
  background-color: #00796b;
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  margin-top: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #004d40;
  }
`;

const Features = styled.div`
  display: flex;
  justify-content: space-around;
  gap: 1rem;
`;

const FeatureCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem;
  background-color: #f4f6f8;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 200px;

  h3 {
    margin: 1rem 0 0.5rem;
    font-size: 1.2rem;
    color: #00796b;
  }

  p {
    font-size: 0.9rem;
    color: #555;
  }
`;
