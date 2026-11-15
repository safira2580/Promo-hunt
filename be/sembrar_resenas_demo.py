"""
Crea 40 reseñas de DEMOSTRACIÓN de 40 usuarios distintos: 20 para "resident evil requiem" y 20 para
"Dying Light The Beast". Los usuarios se marcan con el dominio @demo.promohunt.local, tienen una
contraseña aleatoria que nadie conoce (no se puede iniciar sesión con ellos) y se pueden borrar.

Uso (desde la carpeta be, con el entorno virtual activo):
    python sembrar_resenas_demo.py --dry-run   # solo muestra lo que haría
    python sembrar_resenas_demo.py             # crea usuarios y reseñas (se puede repetir sin duplicar)
    python sembrar_resenas_demo.py --borrar    # elimina TODOS los usuarios y reseñas de demostración

Usa la base definida en DATABASE_URL (variable de entorno o be/.env); por defecto, la local de Docker.
Para Railway:  $env:DATABASE_URL="postgresql://..."  y luego el mismo comando.
"""

# ruff: noqa: E501
import secrets
import sys

import psycopg2

from app.config import get_settings
from app.utils.security import hash_password

DRY = "--dry-run" in sys.argv
BORRAR = "--borrar" in sys.argv
DOMINIO = "@demo.promohunt.local"

REQUIEM = "resident evil requiem"
BEAST = "Dying Light The Beast"

# (nombre, juego, calificación 1-5, fecha, título, comentario)
RESENAS = [
    (
        "Sebastián Rojas",
        REQUIEM,
        5,
        "2026-03-02 21:14",
        "Terror y acción bien repartidos",
        "Las partes de Grace me tuvieron con el corazón en la boca: primera persona, recursos contados y "
        "cada pasillo del hotel da miedo. Y cuando entra Leon el juego se vuelve pura adrenalina. Dos "
        "estilos distintos en un mismo juego y funcionan.",
    ),
    (
        "Valentina Gómez",
        REQUIEM,
        5,
        "2026-03-05 18:40",
        "El mejor Resident Evil en años",
        "Llevo jugando la saga desde el primero y esto se siente como una carta de amor a los fans. "
        "Los guiños a Raccoon City están muy bien puestos y Grace es una protagonista que sí te importa. "
        "Lo terminé en unas 15 horas y quiero repetirlo.",
    ),
    (
        "Andrés Camargo",
        REQUIEM,
        4,
        "2026-03-09 23:05",
        "Muy bueno, aunque desparejo",
        "Me quedo con las secciones de Grace, la tensión es de las mejores de la saga. Las de Leon son "
        "divertidas pero me sacaron un poco del ambiente de terror. Aun así, el conjunto es muy sólido.",
    ),
    (
        "Laura Mejía",
        REQUIEM,
        5,
        "2026-03-14 16:22",
        "Gráficos y sonido espectaculares",
        "En PC se ve increíble y el sonido es clave: escuchar algo moviéndose detrás de una puerta y no "
        "saber qué es no tiene precio. La gestión del inventario de Grace con tan poco espacio me tuvo "
        "pensando cada objeto.",
    ),
    (
        "Camilo Herrera",
        REQUIEM,
        4,
        "2026-04-01 20:10",
        "Leon sigue siendo un crack",
        "Que Leon vuelva más veterano y con ese humor seco es un acierto. Su maletín al estilo RE4 me "
        "devolvió muchos recuerdos. Le bajo una estrella porque el ritmo cambia de golpe entre los dos "
        "personajes.",
    ),
    (
        "Daniela Ortiz",
        REQUIEM,
        3,
        "2026-04-12 19:33",
        "Buen juego, pero esperaba más historia",
        "La ambientación y el combate están muy pulidos, pero la trama me dejó con ganas de más "
        "explicaciones y algunos giros se sienten forzados. Disfrutable igual, solo que no lo veo "
        "perfecto.",
    ),
    (
        "Mateo Salcedo",
        REQUIEM,
        5,
        "2026-05-03 22:48",
        "Me recordó a lo mejor de RE7 y RE4",
        "Grace juega como un RE7 moderno y Leon como un RE4 más espectacular. Es raro que un juego "
        "combine bien dos estilos y aquí lo logran. Lo recomiendo a ciegas si te gusta el survival horror.",
    ),
    (
        "Juliana Parra",
        REQUIEM,
        4,
        "2026-06-18 17:25",
        "Un viaje de miedo que vale la pena",
        "Jugué en modo clásico con guardado limitado y fue sufrimiento del bueno. Cada vez que encontraba "
        "una máquina de escribir respiraba aliviada. Recomendado para quien disfruta la tensión.",
    ),
    (
        "Felipe Cárdenas",
        REQUIEM,
        2,
        "2026-07-07 14:12",
        "Demasiado cambio de ritmo para mí",
        "Quería que todo el juego fuera como las partes de Grace. Cuando pasa a la acción pierde lo que más "
        "me gustaba. Entiendo que a muchos les encante, pero a mí me dejó frío la segunda mitad.",
    ),
    (
        "Natalia Ríos",
        REQUIEM,
        4,
        "2026-09-21 20:55",
        "Rejugable y con mucha atmósfera",
        "Después de terminarlo quise empezar de nuevo para encontrar lo que me perdí. Los escenarios "
        "están llenos de detalles y los enemigos asustan de verdad. Lo único malo: me atoré un buen "
        "rato por no administrar bien mis recursos.",
    ),
    (
        "Santiago Duarte",
        BEAST,
        4,
        "2025-09-27 22:30",
        "Kyle Crane está de vuelta y enojado",
        "Después de tantos años de encierro, ver a Kyle con ganas de vengarse le da fuerza a la historia. "
        "El parkour sigue siendo lo mejor de la saga y Castor Woods es un mapa compacto que da gusto "
        "recorrer.",
    ),
    (
        "Mariana Vargas",
        BEAST,
        5,
        "2025-10-04 19:15",
        "Las noches dan miedo otra vez",
        "Salir de noche con los Volátiles rondando vuelve a ser aterrador, justo como en el primero. El "
        "ciclo de día y noche te obliga a planear todo. Para mí es lo mejor de la franquicia en mucho tiempo.",
    ),
    (
        "Esteban Ramírez",
        BEAST,
        4,
        "2025-10-19 17:42",
        "El modo Bestia es una locura",
        "Cuando se activa el modo Bestia sientes que eres un monstruo, es una descarga de poder divertida. "
        "Combinado con el combate cuerpo a cuerpo hace que cada pelea se sienta brutal. Se podría "
        "equilibrar un poco mejor, pero engancha.",
    ),
    (
        "Paula Medina",
        BEAST,
        3,
        "2025-11-08 21:05",
        "Divertido pero olvidable",
        "Moverse por los techos y pelear está genial, pero la historia no me atrapó ni el villano me "
        "pareció memorable. Lo disfruté por la jugabilidad, no por el argumento.",
    ),
    (
        "Nicolás Barrera",
        BEAST,
        4,
        "2025-12-14 20:20",
        "Mucho contenido por el precio",
        "Entre misiones principales, secundarias y exploración me dio bastantes horas de juego. Conducir "
        "el 4x4 por los caminos del bosque es un buen cambio de ritmo respecto al parkour.",
    ),
    (
        "Carolina Ospina",
        BEAST,
        5,
        "2026-01-25 18:18",
        "Parkour fluido y combate satisfactorio",
        "Es de los mejores parkour en primera persona que he jugado. Subir, saltar y rematar zombis se "
        "siente muy natural. Me encantó la ambientación de bosque y montañas.",
    ),
    (
        "Diego Quintero",
        BEAST,
        3,
        "2026-03-30 16:50",
        "Buena base, progresión algo floja",
        "El juego es entretenido, pero el sistema de mejoras me pareció poco emocionante y algunas "
        "misiones se repiten. Si te gusta la saga lo vas a pasar bien, pero no es una revolución.",
    ),
    (
        "Sara Londoño",
        BEAST,
        4,
        "2026-05-16 23:10",
        "Un regreso a casa muy sangriento",
        "Se siente como un Dying Light de los de antes pero más oscuro y violento. Castor Woods tiene mucha "
        "personalidad y los sobrevivientes con los que te cruzas dan ganas de ayudarlos.",
    ),
    (
        "Julián Arango",
        BEAST,
        2,
        "2026-08-02 15:35",
        "No me convenció la historia",
        "Venía con muchas ganas y me aburrió el hilo argumental. La mecánica de la Bestia la usé poco y "
        "el resto es lo mismo de siempre. Está bien si lo encuentras en descuento.",
    ),
    (
        "Isabela Cano",
        BEAST,
        5,
        "2026-10-11 20:00",
        "Me enganchó de principio a fin",
        "Lo jugué casi de corrido: explorar, saquear, huir de noche y volver a un refugio salvo es una "
        "sensación genial. Además corre muy bien en mi PC. De lo mejor del año para mí.",
    ),
    # ---- Segunda tanda (para llegar a 20 reseñas por juego) ----
    (
        "Tomás Benítez",
        REQUIEM,
        5,
        "2026-03-03 22:10",
        "Lo jugué en una sola sentada",
        "Empecé una noche y no pude soltarlo. La historia de Grace, hija de Alyssa de Outbreak, tiene "
        "gancho y los supervivientes de Raccoon City aportan mucho misterio. Si te gusta la saga, es obligatorio.",
    ),
    (
        "Gabriela Núñez",
        REQUIEM,
        4,
        "2026-03-11 20:45",
        "Dos juegos en uno y casi siempre acierta",
        "Poder elegir primera o tercera persona es un detalle genial. Con Grace jugué en primera y con "
        "Leon en tercera, y cada estilo se siente distinto. Me faltó un poco más de variedad de enemigos.",
    ),
    (
        "Óscar Villalba",
        REQUIEM,
        5,
        "2026-03-27 19:00",
        "Leon le puso la cereza al pastel",
        "Ver a un Leon ya mayor, cansado pero letal, es de lo mejor del juego. Las secuencias de acción "
        "son un espectáculo y los remates cuerpo a cuerpo son brutales. Me reí y me asusté a partes iguales.",
    ),
    (
        "Lucía Fernández",
        REQUIEM,
        3,
        "2026-04-20 17:30",
        "Entretenido, pero con altibajos",
        "Hay momentos buenísimos y otros que se sienten de relleno. La parte de Grace es la que más me "
        "gustó, pero se queda corta frente a lo que dura Leon. Lo recomiendo con descuento.",
    ),
    (
        "Ricardo Peña",
        REQUIEM,
        4,
        "2026-05-22 21:40",
        "Terror clásico con acabado moderno",
        "Guardar partida con limitaciones en modo clásico le da una tensión enorme. Cada decisión pesa: "
        "curarte, huir o gastar balas. Visualmente es un lujo y corre fluido en mi PC.",
    ),
    (
        "Manuela Acosta",
        REQUIEM,
        5,
        "2026-06-30 18:20",
        "Me hizo gritar con los audífonos puestos",
        "El diseño de sonido es una locura: pasos, goteras, puertas que crujen. En el hotel casi me da "
        "algo cuando algo me persiguió por un pasillo oscuro. De lo más aterrador que he jugado.",
    ),
    (
        "David Escobar",
        REQUIEM,
        4,
        "2026-08-09 16:15",
        "Buen cierre de varias historias de la saga",
        "Los guiños a entregas anteriores están bien trabajados, sobre todo si jugaste los clásicos. "
        "Algunas explicaciones llegan tarde, pero el viaje merece la pena. Unas 15 horas muy bien aprovechadas.",
    ),
    (
        "Andrea Cifuentes",
        REQUIEM,
        3,
        "2026-09-05 20:05",
        "Esperaba más miedo en la segunda mitad",
        "Me enamoré de la primera parte, pero después el juego se vuelve más de disparos y perdí la "
        "sensación de vulnerabilidad. No es malo, simplemente no era lo que buscaba.",
    ),
    (
        "Jorge Palacios",
        REQUIEM,
        5,
        "2026-10-14 22:25",
        "Un gran regreso de Capcom",
        "Combina lo mejor de varias eras de Resident Evil sin sentirse un refrito. El ritmo alterna "
        "tensión y acción de forma muy inteligente. Ya lo estoy rejugando en dificultad alta.",
    ),
    (
        "Sofía Restrepo",
        REQUIEM,
        4,
        "2026-11-10 19:50",
        "Atmósfera y puzzles muy bien hechos",
        "Me encantaron los acertijos y explorar cada rincón buscando objetos. El inventario limitado de "
        "Grace te obliga a pensar qué llevar. Muy recomendable para fans del survival horror.",
    ),
    (
        "Alejandro Molina",
        BEAST,
        4,
        "2025-10-02 21:20",
        "Castor Woods es un gran escenario",
        "Un mapa más pequeño que el de otras entregas, pero mucho más denso y con carácter. Entre el "
        "bosque, las montañas y los pueblos abandonados siempre hay algo que explorar. Kyle sigue teniendo carisma.",
    ),
    (
        "Catalina Suárez",
        BEAST,
        5,
        "2025-10-23 18:55",
        "Las persecuciones nocturnas son lo mejor",
        "Cuando cae la noche y los Volátiles salen a cazar, el juego cambia por completo. Corrí por los "
        "techos con el corazón a mil buscando un refugio. Pura tensión, tal como recordaba de Dying Light.",
    ),
    (
        "Hernán Bedoya",
        BEAST,
        3,
        "2025-11-30 20:40",
        "Divierte, aunque se siente repetitivo",
        "El combate cuerpo a cuerpo es muy satisfactorio, pero después de unas horas las misiones "
        "empiezan a parecerse. El modo Bestia es llamativo, aunque no cambió mi forma de jugar.",
    ),
    (
        "Luisa Fernanda Giraldo",
        BEAST,
        4,
        "2026-01-08 17:10",
        "Conducir el 4x4 fue una sorpresa",
        "No esperaba disfrutar tanto manejar por los caminos del bosque. Es un buen respiro entre las "
        "carreras por los tejados y ayuda a recorrer el mapa. Lo demás, la fórmula de siempre pero bien ejecutada.",
    ),
    (
        "Brayan Castaño",
        BEAST,
        5,
        "2026-02-17 23:00",
        "Kyle Crane con ganas de venganza",
        "Después de trece años de experimentos, ver a Kyle volver con rabia y humor negro funciona de "
        "maravilla. Perseguir al Barón por Castor Woods me mantuvo enganchado de principio a fin.",
    ),
    (
        "Mónica Zapata",
        BEAST,
        2,
        "2026-03-19 15:20",
        "No era lo que esperaba",
        "Me aburrí con la historia y las mejoras de personaje me parecieron simples. Hay buenos momentos "
        "de acción, pero no me dieron ganas de seguir explorando. Para mí, mediocre.",
    ),
    (
        "Iván Trujillo",
        BEAST,
        4,
        "2026-05-05 22:35",
        "Parkour y combate muy bien afinados",
        "Se nota el cuidado en cómo responde el personaje: saltos, agarres y golpes salen justo cuando "
        "quieres. Me gustó saquear convoyes militares con buen botín. Quizás le falte algo de variedad.",
    ),
    (
        "Karen Salazar",
        BEAST,
        3,
        "2026-07-12 19:30",
        "Bueno, pero no memorable",
        "Disfruté las primeras horas y luego bajé el ritmo. Los personajes secundarios están bien, pero la "
        "trama principal no me dejó huella. Lo recomiendo si buscas acción sin complicaciones.",
    ),
    (
        "Emilio Rincón",
        BEAST,
        5,
        "2026-09-26 20:15",
        "Muchísimas horas de diversión",
        "Entre misiones, desafíos y exploración llevo muchas horas y sigo descubriendo cosas. Los "
        "enfrentamientos contra jefes son intensos y el modo Bestia es un desahogo. Totalmente recomendado.",
    ),
    (
        "Tatiana Montoya",
        BEAST,
        4,
        "2026-11-12 18:00",
        "Un survival muy sólido y entretenido",
        "Gestionar armas, comida y refugios mantiene el ritmo de supervivencia. Ambientación sombría y "
        "banda sonora que mete mucha presión. Me queda esperar más contenido.",
    ),
]


def _correo(nombre: str) -> str:
    base = nombre.lower().replace(" ", ".")
    for a, b in zip("áéíóúñü", "aeiounu", strict=True):
        base = base.replace(a, b)
    return base + DOMINIO


def main() -> None:
    conn = psycopg2.connect(get_settings().DATABASE_URL)
    cur = conn.cursor()

    if BORRAR:
        cur.execute(
            "DELETE FROM resena WHERE id_usuario IN (SELECT id_usuario FROM usuario WHERE correo LIKE %s)",
            ("%" + DOMINIO,),
        )
        r = cur.rowcount
        cur.execute("DELETE FROM usuario WHERE correo LIKE %s", ("%" + DOMINIO,))
        print(f"Eliminadas {r} reseñas y {cur.rowcount} usuarios de demostración.")
        (conn.rollback if DRY else conn.commit)()
        return

    ids = {}
    for nombre_juego in (REQUIEM, BEAST):
        cur.execute("SELECT id_juego FROM juego WHERE lower(nombre) = lower(%s)", (nombre_juego,))
        fila = cur.fetchone()
        if not fila:
            sys.exit(f"No encontré el juego '{nombre_juego}' en la base de datos.")
        ids[nombre_juego] = fila[0]

    nuevos_u = nuevas_r = 0
    for nombre, juego, nota, fecha, titulo, comentario in RESENAS:
        correo = _correo(nombre)
        cur.execute("SELECT id_usuario FROM usuario WHERE correo = %s", (correo,))
        fila = cur.fetchone()
        if fila:
            id_usuario = fila[0]
        else:
            cur.execute(
                "INSERT INTO usuario (nombre, correo, contrasena, rol, is_active, is_verified) "
                "VALUES (%s, %s, %s, 'user', TRUE, TRUE) RETURNING id_usuario",
                (nombre, correo, hash_password(secrets.token_urlsafe(24))),
            )
            id_usuario = cur.fetchone()[0]
            nuevos_u += 1
        cur.execute(
            "SELECT 1 FROM resena WHERE id_usuario = %s AND id_juego = %s", (id_usuario, ids[juego])
        )
        if cur.fetchone():
            continue
        cur.execute(
            "INSERT INTO resena (id_usuario, id_juego, titulo, comentario, calificacion, "
            "fecha_publicacion) VALUES (%s, %s, %s, %s, %s, %s)",
            (id_usuario, ids[juego], titulo, comentario, nota, fecha),
        )
        nuevas_r += 1

    print(
        f"{'(simulacro) ' if DRY else ''}Usuarios nuevos: {nuevos_u} | Reseñas nuevas: {nuevas_r}"
    )
    (conn.rollback if DRY else conn.commit)()


if __name__ == "__main__":
    main()
