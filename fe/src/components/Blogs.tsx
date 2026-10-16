import {
  FaMagnifyingGlass,
  FaLink
} from "react-icons/fa6";

import requiem from "../assets/img/requiem.jpg";
import gta5 from "../assets/img/gta5.jpg";
import forza6 from "../assets/img/Forza6.jpg";

function Blogs() {

  const noticias = [
    {
      id: 1,
      titulo: "Resident Evil Requiem ya tiene fecha de lanzamiento",
      fecha: "30 Julio 2026",
      contenido:
        "Capcom confirmó oficialmente la llegada de Resident Evil Requiem con mejoras gráficas y una nueva historia.",
      imagen: requiem,
    },
    {
      id: 2,
      titulo: "GTA V sigue rompiendo récords años después",
      fecha: "28 Julio 2026",
      contenido:
        "El clásico de Rockstar mantiene una comunidad enorme y sigue recibiendo actualizaciones en GTA Online.",
      imagen: gta5,
    },
    {
      id: 3,
      titulo: "Forza Horizon 6 se asoma en el horizonte",
      fecha: "25 Julio 2026",
      contenido:
        "Nuevos rumores y filtraciones apuntan a que el próximo Forza Horizon podría anunciarse muy pronto.",
      imagen: forza6,
    },
  ];

  return (
    <section className="container blogs">
      <h1 className="heading-1">Últimas Noticias</h1>

      <div className="container-blogs">
        {noticias.map((n) => (
          <div className="card-blog" key={n.id}>
            <div className="container-img">
              <img src={n.imagen} alt={n.titulo} />
              <div className="button-group-blog">
                <span><FaMagnifyingGlass /></span>
                <span><FaLink /></span>
              </div>
            </div>

            <div className="content-blog">
              <h3>{n.titulo}</h3>
              <span>{n.fecha}</span>
              <p>{n.contenido}</p>
              <div className="btn-read-more">Leer más</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Blogs;
