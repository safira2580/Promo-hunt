import CatalogoAdmin from "./CatalogoAdmin";

function GenerosAdmin() {
  return (
    <CatalogoAdmin
      ruta="generos"
      clave="generos"
      idCampo="id_genero"
      icono="🎭"
      titulo="Géneros"
      singular="género"
      femenino={false}
      descripcion="Administra los géneros de los juegos de PromoHunt."
    />
  );
}

export default GenerosAdmin;
