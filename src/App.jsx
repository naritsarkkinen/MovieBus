import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import MovieListPage from './pages/MovieListPage'
import MovieDetailsPage from './pages/MovieDetailsPage'
import './App.css'

function App() {
  return (
    <div className="App">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<MovieListPage />} />
        <Route path="/movie/:id" element={<MovieDetailsPage />} />
        <Route path="/clubs" element={<h1>Clubs - Coming Soon</h1>} />
        <Route path="/lists" element={<h1>Lists - Coming Soon</h1>} />
      </Routes>
    </div>
  )
}

export default App