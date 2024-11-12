// src/components/Navbar.js
import React from "react";
import styled from "styled-components";
import { FaPills } from "react-icons/fa";

function Navbar() {
  return (
    <Nav>
      <Logo>
        <FaPills /> MediQ
      </Logo>
      <NavLinks>
        <a href="#section1">Home</a>
        <a href="#section2">Medicines</a>
        <a href="#section3">Stores</a>
        <a href="#section4">Reminders</a>
      </NavLinks>
    </Nav>
  );
}

export default Navbar;

// Styled components for Navbar
const Nav = styled.nav`
  width: 100%;
  position: fixed;
  top: 0;
  background: #00796b;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 15px;

  a {
    color: #fff;
    text-decoration: none;
    font-weight: bold;

    &:hover {
      color: #a7ffeb;
    }
  }
`;
