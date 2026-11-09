import { Link, NavLink } from 'react-router'
import './Navbar.css'

function Navbar() {
  return (
    <header className="site-header">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          MovieBus
        </Link>

        <nav aria-label="Main navigation">
          <ul>
            <li><NavLink to="/" end>Home</NavLink></li>
            <li><NavLink to="/movies">Movies</NavLink></li>
            <li><NavLink to="/clubs">Clubs</NavLink></li>
            <li><NavLink to="/lists">Lists</NavLink></li>
          </ul>
        </nav>

        <span className="profile-icon" aria-hidden="true">
          ♙
        </span>
      </div>
    </header>
  )
}

export default Navbar
