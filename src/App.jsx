import Sidebar from "./components/Sidebar/sidebar";
import Header from "./components/Header/header";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      {/* Sua parte: Sidebar */}
      <Sidebar />

      {/* Área à direita da Sidebar */}
      <div className="main-wrapper">
        {/* Sua parte: Header */}
        <Header />

        {/* Parte do Frontend 2 (Cards, Gráficos, etc.) */}
        <main className="content-body">
          {/* O Frontend 2 vai inserir os componentes aqui */}
        </main>
      </div>
    </div>
  );
}

export default App;