import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.scss';
import { ReactComponent as BrandIcon } from '../../assets/images/laundry-master.svg';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <BrandIcon />
      </div>
      <ul className="navbar-links">
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/expenses"
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            Expenses
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
