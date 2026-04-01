import { useEffect } from "react";
import { useNavigate } from "react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAppContext } from "../context/AppContext";
import { mockUserInfo } from "../mocks/mockdata";

export default function Profil() {
  const navigate = useNavigate();
  const { isAuthenticated, isCheckingAuth, logout } = useAppContext();
  const { profile, statistics } = mockUserInfo;

  useEffect(() => {
    if (!isCheckingAuth && !isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isCheckingAuth, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  if (isCheckingAuth) {
    return <p>Vérification...</p>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="profile-page-layout">
      <main className="dashboard-page profile-page">
        <div className="dashboard-shell profile-shell">
          <Header onLogout={handleLogout} />

          <section className="profile-main">
            <div className="profile-column">
              <article className="profile-summary-card">
                <img
                  src={profile.profilePicture}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="profile-summary-card__image"
                />

                <div className="profile-summary-card__content">
                  <h1 className="profile-summary-card__name">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  <p className="profile-summary-card__meta">
                    Membre depuis le {profile.createdAt}
                  </p>
                </div>
              </article>

              <article className="profile-details-card">
                <h2 className="profile-details-card__title">Votre profil</h2>
                <hr className="profile-details-card__divider" />

                <div className="profile-details-list">
                  <p className="profile-details-item">Âge : {profile.age}</p>
                  <p className="profile-details-item">
                    Genre : {profile.gender}
                  </p>
                  <p className="profile-details-item">
                    Taille : {profile.height}
                  </p>
                  <p className="profile-details-item">
                    Poids : {profile.weight}
                  </p>
                </div>
              </article>
            </div>

            <section className="profile-stats">
              <h2 className="profile-stats__title">Vos statistiques</h2>
              <p className="profile-stats__subtitle">
                depuis le {profile.createdAt}
              </p>

              <div className="profile-stats-grid">
                <article className="profile-stat-card">
                  <p className="profile-stat-card__label">Temps total couru</p>
                  <p className="profile-stat-card__measure">
                    {statistics.totalDuration}
                  </p>
                </article>

                <article className="profile-stat-card">
                  <p className="profile-stat-card__label">Calories brûlées</p>
                  <p className="profile-stat-card__measure">
                    {statistics.caloriesBurned}
                  </p>
                </article>

                <article className="profile-stat-card">
                  <p className="profile-stat-card__label">
                    Distance totale parcourue
                  </p>
                  <p className="profile-stat-card__measure">
                    {statistics.totalDistance}
                  </p>
                </article>

                <article className="profile-stat-card">
                  <p className="profile-stat-card__label">
                    Nombre de jours de repos
                  </p>
                  <p className="profile-stat-card__measure">
                    {statistics.restDays}
                  </p>
                </article>

                <article className="profile-stat-card">
                  <p className="profile-stat-card__label">
                    Nombre de sessions
                  </p>
                  <p className="profile-stat-card__measure">
                    {statistics.totalSessions}
                  </p>
                </article>
              </div>
            </section>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}