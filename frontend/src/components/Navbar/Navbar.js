import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.scss';
import { ReactComponent as BrandIcon } from '../../assets/images/laundry-master-white.svg';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = 'auto';
      document.body.style.position = 'static';
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.position = 'static';
    };
  }, [menuOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-header">
        <div className="navbar-logo">
          <BrandIcon className="brand-logo" />
        </div>
        <button
          className={`burger-menu ${menuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className="burger-bar"></span>
          <span className="burger-bar"></span>
          <span className="burger-bar"></span>
        </button>
      </div>
      <ul className={`navbar-links ${menuOpen ? 'show' : ''}`}>
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? 'active-link' : '')}
            onClick={() => setMenuOpen(false)}
          >
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/expenses"
            className={({ isActive }) => (isActive ? 'active-link' : '')}
            onClick={() => setMenuOpen(false)}
          >
            Expenses
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
