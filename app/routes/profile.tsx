import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getToken } from "../utils/auth";
import { UserContext } from "../context/UserContext";
import { getUserInfo, getUserActivity } from "../services/dataProvider";
import { formatLongActivityDate, type UserActivity } from "../utils/activity";
import Header from "../components/Header";
import "../css/profile.css";

// convertit "male"/"female" en libellé français
function formatGenderLabel(gender: string | null | undefined) {
  if (gender === "male") return "Homme";
  if (gender === "female") return "Femme";
  return "Non renseigné";
}

// formate la taille en "1m78"

function formatHeight(height: number | string | null | undefined) {
  const value = Number(height);
  if (!Number.isFinite(value) || value <= 0) return "Non renseignée";

  // normalisation en cm avant de découper en m + reste
  const cm = Math.round(value >= 3 ? value : value * 100);

  // on force le reste sur 2 chiffres pour que "1m07" ne devienne pas "1m7"
  return `${Math.floor(cm / 100)}m${String(cm % 100).padStart(2, "0")}`;
}

// calcule le nombre de jours sans activité depuis l'inscription
// principe : (nb total de jours depuis l'inscription) - (jours avec au moins une activité)
// les dates sont au format "YYYY-MM-DD" donc on peut comparer directement en string
function getRestDaysCount(activity: UserActivity[], startWeek: string | null | undefined) {
  if (!startWeek) return 0;

  const today = new Date().toISOString().slice(0, 10);
  const oneDayMs = 24 * 60 * 60 * 1000;

  // diff de jours arrondie + 1 pour inclure le jour d'inscription ET aujourd'hui
  const totalDays =
    Math.floor((Date.parse(today) - Date.parse(startWeek)) / oneDayMs) + 1;

  // Set sur item.date pour ne compter qu'une fois les jours avec plusieurs séances
  const activeDays = new Set(
    activity
      .filter((item) => item.date >= startWeek && item.date <= today)
      .map((item) => item.date)
  ).size;

  // Math.max protège des cas tordus (date d'inscription dans le futur, etc.)
  return Math.max(0, totalDays - activeDays);
}

// composant qui affiche une stat avec sa valeur et son unité
function StatValue({ main, unit }: { main: string; unit: string }) {
  return (
    <p className="profile-stat__value">
      <span className="profile-stat__main">{main}</span>
      <span className="profile-stat__unit">{unit}</span>
    </p>
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
      } catch {
        setError("Erreur lors du chargement du profil");
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
  if (loading) return <p>Vérification...</p>;
  if (error) return <p>{error}</p>;
  if (!userInfo) return <p>Données indisponibles</p>;

  const { profile } = userInfo;
  const statistics = userInfo.statistics ?? {};

  // totaux calculés en un seul parcours du tableau (reduce)
  // utilisés si l'API ne renvoie pas directement les statistiques globales
  const activityTotals = activity.reduce(
    (acc, item) => ({
      calories: acc.calories + item.caloriesBurned,
      distance: acc.distance + item.distance,
      duration: acc.duration + item.duration,
    }),
    { calories: 0, distance: 0, duration: 0 }
  );

  // on privilégie les stats de l'API, sinon on bascule sur le recalcul local
  const totalCalories = statistics.totalCalories ?? activityTotals.calories;
  const totalDistance = statistics.totalDistance ?? activityTotals.distance;
  const totalDuration = statistics.totalDuration ?? activityTotals.duration;
  const totalSessions = statistics.totalSessions ?? activity.length;
  const totalRestDays = getRestDaysCount(activity, profile.createdAt);

  // conversion des minutes totales en heures + minutes
  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;

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
                alt={`${profile.firstName} ${profile.lastName}`}
                className="profile-card__image"
              />
              <div className="profile-card__identity-text">
                <h1 className="profile-card__name">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="profile-card__member">
                  Membre depuis le {formatLongActivityDate(profile.createdAt)}
                </p>
              </div>
            </article>

            <article className="profile-card profile-card--details">
              <h2 className="profile-card__title">Votre profil</h2>
              <div className="profile-card__details-list">
                <p><strong>Âge :</strong> {profile.age}</p>
                <p><strong>Genre :</strong> {formatGenderLabel(profile.gender)}</p>
                <p><strong>Taille :</strong> {formatHeight(profile.height)}</p>
                <p><strong>Poids :</strong> {profile.weight} kg</p>
              </div>
            </article>
          </div>

          {/* colonne droite, grille de statistiques cumulées */}
          <div className="profile-page__right">
            <div className="profile-stats__header">
              <h2 className="profile-stats__title">Vos statistiques</h2>
              <p className="profile-stats__subtitle">
                depuis le {formatLongActivityDate(profile.createdAt)}
              </p>
            </div>

            <div className="profile-stats__grid">
              <article className="profile-stat">
                <p className="profile-stat__label">Temps total couru</p>
                <StatValue main={`${hours}h`} unit={`${minutes}min`} />
              </article>

              <article className="profile-stat">
                <p className="profile-stat__label">Calories brûlées</p>
                <StatValue main={String(totalCalories)} unit="cal" />
              </article>

              <article className="profile-stat">
                <p className="profile-stat__label">Distance totale parcourue</p>
                <StatValue main={String(Math.round(totalDistance))} unit="km" />
              </article>

              <article className="profile-stat">
                <p className="profile-stat__label">Nombre de jours de repos</p>
                <StatValue main={String(totalRestDays)} unit="jours" />
              </article>

              <article className="profile-stat">
                <p className="profile-stat__label">Nombre de sessions</p>
                <StatValue main={String(totalSessions)} unit="sessions" />
              </article>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}