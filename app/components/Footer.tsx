import footerMark from "../img/footer_sportsee.png";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p className="site-footer__copyright">
          ©Sportsee Tous droits réservés
        </p>

        <div className="site-footer__nav">
          <a href="#" className="site-footer__link">
            Conditions générales
          </a>
          <a href="#" className="site-footer__link">
            Contact
          </a>
          <img
            src={footerMark}
            alt=""
            aria-hidden="true"
            className="site-footer__mark"
          />
        </div>
      </div>
    </footer>
  );
}