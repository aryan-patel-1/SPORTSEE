import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAppContext } from "../context/AppContext";
import { getToken } from "../utils/auth";
import {
  enrichUserInfoWithActivity,
  getUserActivity,
  getUserInfo,
  type UserInfo,
} from "../utils/dataProvider";

const PROFILE_FIELDS = [
  { label: "Âge", key: "age" },
  { label: "Genre", key: "gender" },
  { label: "Taille", key: "height" },
  { label: "Poids", key: "weight" },
] as const;

const STAT_FIELDS = [
  { label: "Temps total couru", key: "totalDuration" },
  { label: "Calories brûlées", key: "caloriesBurned" },
  { label: "Distance totale parcourue", key: "totalDistance" },
  { label: "Nombre de jours de repos", key: "restDays" },
  { label: "Nombre de sessions", key: "totalSessions" },
] as const;

function Message({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

export default function Profil() {
  const navigate = useNavigate();
  const { isAuthenticated, isCheckingAuth, logout } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    if (!isCheckingAuth && !isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isCheckingAuth, navigate]);

  useEffect(() => {
    // Le profil dépend à la fois des infos utilisateur et de l'historique
    // pour compléter les stats absentes comme les calories et les jours de repos.
    if (isCheckingAuth || !isAuthenticated) {
      return;
    }

    const token = getToken();

    if (!token) {
      setLoading(false);
      setError("Session introuvable");
      return;
    }

    const authToken = token;

    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);

        const [profileData, activityData] = await Promise.all([
          getUserInfo(authToken),
          getUserActivity(authToken),
        ]);

        setUserInfo(enrichUserInfoWithActivity(profileData, activityData));
      } catch {
        setError("Erreur lors du chargement du profil");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [isAuthenticated, isCheckingAuth]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  if (isCheckingAuth) {
    return <Message>Vérification...</Message>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return <Message>Chargement du profil...</Message>;
  }

  if (error) {
    return <Message>{error}</Message>;
  }

  if (!userInfo) {
    return <Message>Données du profil indisponibles</Message>;
  }

  const { profile, statistics } = userInfo;

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
                  {PROFILE_FIELDS.map(({ label, key }) => (
                    <p key={key} className="profile-details-item">
                      {label} : {profile[key]}
                    </p>
                  ))}
                </div>
              </article>
            </div>

            <section className="profile-stats">
              <h2 className="profile-stats__title">Vos statistiques</h2>
              <p className="profile-stats__subtitle">
                depuis le {profile.createdAt}
              </p>

              <div className="profile-stats-grid">
                {STAT_FIELDS.map(({ label, key }) => (
                  <article key={key} className="profile-stat-card">
                    <p className="profile-stat-card__label">{label}</p>
                    <p className="profile-stat-card__measure">
                      {statistics[key]}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
