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


function Inicio() {
  return (
    <div className="app">
      <Header />
      <Banner />
      <Features />
      <div id="categorias">
        <Categories />
      </div>
      <div id="productos">
        <Products />
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
        <Route path="/Perfil" element={
          <div className="app">
            <Perfil />
            <BottomNav />
          </div>
        } />
        <Route path="/juego/:id" element={
          <div className="app">
            <JuegoDetalle />
            <BottomNav />
          </div>
        } />
        <Route path="/admin" element={<Admin />} />
        <Route path="/registro" element={<Registro />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
