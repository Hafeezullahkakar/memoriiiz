import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css'; // Create this file for styling

const Header = () => {
  return (
    <header className="header">
      <Link to="/" className="logo">Memoriiiz</Link>
      <nav className="nav">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/wordlist" className="nav-link">Wordlist</Link>
      </nav>
      <div className='signinBtn'>
        <p>Signed in as: Hafeez</p>
      </div>
    </header>
  );
};

export default Header;
