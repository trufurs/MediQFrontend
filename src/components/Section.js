// src/components/Section.js
import React from "react";
import styled from "styled-components";

function Section({ data }) {
  return (
    <Card>
      <Image src={data.imageUrl} alt={data.name} />
      <CardContent>
        <h2>{data.name}</h2>
        <p>{data.description}</p>
        <p><strong>Price:</strong> ${data.price}</p>
      </CardContent>
    </Card>
  );
}

export default Section;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  padding: 1.5rem;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
`;

const Image = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const CardContent = styled.div`
  color: #333;

  h2 {
    font-size: 1.8rem;
    color: #00796b;
    margin-bottom: 0.5rem;
  }
`;
