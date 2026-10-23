import { useEffect, useState } from "react";

interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
}

interface CategoriesProps {
  categoriaActiva: number | null;
  onSeleccionar: (id: number | null) => void;
}

function Categories({ categoriaActiva, onSeleccionar }: CategoriesProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/categorias")
      .then((res) => {
        if (!res.ok) throw new Error("No se pudieron cargar las categorías");
        return res.json();
      })
      .then((datos: Categoria[]) => setCategorias(datos))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <section className="container top-categories" id="categorias">
      <h1 className="heading-1">Categorías</h1>

      {error && <p style={{ color: "salmon" }}>{error}</p>}

      <div className="container-categories">
        <div
          className={`card-category ${categoriaActiva === null ? "active" : ""}`}
          onClick={() => onSeleccionar(null)}
          style={{ cursor: "pointer" }}
        >
          <p>Todas</p>
          <span>Ver más</span>
        </div>

        {categorias.map((cat) => (
          <div
            key={cat.id_categoria}
            className={`card-category ${
              categoriaActiva === cat.id_categoria ? "active" : ""
            }`}
            onClick={() => onSeleccionar(cat.id_categoria)}
            style={{ cursor: "pointer" }}
          >
            <p>{cat.nombre}</p>
            <span>Ver más</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Categories;