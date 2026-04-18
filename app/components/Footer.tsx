import "../css/footer.css";


export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        
        <p className="footer__left">
          ©Sportsee Tous droits réservés
        </p>

        <div className="footer__right">
          <a href="#">Conditions générales</a>
          <a href="#">Contact</a>
          <img src="/Icon-logo.png" alt="logo" className="footer__logo" />
        </div>

      </div>
    </footer>
  );
}