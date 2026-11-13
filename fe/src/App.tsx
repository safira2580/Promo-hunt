import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

import Header from "./components/Header";
import Banner from "./components/Banner";
import Features from "./components/Features";
import Categories from "./components/Categories";
import Products from "./components/Products";
import Blogs from "./components/Blogs";
import BottomNav from "./components/BottomNav";
import Login from "./pages/Login";
import Perfil from "./pages/Perfil";
import JuegoDetalle from "./pages/JuegoDetalle";
import Admin from "./pages/Admin/Admin";
import Registro from "./pages/Registro";
import Favoritos from "./pages/Favoritos";
import Resenas from "./pages/Resenas";
import Reembolsos from "./pages/Reembolsos";
import TarjetasRegalo from "./pages/TarjetasRegalo";

function Inicio() {
  const [categoriaActiva, setCategoriaActiva] = useState<number | null>(null);

  return (
    <div className="app">
      <Header />
      <Banner />
      <Features />
      <div id="categorias">
        <Categories
          categoriaActiva={categoriaActiva}
          onSeleccionar={setCategoriaActiva}
        />
      </div>
      <div id="productos">
        <Products categoriaActiva={categoriaActiva} />
      </div>
      <Blogs />
      {/* Footer eliminado para que se sienta más como app */}
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/Login" element={<Login />} />
        <Route
          path="/Perfil"
          element={
            <div className="app">
              <Perfil />
              <BottomNav />
            </div>
          }
        />
        <Route
          path="/juego/:id"
          element={
            <div className="app">
              <JuegoDetalle />
              <BottomNav />
            </div>
          }
        />
        <Route
          path="/favoritos"
          element={
            <div className="app">
              <Favoritos />
              <BottomNav />
            </div>
          }
        />
        <Route
          path="/resenas"
          element={
            <div className="app">
              <Resenas />
              <BottomNav />
            </div>
          }
        />
        <Route
          path="/reembolsos"
          element={
            <div className="app">
              <Reembolsos />
              <BottomNav />
            </div>
          }
        />
        <Route
          path="/tarjetas-regalo"
          element={
            <div className="app">
              <TarjetasRegalo />
              <BottomNav />
            </div>
          }
        />
        <Route path="/admin" element={<Admin />} />
        <Route path="/registro" element={<Registro />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;