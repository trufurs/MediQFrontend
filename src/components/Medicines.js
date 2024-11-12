// src/components/Medicines.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import axios from "axios";
import { FaSearch, FaCartPlus, FaInfoCircle } from "react-icons/fa";

function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredMedicines, setFilteredMedicines] = useState([]);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await axios.get("https://api.example.com/medicines");
        setMedicines(response.data);
        setFilteredMedicines(response.data);
      } catch (error) {
        console.error("Error fetching medicines:", error);
      }
    };
    fetchMedicines();
  }, []);

  useEffect(() => {
    setFilteredMedicines(
      medicines.filter((medicine) =>
        medicine.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, medicines]);

  return (
    <MedicinesContainer>
      <SearchContainer
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SearchInputContainer>
          <FaSearch />
          <input
            type="text"
            placeholder="Search for medicines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SearchInputContainer>
      </SearchContainer>

      <MedicineList>
        {filteredMedicines.map((medicine) => (
          <MedicineCard
            key={medicine.id}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img src={medicine.imageUrl} alt={medicine.name} />
            <MedicineDetails>
              <h2>{medicine.name}</h2>
              <p><strong>Dosage:</strong> {medicine.dosage}</p>
              <p><strong>Manufacturer:</strong> {medicine.manufacturer}</p>
              <p><strong>Expiration:</strong> {medicine.expirationDate}</p>
              <p><strong>Usage:</strong> {medicine.usage}</p>
              <StockStatus inStock={medicine.inStock}>
                {medicine.inStock ? "In Stock" : "Out of Stock"}
              </StockStatus>
              <Actions>
                <ActionButton>
                  <FaCartPlus /> Add to Cart
                </ActionButton>
                <ActionButton>
                  <FaInfoCircle /> More Info
                </ActionButton>
              </Actions>
            </MedicineDetails>
          </MedicineCard>
        ))}
      </MedicineList>
    </MedicinesContainer>
  );
}

export default Medicines;

// Styled Components
const MedicinesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  background-color: #f4f6f8;
`;

const SearchContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 1rem;
`;

const SearchInputContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 30px;
  padding: 0.5rem 1rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 70%;
  max-width: 600px;

  svg {
    color: #00796b;
    margin-right: 1rem;
  }

  input {
    border: none;
    outline: none;
    width: 100%;
    font-size: 1.2rem;
    padding: 0.5rem;
    color: #333;

    &::placeholder {
      color: #aaa;
    }
  }
`;

const MedicineList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  overflow-y: auto;
  padding-top: 1rem;
  padding-bottom: 2rem;
`;

const MedicineCard = styled(motion.div)`
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;

  img {
    width: 100%;
    height: 150px;
    object-fit: cover;
  }
`;

const MedicineDetails = styled.div`
  padding: 1rem;

  h2 {
    font-size: 1.4rem;
    color: #00796b;
    margin-bottom: 0.5rem;
  }

  p {
    color: #555;
    font-size: 1rem;
    margin: 0.3rem 0;
  }

  strong {
    font-weight: bold;
    color: #333;
  }
`;

const StockStatus = styled.div`
  font-size: 1rem;
  font-weight: bold;
  color: ${(props) => (props.inStock ? "#388e3c" : "#d32f2f")};
  margin-top: 1rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #00796b;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #004d40;
  }
`;
