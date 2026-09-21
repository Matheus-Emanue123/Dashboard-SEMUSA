import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./data/pages/Home";
import ProjectsPage from "./data/pages/Projects";
import Project from "./data/pages/Project";

function App() {
  return (
    <>
      <Navbar />

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/projects"
          element={<ProjectsPage />}
        />

        <Route
          path="/projects/:id"
          element={<Project />}
        />

      </Routes>

    </>
  );
}

export default App;