function Home() {
  return (
    <main className="page-content">
      <div className="home-layout">
        <section className="home-main">
          <h1>Welcome to MovieBus</h1>
          <p>Discover and share your favorite movies with friends!</p>

          <div className="feature-grid">
            <div className="feature-card">Movies</div>
            <div className="feature-card">Discovery</div>
            <div className="feature-card">Lists</div>
            <div className="feature-card">Clubs</div>
          </div>
        </section>

        <aside className="top-movies">
          <h2>Top Movies</h2>
        </aside>
      </div>
    </main>
  )
}

export default Home