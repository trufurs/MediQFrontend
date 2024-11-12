// src/components/Sidebar.js
import React from "react";
import styled from "styled-components";
import { FaHome, FaPills, FaStore, FaBell } from "react-icons/fa";

function Sidebar() {
  return (
    <Nav>
      <Logo>MediQ</Logo>
      <NavLinks>
        <NavItem>
          <FaHome /> Home
        </NavItem>
        <NavItem>
          <FaPills /> Medicines
        </NavItem>
        <NavItem>
          <FaStore /> Stores
        </NavItem>
        <NavItem>
          <FaBell /> Reminders
        </NavItem>
      </NavLinks>
    </Nav>
  );
}

export default Sidebar;

const Nav = styled.nav`
  width: 250px;
  background: #00796b;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 2rem;
  height: 100vh;
  position: sticky;
  top: 0;
`;

const Logo = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
`;

const NavLinks = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 1rem;
  gap: 1.5rem;
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  transition: background 0.3s;
  
  &:hover {
    background: #004d40;
    border-radius: 8px;
  }
`;
