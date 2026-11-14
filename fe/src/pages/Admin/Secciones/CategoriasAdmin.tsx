import CatalogoAdmin from "./CatalogoAdmin";

function CategoriasAdmin() {
  // En el backend la ruta es /admin/categoria (singular) y la lista llega en la clave "categoria"
  return (
    <CatalogoAdmin
      ruta="categoria"
      clave="categoria"
      idCampo="id_categoria"
      icono="🗂️"
      titulo="Categorías"
      singular="categoría"
      femenino={true}
      descripcion="Administra las categorías de los juegos de PromoHunt."
    />
  );
}

export default CategoriasAdmin;
