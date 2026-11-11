import { useState } from "react";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RutaProtegida from "./components/RutaProtegida";

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
const Admin = lazy(() => import("./pages/Admin/Admin"));
import Registro from "./pages/Registro";

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
            <RutaProtegida>
              <div className="app">
                <Perfil />
                <BottomNav />
              </div>
            </RutaProtegida>
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
          path="/admin"
          element={
            <RutaProtegida rol="admin">
              <Suspense fallback={<p style={{ padding: "2rem" }}>Cargando panel…</p>}>
                <Admin />
              </Suspense>
            </RutaProtegida>
          }
        />
        <Route path="/registro" element={<Registro />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;