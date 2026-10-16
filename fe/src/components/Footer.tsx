import {
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaPinterestP,
  FaInstagram,
} from "react-icons/fa6";

function Footer() {

  return (

    <footer className="footer">

      <div className="container container-footer">

        <div className="menu-footer">

          <div className="contact-info">

            <p className="title-footer">
              Información de Contacto
            </p>

            <ul>

              <li>Dirección: Colombia</li>

              <li>Teléfono: +57 3196896747</li>

              <li>Email: promohunt@gmail.com</li>

            </ul>

            <div className="social-icons">

              <span className="facebook">
                <FaFacebookF />
              </span>

              <span className="twitter">
                <FaTwitter />
              </span>

              <span className="youtube">
                <FaYoutube />
              </span>

              <span className="pinterest">
                <FaPinterestP />
              </span>

              <span className="instagram">
                <FaInstagram />
              </span>

            </div>

          </div>

          <div className="information">

            <p className="title-footer">
              Información
            </p>

            <ul>

              <li><a href="#">Acerca de Nosotros</a></li>

              <li><a href="#">Información Delivery</a></li>

              <li><a href="#">Políticas de Privacidad</a></li>

              <li><a href="#">Términos y condiciones</a></li>

              <li><a href="#">Contáctanos</a></li>

            </ul>

          </div>

          <div className="my-account">

            <p className="title-footer">
              Mi Cuenta
            </p>

            <ul>

              <li><a href="#">Mi cuenta</a></li>

              <li><a href="#">Historial</a></li>

              <li><a href="#">Lista de deseos</a></li>

              <li><a href="#">Boletín</a></li>

              <li><a href="#">Reembolsos</a></li>

            </ul>

          </div>

        </div>

        <div className="copyright">

          <p>
            Desarrollado por El Equipo Peligro © 2026
          </p>

        </div>

      </div>

    </footer>

  );

}

export default Footer;