import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getToken } from "../utils/auth";
import { UserContext } from "../context/UserContext";
import { getUserInfo, getUserActivity } from "../services/dataProvider";
import { getErrorMessage } from "../services/api";
import type { UserActivity } from "../utils/date";
import { getProfileViewModel } from "../utils/viewModels";
import Header from "../components/Header";
import "../css/profile.css";

interface DataProfilCardProps {
  title: string[];
  main: string;
  unit: string;
}

function DataProfilCard({ title, main, unit }: DataProfilCardProps) {
  return (
    <article className="profile-stat">
      <p className="profile-stat__label">
        {title.map((line, i) => (
          <span key={i}>{line}{i < title.length - 1 && " "}</span>
        ))}
      </p>
      <p className="profile-stat__value">
        <span className="profile-stat__main">{main}</span>
        <span className="profile-stat__unit">{unit}</span>
      </p>
    </article>
  );
}

// page "mon profil" avec l'identité et les statistiques cumulées
export default function Profile() {
  const navigate = useNavigate();
  const context = useContext(UserContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [activity, setActivity] = useState<UserActivity[]>([]);

  // chargement des données
  // le useEffect reste avant les return conditionnels pour respecter
  useEffect(() => {
    const token = getToken();

    if (!token) {
      navigate("/", { replace: true, viewTransition: true });
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const userData = await getUserInfo(token!);
        const activityResponse = await getUserActivity(token!, userData?.profile?.createdAt);

        setUserInfo(userData);
        setActivity(activityResponse.activities);
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            "Impossible de charger le profil. Vérifiez la connexion à l'API."
          )
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [navigate]);

  const handleLogout = () => {
    context?.setUser(null);
  };

  if (!context) return <p>Erreur de contexte</p>;
  if (loading) return <div className="feedback-panel">Chargement du profil...</div>;
  if (error) return <div className="feedback-panel feedback-panel--error">{error}</div>;
  if (!userInfo) {
    return <div className="feedback-panel feedback-panel--error">Données indisponibles.</div>;
  }

  const profile = getProfileViewModel(userInfo, activity);

  return (
    <div className="page">
      <Header onLogout={handleLogout} />

      <main className="profile-page">
        <section className="profile-page__grid">
          {/* colonne gauche, carte d'identité et détails du profil */}
          <div className="profile-page__left">
            <article className="profile-card profile-card--identity">
              <img
                src={profile.profilePicture}
                alt={profile.fullName}
                className="profile-card__image"
              />
              <div className="profile-card__identity-text">
                <h1 className="profile-card__name">{profile.fullName}</h1>
                <p className="profile-card__member">{profile.memberSinceLabel}</p>
              </div>
            </article>

            <article className="profile-card profile-card--details">
              <h2 className="profile-card__title">Votre profil</h2>
              <div className="profile-card__details-list">
                <p><strong>Âge :</strong> {profile.age}</p>
                <p><strong>Genre :</strong> {profile.genderLabel}</p>
                <p><strong>Taille :</strong> {profile.heightLabel}</p>
                <p><strong>Poids :</strong> {profile.weightLabel}</p>
              </div>
            </article>
          </div>

          {/* colonne droite, grille de statistiques cumulées */}
          <div className="profile-page__right">
            <div className="profile-stats__header">
              <h2 className="profile-stats__title">Vos statistiques</h2>
              <p className="profile-stats__subtitle">{profile.statsSubtitle}</p>
            </div>

            <div className="profile-stats__grid">
              <DataProfilCard title={["Temps total", "couru"]} main={profile.totalDuration.main} unit={profile.totalDuration.unit} />
              <DataProfilCard title={["Calories", "brûlées"]} main={profile.totalCalories.main} unit={profile.totalCalories.unit} />
              <DataProfilCard title={["Distance totale", "parcourue"]} main={profile.totalDistance.main} unit={profile.totalDistance.unit} />
              <DataProfilCard title={["Jours", "de repos"]} main={profile.totalRestDays.main} unit={profile.totalRestDays.unit} />
              <DataProfilCard title={["Nombre", "de sessions"]} main={profile.totalSessions.main} unit={profile.totalSessions.unit} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}