from flask import Flask, jsonify, request, session
from flask_cors import CORS
from database import obtener_conexion, obtener_cursor
import psycopg2

app = Flask(__name__)

# ===========================
# CONFIGURACIÓN DE SESIÓN
# ===========================

app.secret_key = "clave-secreta-proyecto"

app.config["SESSION_COOKIE_NAME"] = "promohunt_session"
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = False


    # ===========================
    # CORS
    # ===========================

CORS(
    app,
        supports_credentials=True,
        origins=[
            "http://localhost:5173"
        ]
    )


    # ===========================
    # CONEXIÓN CON MYSQL
    # ===========================

conexion = None




    # ===========================
    # VERIFICAR CONEXIÓN MYSQL
    # ===========================

def verificar_conexion():
    global conexion
    try:
        if conexion is None or conexion.closed:
            conexion = obtener_conexion()
            print("✅ Conexión a PostgreSQL creada")
        else:
            cur = conexion.cursor()
            cur.execute("SELECT 1")
            cur.close()
    except (psycopg2.Error, Exception) as error:
        print("❌ Error con PostgreSQL:", error)
        try:
            if conexion and not conexion.closed:
                conexion.close()
        except Exception:
            pass
        conexion = obtener_conexion()
        print("✅ Nueva conexión a PostgreSQL creada")


    # ===========================
    # RUTA PRINCIPAL
    # ===========================

@app.route("/")
def inicio():

        return {
            "mensaje": "Backend de PromoHunt funcionando"
        }


    # ===========================
    # OBTENER JUEGOS
    # ===========================

@app.route("/api/juegos", methods=["GET"])
def obtener_juegos():

        verificar_conexion()

        cursor = obtener_cursor(conexion)

        consulta = """
            SELECT
                juego.id_juego,
                juego.nombre,
                juego.fecha_lanzamiento,
                juego.imagen,
                descuento.id_descuento,
                descuento.id_plataforma,
                descuento.precio_original,
                descuento.precio_descuento,
                descuento.porcentaje_descuento,
                descuento.ahorro,
                descuento.estado,
                plataforma.nombre AS plataforma
            FROM juego
            INNER JOIN descuento
                ON juego.id_juego = descuento.id_juego
            INNER JOIN plataforma
                ON descuento.id_plataforma = plataforma.id_plataforma
            WHERE descuento.estado = 'Activo'
        """

        cursor.execute(consulta)

        juegos = cursor.fetchall()

        cursor.close()

        return jsonify(juegos)


    # =====================================================
    # OBTENER DETALLE DE UN JUEGO
    # =====================================================

@app.route("/api/juegos/<int:id_juego>", methods=["GET"])
def obtener_detalle_juego(id_juego):

        verificar_conexion()

        cursor = obtener_cursor(conexion)

        # ==========================================
        # INFORMACIÓN DEL JUEGO
        # ==========================================

        cursor.execute("""
            SELECT
                juego.id_juego,
                juego.nombre,
                juego.fecha_lanzamiento,
                juego.imagen
            FROM juego
            WHERE juego.id_juego = %s
        """, (id_juego,))

        juego = cursor.fetchone()


        if not juego:

            cursor.close()

            return jsonify({
                "ok": False,
                "mensaje": "Juego no encontrado"
            }), 404


        # ==========================================
        # DESCUENTOS Y PLATAFORMAS
        # ==========================================

        cursor.execute("""
            SELECT
                descuento.id_descuento,
                descuento.id_plataforma,
                descuento.precio_original,
                descuento.precio_descuento,
                descuento.porcentaje_descuento,
                descuento.ahorro,
                descuento.estado,
                plataforma.nombre AS plataforma
            FROM descuento
            INNER JOIN plataforma
                ON descuento.id_plataforma = plataforma.id_plataforma
            WHERE descuento.id_juego = %s
            AND descuento.estado = 'Activo'
            ORDER BY descuento.precio_descuento ASC
        """, (id_juego,))

        descuentos = cursor.fetchall()

        cursor.close()


        # ==========================================
        # RESPUESTA
        # ==========================================

        return jsonify({

            "ok": True,

            "juego": juego,

            "descuentos": descuentos

        })


    # =====================================================
    # LOGIN
    # =====================================================

@app.route("/api/login", methods=["POST"])
def login():

        verificar_conexion()

        datos = request.get_json()

        correo = datos.get("correo")
        contrasena = datos.get("contrasena")

        cursor = obtener_cursor(conexion)

        consulta = """
            SELECT
                id_usuario,
                nombre,
                correo,
                contrasena,
                foto_perfil,
                fecha_registro,
                rol
            FROM usuario
            WHERE correo = %s
            AND contrasena = %s
        """

        cursor.execute(
            consulta,
            (correo, contrasena)
        )

        usuario = cursor.fetchone()

        cursor.close()

        if not usuario:

            return jsonify({
                "ok": False,
                "mensaje": "Correo o contraseña incorrectos"
            }), 401


        # ===========================
        # GUARDAR SESIÓN
        # ===========================

        session["id_usuario"] = usuario["id_usuario"]

        session.modified = True

        print(
            "✅ LOGIN - Sesión creada:",
            dict(session)
        )


        # No enviar contraseña a React

        usuario.pop("contrasena", None)


        return jsonify({

            "ok": True,

            "usuario": usuario

        })


    # =====================================================
    # SABER SI HAY UN USUARIO LOGUEADO
    # =====================================================

@app.route("/api/usuario/me", methods=["GET"])
def usuario_actual():

        verificar_conexion()

        print("================================")
        print("ENTRANDO A /api/usuario/me")
        print("SESSION:", dict(session))
        print("================================")

        id_usuario = session.get("id_usuario")

        if not id_usuario:

            return jsonify({
                "logueado": False,
                "session": dict(session)
            }), 401


        cursor = obtener_cursor(conexion)

        consulta = """
            SELECT
                id_usuario,
                nombre,
                correo,
                foto_perfil,
                fecha_registro,
                rol
            FROM usuario
            WHERE id_usuario = %s
        """

        cursor.execute(
            consulta,
            (id_usuario,)
        )

        usuario = cursor.fetchone()

        cursor.close()


        if not usuario:

            session.clear()

            return jsonify({
                "logueado": False
            }), 401


        return jsonify({

            "logueado": True,

            "usuario": usuario

        })


    # =====================================================
    # OBTENER PERFIL COMPLETO
    # =====================================================

@app.route("/api/usuario/perfil", methods=["GET"])
def perfil_usuario():

        verificar_conexion()

        id_usuario = session.get("id_usuario")

        print(
            "🔎 /perfil - Sesión recibida:",
            dict(session)
        )


        if not id_usuario:

            return jsonify({

                "logueado": False

            }), 401


        cursor = obtener_cursor(conexion)


        # ===========================
        # DATOS DEL USUARIO
        # ===========================

        cursor.execute("""
            SELECT
                id_usuario,
                nombre,
                correo,
                foto_perfil,
                fecha_registro,
                rol
            FROM usuario
            WHERE id_usuario = %s
        """, (id_usuario,))

        usuario = cursor.fetchone()


        if not usuario:

            cursor.close()

            return jsonify({

                "logueado": False

            }), 401


        # ===========================
        # CROSSPLAY
        # ===========================

        cursor.execute("""
            SELECT *
            FROM crossplay
            WHERE id_usuario = %s
        """, (id_usuario,))

        crossplay = cursor.fetchone()


        cursor.close()


        return jsonify({

            "logueado": True,

            "usuario": usuario,

            "crossplay": crossplay

        })


    # =====================================================
    # EDITAR PERFIL
    # =====================================================

@app.route("/api/usuario/editar", methods=["PUT"])
def editar_perfil():

        verificar_conexion()

        id_usuario = session.get("id_usuario")

        if not id_usuario:

            return jsonify({
                "ok": False,
                "mensaje": "No hay una sesión activa"
            }), 401


        datos = request.get_json()

        nombre = datos.get("nombre")
        correo = datos.get("correo")
        contrasena_actual = datos.get("contrasena_actual")
        nueva_contrasena = datos.get("nueva_contrasena")


        if not nombre or not correo:

            return jsonify({
                "ok": False,
                "mensaje": "El nombre y el correo son obligatorios"
            }), 400


        cursor = obtener_cursor(conexion)


        # ==========================================
        # VERIFICAR USUARIO
        # ==========================================

        cursor.execute("""
            SELECT
                id_usuario,
                nombre,
                correo,
                contrasena
            FROM usuario
            WHERE id_usuario = %s
        """, (id_usuario,))

        usuario = cursor.fetchone()


        if not usuario:

            cursor.close()

            return jsonify({
                "ok": False,
                "mensaje": "Usuario no encontrado"
            }), 404


        # ==========================================
        # VERIFICAR SI EL CORREO YA EXISTE
        # ==========================================

        cursor.execute("""
            SELECT id_usuario
            FROM usuario
            WHERE correo = %s
            AND id_usuario != %s
        """, (correo, id_usuario))

        correo_existente = cursor.fetchone()


        if correo_existente:

            cursor.close()

            return jsonify({
                "ok": False,
                "mensaje": "Ese correo ya está siendo utilizado"
            }), 400


        # ==========================================
        # CAMBIAR CONTRASEÑA
        # ==========================================

        if nueva_contrasena:

            if not contrasena_actual:

                cursor.close()

                return jsonify({
                    "ok": False,
                    "mensaje": "Debes ingresar tu contraseña actual"
                }), 400


            if contrasena_actual != usuario["contrasena"]:

                cursor.close()

                return jsonify({
                    "ok": False,
                    "mensaje": "La contraseña actual es incorrecta"
                }), 400


            cursor.execute("""
                UPDATE usuario
                SET
                    nombre = %s,
                    correo = %s,
                    contrasena = %s
                WHERE id_usuario = %s
            """, (
                nombre,
                correo,
                nueva_contrasena,
                id_usuario
            ))

        else:

            # ==========================================
            # SOLO NOMBRE Y CORREO
            # ==========================================

            cursor.execute("""
                UPDATE usuario
                SET
                    nombre = %s,
                    correo = %s
                WHERE id_usuario = %s
            """, (
                nombre,
                correo,
                id_usuario
            ))


        conexion.commit()

        cursor.close()


        return jsonify({

            "ok": True,

            "mensaje": "Perfil actualizado correctamente"

        })


    # =====================================================
    # CERRAR SESIÓN
    # =====================================================

@app.route("/api/logout", methods=["POST"])
def logout():

        session.clear()

        print("🚪 Sesión cerrada")


        return jsonify({

            "ok": True,

            "mensaje": "Sesión cerrada"

        })

    # ===========================
# REGISTRO DE USUARIO
# ===========================

@app.route("/api/registrate", methods=["POST"])
def registrate():

    try:

        datos = request.get_json()

        nombre = datos.get("nombre", "").strip()
        correo = datos.get("correo", "").strip()
        contrasena = datos.get("contrasena", "").strip()


        # ===========================
        # VALIDAR DATOS
        # ===========================

        if not nombre or not correo or not contrasena:

            return jsonify({
                "ok": False,
                "mensaje": "Todos los campos son obligatorios"
            }), 400


        # ===========================
        # VERIFICAR CORREO
        # ===========================

        cursor = obtener_cursor(conexion)

        cursor.execute("""
            SELECT id_usuario
            FROM usuario
            WHERE correo = %s
        """, (correo,))

        usuario_existente = cursor.fetchone()


        if usuario_existente:

            cursor.close()

            return jsonify({
                "ok": False,
                "mensaje": "Este correo ya está registrado"
            }), 409


        # ===========================
        # CREAR USUARIO
        # ===========================

        cursor.execute("""
            INSERT INTO usuario
            (
                nombre,
                correo,
                contrasena,
                rol
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s
            )
        """, (
            nombre,
            correo,
            contrasena,
            "user"
        ))


        conexion.commit()

        cursor.close()


        return jsonify({
            "ok": True,
            "mensaje": "Usuario registrado correctamente"
        }), 201


    except psycopg2.Error as error:

        print(
            "❌ Error registrando usuario:",
            error
        )

        return jsonify({
            "ok": False,
            "mensaje": "Error al registrar el usuario"
        }), 500

    # =====================================================
    # ADMINISTRACIÓN - JUEGOS
    # =====================================================

def verificar_admin():

        id_usuario = session.get("id_usuario")

        if not id_usuario:
            return False

        cursor = obtener_cursor(conexion)

        cursor.execute("""
            SELECT rol
            FROM usuario
            WHERE id_usuario = %s
        """, (id_usuario,))

        usuario = cursor.fetchone()

        cursor.close()

        if not usuario:
            return False

        return str(usuario["rol"]).lower() == "admin"


    # =====================================================
    # OBTENER TODOS LOS JUEGOS PARA ADMIN
    # =====================================================

@app.route("/api/admin/juegos", methods=["GET"])
def admin_obtener_juegos():

        verificar_conexion()

        # Verificar administrador
        if not verificar_admin():

            return jsonify({
                "ok": False,
                "mensaje": "No tienes permisos de administrador"
            }), 403


        cursor = obtener_cursor(conexion)

        cursor.execute("""
    SELECT
        juego.id_juego,
        juego.nombre,
        juego.descripcion,
        juego.fecha_lanzamiento,
        juego.imagen,
        juego.portada,
        juego.trailer,
        juego.edad_minima,
        juego.idiomas_disponibles,
        juego.requisitos_minimos,
        juego.requisitos_recomendados,
        juego.modo_juego,
        juego.estado,

        juego.id_categoria,
        categoria.nombre AS categoria,

        juego.id_genero,
        genero.nombre AS genero,

        juego.id_desarrollador,
        desarrollador.nombre AS desarrollador,

        juego.id_noticia

    FROM juego

    LEFT JOIN categoria
        ON juego.id_categoria = categoria.id_categoria

    LEFT JOIN genero
        ON juego.id_genero = genero.id_genero

    LEFT JOIN desarrollador
        ON juego.id_desarrollador = desarrollador.id_desarrollador

    ORDER BY juego.id_juego ASC
""")

        juegos = cursor.fetchall()

        cursor.close()


        return jsonify({

            "ok": True,

            "juegos": juegos

        })


    # =====================================================
    # AGREGAR JUEGO
    # =====================================================

@app.route("/api/admin/juegos", methods=["POST"])
def admin_agregar_juego():

        verificar_conexion()

        if not verificar_admin():

            return jsonify({
                "ok": False,
                "mensaje": "No tienes permisos de administrador"
            }), 403


        datos = request.get_json()


        nombre = datos.get("nombre")
        descripcion = datos.get("descripcion")
        fecha_lanzamiento = datos.get("fecha_lanzamiento")
        imagen = datos.get("imagen")
        portada = datos.get("portada")
        trailer = datos.get("trailer")
        edad_minima = datos.get("edad_minima")
        idiomas_disponibles = datos.get("idiomas_disponibles")
        requisitos_minimos = datos.get("requisitos_minimos")
        requisitos_recomendados = datos.get("requisitos_recomendados")
        modo_juego = datos.get("modo_juego")
        estado = datos.get("estado")
        id_categoria = datos.get("id_categoria")
        id_genero = datos.get("id_genero")
        id_desarrollador = datos.get("id_desarrollador")
        id_noticia = datos.get("id_noticia")


        if not nombre:

            return jsonify({
                "ok": False,
                "mensaje": "El nombre del juego es obligatorio"
            }), 400


        cursor = obtener_cursor(conexion)


        cursor.execute("""
            INSERT INTO juego (
                nombre,
                descripcion,
                fecha_lanzamiento,
                imagen,
                portada,
                trailer,
                edad_minima,
                idiomas_disponibles,
                requisitos_minimos,
                requisitos_recomendados,
                modo_juego,
                estado,
                id_categoria,
                id_genero,
                id_desarrollador,
                id_noticia
            )
            VALUES (
                %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s, %s
            )
        """, (
            nombre,
            descripcion,
            fecha_lanzamiento,
            imagen,
            portada,
            trailer,
            edad_minima,
            idiomas_disponibles,
            requisitos_minimos,
            requisitos_recomendados,
            modo_juego,
            estado,
            id_categoria,
            id_genero,
            id_desarrollador,
            id_noticia
        ))


        conexion.commit()

        cursor.execute('SELECT lastval() AS id')
        row = cursor.fetchone()
        id_nuevo = row['id'] if row else None

        cursor.close()


        return jsonify({

            "ok": True,

            "mensaje": "Juego agregado correctamente",

            "id_juego": id_nuevo

        }), 201


    # =====================================================
    # EDITAR JUEGO
    # =====================================================

@app.route("/api/admin/juegos/<int:id_juego>", methods=["PUT"])
def admin_editar_juego(id_juego):

        verificar_conexion()

        if not verificar_admin():

            return jsonify({
                "ok": False,
                "mensaje": "No tienes permisos de administrador"
            }), 403


        datos = request.get_json()


        nombre = datos.get("nombre")
        descripcion = datos.get("descripcion")
        fecha_lanzamiento = datos.get("fecha_lanzamiento")
        imagen = datos.get("imagen")
        portada = datos.get("portada")
        trailer = datos.get("trailer")
        edad_minima = datos.get("edad_minima")
        idiomas_disponibles = datos.get("idiomas_disponibles")
        requisitos_minimos = datos.get("requisitos_minimos")
        requisitos_recomendados = datos.get("requisitos_recomendados")
        modo_juego = datos.get("modo_juego")
        estado = datos.get("estado")
        id_categoria = datos.get("id_categoria")
        id_genero = datos.get("id_genero")
        id_desarrollador = datos.get("id_desarrollador")
        id_noticia = datos.get("id_noticia")


        if not nombre:

            return jsonify({
                "ok": False,
                "mensaje": "El nombre del juego es obligatorio"
            }), 400


        cursor = obtener_cursor(conexion)


        cursor.execute("""
            UPDATE juego
            SET
                nombre = %s,
                descripcion = %s,
                fecha_lanzamiento = %s,
                imagen = %s,
                portada = %s,
                trailer = %s,
                edad_minima = %s,
                idiomas_disponibles = %s,
                requisitos_minimos = %s,
                requisitos_recomendados = %s,
                modo_juego = %s,
                estado = %s,
                id_categoria = %s,
                id_genero = %s,
                id_desarrollador = %s,
                id_noticia = %s
            WHERE id_juego = %s
        """, (
            nombre,
            descripcion,
            fecha_lanzamiento,
            imagen,
            portada,
            trailer,
            edad_minima,
            idiomas_disponibles,
            requisitos_minimos,
            requisitos_recomendados,
            modo_juego,
            estado,
            id_categoria,
            id_genero,
            id_desarrollador,
            id_noticia,
            id_juego
        ))


        conexion.commit()


        if cursor.rowcount == 0:

            cursor.close()

            return jsonify({
                "ok": False,
                "mensaje": "Juego no encontrado"
            }), 404


        cursor.close()


        return jsonify({

            "ok": True,

            "mensaje": "Juego actualizado correctamente"

        })


    # =====================================================
    # ELIMINAR JUEGO
    # =====================================================

@app.route("/api/admin/juegos/<int:id_juego>", methods=["DELETE"])
def admin_eliminar_juego(id_juego):

        verificar_conexion()

        if not verificar_admin():

            return jsonify({
                "ok": False,
                "mensaje": "No tienes permisos de administrador"
            }), 403


        cursor = obtener_cursor(conexion)


        cursor.execute("""
            DELETE FROM juego
            WHERE id_juego = %s
        """, (id_juego,))


        conexion.commit()


        if cursor.rowcount == 0:

            cursor.close()

            return jsonify({
                "ok": False,
                "mensaje": "Juego no encontrado"
            }), 404


        cursor.close()


        return jsonify({

            "ok": True,

            "mensaje": "Juego eliminado correctamente"

        })

# =====================================================
# ADMINISTRACIÓN - DESCUENTOS
# =====================================================

# =====================================================
    # OBTENER DESCUENTOS (ADMIN)
    # =====================================================

@app.route("/api/admin/descuentos", methods=["GET"])
def admin_obtener_descuentos():

        verificar_conexion()

        if not verificar_admin():

            return jsonify({
                "ok": False,
                "mensaje": "No tienes permisos de administrador"
            }), 403

        cursor = obtener_cursor(conexion)

        cursor.execute("""
            SELECT
                descuento.id_descuento,
                descuento.id_juego,
                juego.nombre AS juego,
                descuento.id_plataforma,
                plataforma.nombre AS plataforma,
                descuento.precio_original,
                descuento.precio_descuento,
                descuento.porcentaje_descuento,
                descuento.ahorro,
                descuento.fecha_inicio,
                descuento.fecha_fin,
                descuento.estado
            FROM descuento

            INNER JOIN juego
                ON descuento.id_juego = juego.id_juego

            INNER JOIN plataforma
                ON descuento.id_plataforma = plataforma.id_plataforma

            ORDER BY descuento.id_descuento ASC
        """)

        descuentos = cursor.fetchall()

        cursor.close()

        return jsonify({

            "ok": True,

            "descuentos": descuentos

        })


    # =====================================================
    # AGREGAR DESCUENTO
    # =====================================================

@app.route("/api/admin/descuentos", methods=["POST"])
def admin_agregar_descuento():

        verificar_conexion()

        if not verificar_admin():

            return jsonify({
                "ok": False,
                "mensaje": "No tienes permisos de administrador"
            }), 403

        datos = request.get_json() or {}

        id_juego = datos.get("id_juego")
        id_plataforma = datos.get("id_plataforma")
        precio_original = datos.get("precio_original")
        precio_descuento = datos.get("precio_descuento")
        porcentaje_descuento = datos.get("porcentaje_descuento")
        ahorro = datos.get("ahorro")
        fecha_inicio = datos.get("fecha_inicio")
        fecha_fin = datos.get("fecha_fin")
        estado = datos.get("estado")

        # =================================================
        # VALIDACIONES
        # =================================================

        if not id_juego:

            return jsonify({
                "ok": False,
                "mensaje": "El juego es obligatorio"
            }), 400

        if not id_plataforma:

            return jsonify({
                "ok": False,
                "mensaje": "La plataforma es obligatoria"
            }), 400

        if precio_original is None:

            return jsonify({
                "ok": False,
                "mensaje": "El precio original es obligatorio"
            }), 400

        if precio_descuento is None:

            return jsonify({
                "ok": False,
                "mensaje": "El precio con descuento es obligatorio"
            }), 400

        # =================================================
        # INSERTAR
        # =================================================

        cursor = obtener_cursor(conexion)

        cursor.execute("""
            INSERT INTO descuento (

                id_juego,
                id_plataforma,
                precio_original,
                precio_descuento,
                porcentaje_descuento,
                ahorro,
                fecha_inicio,
                fecha_fin,
                estado

            )

            VALUES (

                %s, %s, %s,
                %s, %s, %s,
                %s, %s, %s

            )
        """, (

            id_juego,
            id_plataforma,
            precio_original,
            precio_descuento,
            porcentaje_descuento,
            ahorro,
            fecha_inicio,
            fecha_fin,
            estado

        ))

        conexion.commit()

        cursor.execute('SELECT lastval() AS id')
        row = cursor.fetchone()
        id_nuevo = row['id'] if row else None

        cursor.close()

        return jsonify({

            "ok": True,

            "mensaje": "Descuento agregado correctamente",

            "id_descuento": id_nuevo

        }), 201


    # =====================================================
    # EDITAR DESCUENTO
    # =====================================================

@app.route("/api/admin/descuentos/<int:id_descuento>", methods=["PUT"])
def admin_editar_descuento(id_descuento):

        verificar_conexion()

        if not verificar_admin():

            return jsonify({
                "ok": False,
                "mensaje": "No tienes permisos de administrador"
            }), 403

        datos = request.get_json() or {}

        id_juego = datos.get("id_juego")
        id_plataforma = datos.get("id_plataforma")
        precio_original = datos.get("precio_original")
        precio_descuento = datos.get("precio_descuento")
        porcentaje_descuento = datos.get("porcentaje_descuento")
        ahorro = datos.get("ahorro")
        fecha_inicio = datos.get("fecha_inicio")
        fecha_fin = datos.get("fecha_fin")
        estado = datos.get("estado")

        # =================================================
        # VALIDACIONES
        # =================================================

        if not id_juego:

            return jsonify({
                "ok": False,
                "mensaje": "El juego es obligatorio"
            }), 400

        if not id_plataforma:

            return jsonify({
                "ok": False,
                "mensaje": "La plataforma es obligatoria"
            }), 400

        if precio_original is None:

            return jsonify({
                "ok": False,
                "mensaje": "El precio original es obligatorio"
            }), 400

        if precio_descuento is None:

            return jsonify({
                "ok": False,
                "mensaje": "El precio con descuento es obligatorio"
            }), 400

        # =================================================
        # ACTUALIZAR
        # =================================================

        cursor = obtener_cursor(conexion)

        cursor.execute("""
            UPDATE descuento

            SET

                id_juego = %s,
                id_plataforma = %s,
                precio_original = %s,
                precio_descuento = %s,
                porcentaje_descuento = %s,
                ahorro = %s,
                fecha_inicio = %s,
                fecha_fin = %s,
                estado = %s

            WHERE id_descuento = %s

        """, (

            id_juego,
            id_plataforma,
            precio_original,
            precio_descuento,
            porcentaje_descuento,
            ahorro,
            fecha_inicio,
            fecha_fin,
            estado,
            id_descuento

        ))

        conexion.commit()

        if cursor.rowcount == 0:

            cursor.close()

            return jsonify({

                "ok": False,

                "mensaje": "Descuento no encontrado"

            }), 404

        cursor.close()

        return jsonify({

            "ok": True,

            "mensaje": "Descuento actualizado correctamente"

        })


    # =====================================================
    # ELIMINAR DESCUENTO
    # =====================================================

@app.route("/api/admin/descuentos/<int:id_descuento>", methods=["DELETE"])
def admin_eliminar_descuento(id_descuento):

        verificar_conexion()

        if not verificar_admin():

            return jsonify({
                "ok": False,
                "mensaje": "No tienes permisos de administrador"
            }), 403

        cursor = obtener_cursor(conexion)

        cursor.execute("""
            DELETE FROM descuento

            WHERE id_descuento = %s

        """, (id_descuento,))

        conexion.commit()

        if cursor.rowcount == 0:

            cursor.close()

            return jsonify({

                "ok": False,

                "mensaje": "Descuento no encontrado"

            }), 404

        cursor.close()

        return jsonify({

            "ok": True,

            "mensaje": "Descuento eliminado correctamente"

        })

# =====================================================
# ADMINISTRACIÓN - DESARROLLADORES
# =====================================================

# =====================================================
    # OBTENER TODOS LOS DESARROLLADORES
    # =====================================================

@app.route("/api/admin/desarrolladores", methods=["GET"])
def admin_obtener_desarrolladores():

        verificar_conexion()

        if not verificar_admin():

            return jsonify({
                "ok": False,
                "mensaje": "No tienes permisos de administrador"
            }), 403

        cursor = obtener_cursor(conexion)

        cursor.execute("""
            SELECT
                id_desarrollador,
                nombre,
                pais,
                ciudad,
                fundacion,
                sitio_web,
                logo,
                descripcion
            FROM desarrollador
            ORDER BY id_desarrollador ASC
        """)

        desarrolladores = cursor.fetchall()

        cursor.close()

        return jsonify({

            "ok": True,

            "desarrolladores": desarrolladores

        })


    # =====================================================
    # AGREGAR DESARROLLADOR
    # =====================================================

@app.route("/api/admin/desarrolladores", methods=["POST"])
def admin_agregar_desarrollador():

        verificar_conexion()

        if not verificar_admin():

            return jsonify({
                "ok": False,
                "mensaje": "No tienes permisos de administrador"
            }), 403

        datos = request.get_json() or {}

        nombre = datos.get("nombre")
        pais = datos.get("pais")
        ciudad = datos.get("ciudad")
        fundacion = datos.get("fundacion")
        sitio_web = datos.get("sitio_web")
        logo = datos.get("logo")
        descripcion = datos.get("descripcion")

        # =================================================
        # VALIDACIONES
        # =================================================

        if not nombre:

            return jsonify({
                "ok": False,
                "mensaje": "El nombre del desarrollador es obligatorio"
            }), 400

        # =================================================
        # INSERTAR
        # =================================================

        cursor = obtener_cursor(conexion)

        cursor.execute("""
            INSERT INTO desarrollador (

                nombre,
                pais,
                ciudad,
                fundacion,
                sitio_web,
                logo,
                descripcion

            )

            VALUES (

                %s, %s, %s,
                %s, %s, %s,
                %s

            )
        """, (

            nombre,
            pais,
            ciudad,
            fundacion,
            sitio_web,
            logo,
            descripcion

        ))

        conexion.commit()

        cursor.execute('SELECT lastval() AS id')
        row = cursor.fetchone()
        id_nuevo = row['id'] if row else None

        cursor.close()

        return jsonify({

            "ok": True,

            "mensaje": "Desarrollador agregado correctamente",

            "id_desarrollador": id_nuevo

        }), 201


    # =====================================================
    # EDITAR DESARROLLADOR
    # =====================================================

@app.route("/api/admin/desarrolladores/<int:id_desarrollador>", methods=["PUT"])
def admin_editar_desarrollador(id_desarrollador):

        verificar_conexion()

        if not verificar_admin():

            return jsonify({
                "ok": False,
                "mensaje": "No tienes permisos de administrador"
            }), 403

        datos = request.get_json() or {}

        nombre = datos.get("nombre")
        pais = datos.get("pais")
        ciudad = datos.get("ciudad")
        fundacion = datos.get("fundacion")
        sitio_web = datos.get("sitio_web")
        logo = datos.get("logo")
        descripcion = datos.get("descripcion")

        # =================================================
        # VALIDACIONES
        # =================================================

        if not nombre:

            return jsonify({
                "ok": False,
                "mensaje": "El nombre del desarrollador es obligatorio"
            }), 400

        # =================================================
        # ACTUALIZAR
        # =================================================

        cursor = obtener_cursor(conexion)

        cursor.execute("""
            UPDATE desarrollador

            SET

                nombre = %s,
                pais = %s,
                ciudad = %s,
                fundacion = %s,
                sitio_web = %s,
                logo = %s,
                descripcion = %s

            WHERE id_desarrollador = %s

        """, (

            nombre,
            pais,
            ciudad,
            fundacion,
            sitio_web,
            logo,
            descripcion,
            id_desarrollador

        ))

        conexion.commit()

        if cursor.rowcount == 0:

            cursor.close()

            return jsonify({

                "ok": False,

                "mensaje": "Desarrollador no encontrado"

            }), 404

        cursor.close()

        return jsonify({

            "ok": True,

            "mensaje": "Desarrollador actualizado correctamente"

        })


    # =====================================================
    # ELIMINAR DESARROLLADOR
    # =====================================================

@app.route("/api/admin/desarrolladores/<int:id_desarrollador>", methods=["DELETE"])
def admin_eliminar_desarrollador(id_desarrollador):

        verificar_conexion()

        if not verificar_admin():

            return jsonify({
                "ok": False,
                "mensaje": "No tienes permisos de administrador"
            }), 403

        cursor = obtener_cursor(conexion)

        cursor.execute("""
            DELETE FROM desarrollador

            WHERE id_desarrollador = %s

        """, (id_desarrollador,))

        conexion.commit()

        if cursor.rowcount == 0:

            cursor.close()

            return jsonify({

                "ok": False,

                "mensaje": "Desarrollador no encontrado"

            }), 404

        cursor.close()

        return jsonify({

            "ok": True,

            "mensaje": "Desarrollador eliminado correctamente"

        })

# =====================================================
# ADMINISTRACIÓN - GÉNEROS
# =====================================================

# =====================================================
    # OBTENER TODOS LOS GÉNEROS
    # =====================================================

@app.route("/api/admin/generos", methods=["GET"])
def admin_obtener_generos():

        verificar_conexion()

        if not verificar_admin():

            return jsonify({
                "ok": False,
                "mensaje": "No tienes permisos de administrador"
            }), 403

        cursor = obtener_cursor(conexion)

        cursor.execute("""
            SELECT
                id_genero,
                nombre,
                descripcion,
                fecha_creacion
            FROM genero
            ORDER BY id_genero ASC
        """)

        generos = cursor.fetchall()

        cursor.close()

        return jsonify({

            "ok": True,

            "generos": generos

        })


    # =====================================================
    # AGREGAR GÉNERO
    # =====================================================

@app.route("/api/admin/generos", methods=["POST"])
def admin_agregar_genero():

        verificar_conexion()

        if not verificar_admin():

            return jsonify({
                "ok": False,
                "mensaje": "No tienes permisos de administrador"
            }), 403

        datos = request.get_json() or {}

        nombre = datos.get("nombre")
        descripcion = datos.get("descripcion")
        fecha_creacion = datos.get("fecha_creacion")

        # =================================================
        # VALIDACIONES
        # =================================================

        if not nombre:

            return jsonify({
                "ok": False,
                "mensaje": "El nombre del género es obligatorio"
            }), 400

        # =================================================
        # INSERTAR
        # =================================================

        cursor = obtener_cursor(conexion)

        cursor.execute("""
            INSERT INTO genero (

                nombre,
                descripcion,
                fecha_creacion

            )

            VALUES (

                %s, %s, %s

            )
        """, (

            nombre,
            descripcion,
            fecha_creacion

        ))

        conexion.commit()

        cursor.execute('SELECT lastval() AS id')
        row = cursor.fetchone()
        id_nuevo = row['id'] if row else None

        cursor.close()

        return jsonify({

            "ok": True,

            "mensaje": "Género agregado correctamente",

            "id_genero": id_nuevo

        }), 201


    # =====================================================
    # EDITAR GÉNERO
    # =====================================================

@app.route("/api/admin/generos/<int:id_genero>", methods=["PUT"])
def admin_editar_genero(id_genero):

        verificar_conexion()

        if not verificar_admin():

            return jsonify({
                "ok": False,
                "mensaje": "No tienes permisos de administrador"
            }), 403

        datos = request.get_json() or {}

        nombre = datos.get("nombre")
        descripcion = datos.get("descripcion")
        fecha_creacion = datos.get("fecha_creacion")

        # =================================================
        # VALIDACIONES
        # =================================================

        if not nombre:

            return jsonify({
                "ok": False,
                "mensaje": "El nombre del género es obligatorio"
            }), 400

        # =================================================
        # ACTUALIZAR
        # =================================================

        cursor = obtener_cursor(conexion)

        cursor.execute("""
            UPDATE genero

            SET

                nombre = %s,
                descripcion = %s,
                fecha_creacion = %s

            WHERE id_genero = %s

        """, (

            nombre,
            descripcion,
            fecha_creacion,
            id_genero

        ))

        conexion.commit()

        if cursor.rowcount == 0:

            cursor.close()

            return jsonify({

                "ok": False,

                "mensaje": "Género no encontrado"

            }), 404

        cursor.close()

        return jsonify({

            "ok": True,

            "mensaje": "Género actualizado correctamente"

        })


    # =====================================================
    # ELIMINAR GÉNERO
    # =====================================================

@app.route("/api/admin/generos/<int:id_genero>", methods=["DELETE"])
def admin_eliminar_genero(id_genero):

        verificar_conexion()

        if not verificar_admin():

            return jsonify({
                "ok": False,
                "mensaje": "No tienes permisos de administrador"
            }), 403

        cursor = obtener_cursor(conexion)

        cursor.execute("""
            DELETE FROM genero

            WHERE id_genero = %s

        """, (id_genero,))

        conexion.commit()

        if cursor.rowcount == 0:

            cursor.close()

            return jsonify({

                "ok": False,

                "mensaje": "Género no encontrado"

            }), 404

        cursor.close()

        return jsonify({

            "ok": True,

            "mensaje": "Género eliminado correctamente"

        })

# =====================================================
# ADMINISTRACIÓN - CATEGORÍA
# =====================================================

    # =====================================================
    # OBTENER TODAS LAS CATEGORÍAS
    # =====================================================

@app.route("/api/admin/categoria", methods=["GET"])
def admin_obtener_categoria():

        verificar_conexion()

        if not verificar_admin():

            return jsonify({
                "ok": False,
                "mensaje": "No tienes permisos de administrador"
            }), 403

        cursor = obtener_cursor(conexion)

        cursor.execute("""
            SELECT
                id_categoria,
                nombre,
                descripcion,
                fecha_creacion
            FROM categoria
            ORDER BY id_categoria ASC
        """)

        categoria = cursor.fetchall()

        cursor.close()

        return jsonify({

            "ok": True,

            "categoria": categoria

        })


    # =====================================================
    # AGREGAR CATEGORÍA
    # =====================================================

@app.route("/api/admin/categoria", methods=["POST"])
def admin_agregar_categoria():

        verificar_conexion()

        if not verificar_admin():

            return jsonify({
                "ok": False,
                "mensaje": "No tienes permisos de administrador"
            }), 403

        datos = request.get_json() or {}

        nombre = datos.get("nombre")
        descripcion = datos.get("descripcion")
        fecha_creacion = datos.get("fecha_creacion")

        # =================================================
        # VALIDACIONES
        # =================================================

        if not nombre:

            return jsonify({
                "ok": False,
                "mensaje": "El nombre de la categoría es obligatorio"
            }), 400

        # =================================================
        # INSERTAR
        # =================================================

        cursor = obtener_cursor(conexion)

        cursor.execute("""
            INSERT INTO categoria (

                nombre,
                descripcion,
                fecha_creacion

            )

            VALUES (

                %s, %s, %s

            )
        """, (

            nombre,
            descripcion,
            fecha_creacion

        ))

        conexion.commit()

        cursor.execute('SELECT lastval() AS id')
        row = cursor.fetchone()
        id_nuevo = row['id'] if row else None

        cursor.close()

        return jsonify({

            "ok": True,

            "mensaje": "Categoría agregada correctamente",

            "id_categoria": id_nuevo

        }), 201


    # =====================================================
    # EDITAR CATEGORÍA
    # =====================================================

@app.route("/api/admin/categoria/<int:id_categoria>", methods=["PUT"])
def admin_editar_categoria(id_categoria):

        verificar_conexion()

        if not verificar_admin():

            return jsonify({
                "ok": False,
                "mensaje": "No tienes permisos de administrador"
            }), 403

        datos = request.get_json() or {}

        nombre = datos.get("nombre")
        descripcion = datos.get("descripcion")
        fecha_creacion = datos.get("fecha_creacion")

        # =================================================
        # VALIDACIONES
        # =================================================

        if not nombre:

            return jsonify({
                "ok": False,
                "mensaje": "El nombre de la categoría es obligatorio"
            }), 400

        # =================================================
        # ACTUALIZAR
        # =================================================

        cursor = obtener_cursor(conexion)

        cursor.execute("""
            UPDATE categoria

            SET

                nombre = %s,
                descripcion = %s,
                fecha_creacion = %s

            WHERE id_categoria = %s

        """, (

            nombre,
            descripcion,
            fecha_creacion,
            id_categoria

        ))

        conexion.commit()

        if cursor.rowcount == 0:

            cursor.close()

            return jsonify({

                "ok": False,

                "mensaje": "Categoría no encontrada"

            }), 404

        cursor.close()

        return jsonify({

            "ok": True,

            "mensaje": "Categoría actualizada correctamente"

        })


    # =====================================================
    # ELIMINAR CATEGORÍA
    # =====================================================

@app.route("/api/admin/categoria/<int:id_categoria>", methods=["DELETE"])
def admin_eliminar_categoria(id_categoria):

        verificar_conexion()

        if not verificar_admin():

            return jsonify({
                "ok": False,
                "mensaje": "No tienes permisos de administrador"
            }), 403

        cursor = obtener_cursor(conexion)

        cursor.execute("""
            DELETE FROM categoria

            WHERE id_categoria = %s

        """, (id_categoria,))

        conexion.commit()

        if cursor.rowcount == 0:

            cursor.close()

            return jsonify({

                "ok": False,

                "mensaje": "Categoría no encontrada"

            }), 404

        cursor.close()

        return jsonify({

            "ok": True,

            "mensaje": "Categoría eliminada correctamente"

        })

# =====================================================
# ADMINISTRACIÓN - RESEÑAS
# =====================================================

    # =====================================================
    # OBTENER TODAS LAS RESEÑAS
    # =====================================================

@app.route("/api/admin/resenas", methods=["GET"])
def admin_obtener_resenas():

        verificar_conexion()

        if not verificar_admin():

            return jsonify({
                "ok": False,
                "mensaje": "No tienes permisos de administrador"
            }), 403

        cursor = obtener_cursor(conexion)

        cursor.execute("""
            SELECT
                resena.id_resena,
                resena.id_usuario,
                usuario.nombre AS usuario,
                resena.id_juego,
                juego.nombre AS juego,
                resena.titulo,
                resena.comentario,
                resena.calificacion,
                resena.fecha_publicacion
            FROM resena

            INNER JOIN usuario
                ON resena.id_usuario = usuario.id_usuario

            INNER JOIN juego
                ON resena.id_juego = juego.id_juego

            ORDER BY resena.id_resena ASC
        """)

        resenas = cursor.fetchall()

        cursor.close()

        return jsonify({

            "ok": True,

            "resenas": resenas

        })


    # =====================================================
    # AGREGAR RESEÑA
    # =====================================================

@app.route("/api/admin/resenas", methods=["POST"])
def admin_agregar_resena():

        verificar_conexion()

        if not verificar_admin():

            return jsonify({
                "ok": False,
                "mensaje": "No tienes permisos de administrador"
            }), 403

        datos = request.get_json() or {}

        id_usuario = datos.get("id_usuario")
        id_juego = datos.get("id_juego")
        titulo = datos.get("titulo")
        comentario = datos.get("comentario")
        calificacion = datos.get("calificacion")
        fecha_publicacion = datos.get("fecha_publicacion")

        # =================================================
        # VALIDACIONES
        # =================================================

        if not id_usuario:

            return jsonify({
                "ok": False,
                "mensaje": "El usuario es obligatorio"
            }), 400

        if not id_juego:

            return jsonify({
                "ok": False,
                "mensaje": "El juego es obligatorio"
            }), 400

        if not titulo:

            return jsonify({
                "ok": False,
                "mensaje": "El título de la reseña es obligatorio"
            }), 400

        if not comentario:

            return jsonify({
                "ok": False,
                "mensaje": "El comentario de la reseña es obligatorio"
            }), 400

        if calificacion is None:

            return jsonify({
                "ok": False,
                "mensaje": "La calificación es obligatoria"
            }), 400

        # =================================================
        # INSERTAR
        # =================================================

        cursor = obtener_cursor(conexion)

        cursor.execute("""
            INSERT INTO resena (

                id_usuario,
                id_juego,
                titulo,
                comentario,
                calificacion,
                fecha_publicacion

            )

            VALUES (

                %s, %s, %s,
                %s, %s, %s

            )
        """, (

            id_usuario,
            id_juego,
            titulo,
            comentario,
            calificacion,
            fecha_publicacion

        ))

        conexion.commit()

        cursor.execute('SELECT lastval() AS id')
        row = cursor.fetchone()
        id_nuevo = row['id'] if row else None

        cursor.close()

        return jsonify({

            "ok": True,

            "mensaje": "Reseña agregada correctamente",

            "id_resena": id_nuevo

        }), 201


    # =====================================================
    # EDITAR RESEÑA
    # =====================================================

@app.route("/api/admin/resenas/<int:id_resena>", methods=["PUT"])
def admin_editar_resena(id_resena):

        verificar_conexion()

        if not verificar_admin():

            return jsonify({
                "ok": False,
                "mensaje": "No tienes permisos de administrador"
            }), 403

        datos = request.get_json() or {}

        id_usuario = datos.get("id_usuario")
        id_juego = datos.get("id_juego")
        titulo = datos.get("titulo")
        comentario = datos.get("comentario")
        calificacion = datos.get("calificacion")
        fecha_publicacion = datos.get("fecha_publicacion")

        # =================================================
        # VALIDACIONES
        # =================================================

        if not id_usuario:

            return jsonify({
                "ok": False,
                "mensaje": "El usuario es obligatorio"
            }), 400

        if not id_juego:

            return jsonify({
                "ok": False,
                "mensaje": "El juego es obligatorio"
            }), 400

        if not titulo:

            return jsonify({
                "ok": False,
                "mensaje": "El título de la reseña es obligatorio"
            }), 400

        if not comentario:

            return jsonify({
                "ok": False,
                "mensaje": "El comentario de la reseña es obligatorio"
            }), 400

        if calificacion is None:

            return jsonify({
                "ok": False,
                "mensaje": "La calificación es obligatoria"
            }), 400

        # =================================================
        # ACTUALIZAR
        # =================================================

        cursor = obtener_cursor(conexion)

        cursor.execute("""
            UPDATE resena

            SET

                id_usuario = %s,
                id_juego = %s,
                titulo = %s,
                comentario = %s,
                calificacion = %s,
                fecha_publicacion = %s

            WHERE id_resena = %s

        """, (

            id_usuario,
            id_juego,
            titulo,
            comentario,
            calificacion,
            fecha_publicacion,
            id_resena

        ))

        conexion.commit()

        if cursor.rowcount == 0:

            cursor.close()

            return jsonify({

                "ok": False,

                "mensaje": "Reseña no encontrada"

            }), 404

        cursor.close()

        return jsonify({

            "ok": True,
            "mensaje": "Reseña actualizada correctamente"

        })


    # =====================================================
    # ELIMINAR RESEÑA
    # =====================================================

@app.route("/api/admin/resenas/<int:id_resena>", methods=["DELETE"])
def admin_eliminar_resena(id_resena):

        verificar_conexion()

        if not verificar_admin():

            return jsonify({
                "ok": False,
                "mensaje": "No tienes permisos de administrador"
            }), 403

        cursor = obtener_cursor(conexion)

        cursor.execute("""
            DELETE FROM resena

            WHERE id_resena = %s

        """, (id_resena,))

        conexion.commit()

        if cursor.rowcount == 0:

            cursor.close()

            return jsonify({

                "ok": False,

                "mensaje": "Reseña no encontrada"

            }), 404

        cursor.close()

        return jsonify({

            "ok": True,

            "mensaje": "Reseña eliminada correctamente"

        })

    # =====================================================
    # EJECUTAR SERVIDOR
    # =====================================================

if __name__ == "__main__":
    verificar_conexion()
    app.run(
            debug=True,
            host="localhost",
            port=5000
        )