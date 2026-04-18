import Header from "../components/Header";
import "../css/not-found.css";

export default function NotFound() {
  return (
    <>
      <Header />

      <main className="not-found-page">
        <section className="not-found-page__content">
          <img
            src="/Logo.png"
            alt="Logo SportSee"
            className="not-found-page__logo"
          />

          <h1 className="not-found-page__title">404</h1>

          <p className="not-found-page__text">
            Oups, la page demandée est introuvable.
          </p>
        </section>
      </main>
    </>
  );
}