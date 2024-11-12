// src/components/Section.js
import React from "react";
import styled from "styled-components";

function Section({ data }) {
  return (
    <SectionContainer id={`section${data.id}`}>
      <Image src={data.imageUrl} alt={data.name} />
      <Details>
        <h2>{data.name}</h2>
        <p>{data.description}</p>
        <p><strong>Price:</strong> ${data.price}</p>
      </Details>
    </SectionContainer>
  );
}

export default Section;

// Styled components for Section
const SectionContainer = styled.section`
  display: flex;
  gap: 20px;
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  &:nth-child(even) {
    flex-direction: row-reverse;
  }
`;

const Image = styled.img`
  width: 200px;
  height: 200px;
  border-radius: 8px;
  object-fit: cover;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #333;

  h2 {
    font-size: 1.8rem;
    color: #00796b;
  }
`;
