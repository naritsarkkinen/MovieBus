import { BrowserRouter, Routes, Route } from "react-router-dom";

import MovieListPage from "./pages/MovieListPage";
import MovieDetailsPage from "./pages/MovieDetailsPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MovieListPage />} />
                <Route path="/movie/:id" element={<MovieDetailsPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;