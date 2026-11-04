import React from 'react'
import './Navbar.css'

function Navbar() {
  return (
    <header>
      <a href="/" className="navbar-brand">MovieBus</a>
      <nav>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/movies">Movies</a></li>
          <li><a href="/lists">Lists</a></li>
          <li><a href="/clubs">Clubs</a></li>
        </ul>
      </nav>
    </header>
  )
}

export default Navbar