import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getToken } from "../utils/auth";
import { UserContext } from "../context/UserContext";
import { getUserInfo, getUserActivity } from "../services/dataProvider";
import type { UserActivity } from "../utils/activity";
import Header from "../components/Header";
import "../css/profile.css";

function formatJoinDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatGenderLabel(gender: string | null | undefined) {
  if (gender === "male") return "Homme";
  if (gender === "female") return "Femme";
  return "Non renseigné";
}

function formatHeight(height: number | string | null | undefined) {
  const cm =
    Number(height) >= 3
      ? Math.round(Number(height))
      : Math.round(Number(height) * 100);

  if (!Number.isFinite(cm) || cm <= 0) return "Non renseignée";

  return `${Math.floor(cm / 100)}m${String(cm % 100).padStart(2, "0")}`;
}

// Calcule le nombre de jours sans activité depuis la date d'inscription.
function getRestDaysCount(activity: UserActivity[], startWeek: string | null | undefined) {
  if (!startWeek) return 0;

  const today = new Date().toISOString().split("T")[0];
  const startDate = new Date(`${startWeek}T00:00:00Z`);
  const endDate = new Date(`${today}T00:00:00Z`);
  const oneDayMs = 24 * 60 * 60 * 1000;

  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / oneDayMs) + 1;

  const activeDays = new Set(
    activity
      .filter((item) => {
        const d = new Date(`${item.date}T00:00:00Z`);
        return d >= startDate && d <= endDate;
      })
      .map((item) => item.date)
  ).size;

  return Math.max(0, totalDays - activeDays);
}

function StatValue({ main, unit }: { main: string; unit: string }) {
  return (
    <p className="profile-stat__value">
      <span className="profile-stat__main">{main}</span>
      <span className="profile-stat__unit">{unit}</span>
    </p>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const context = useContext(UserContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [activity, setActivity] = useState<UserActivity[]>([]);

  if (!context) return <p>Erreur de contexte</p>;

  const { setUser } = context;

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

        const authToken: string = token!;
        const userData = await getUserInfo(authToken);
        const activityResponse = await getUserActivity(authToken, userData?.profile?.createdAt);

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
    setUser(null);
  };

  if (loading) return <p>Vérification...</p>;
  if (error) return <p>{error}</p>;
  if (!userInfo) return <p>Données indisponibles</p>;

  const { profile } = userInfo;
  const statistics = userInfo.statistics ?? {};

  // Calcule les totaux d'activité en un seul parcours du tableau.
  // On préfère les statistiques de l'API quand elles existent, sinon on recalcule depuis les activités.
  const activityTotals = activity.reduce(
    (acc, item) => ({
      calories: acc.calories + item.caloriesBurned,
      distance: acc.distance + item.distance,
      duration: acc.duration + item.duration,
    }),
    { calories: 0, distance: 0, duration: 0 }
  );

  const totalCalories = statistics.totalCalories ?? activityTotals.calories;
  const totalDistance = statistics.totalDistance ?? activityTotals.distance;
  const totalDuration = statistics.totalDuration ?? activityTotals.duration;
  const totalSessions = statistics.totalSessions ?? activity.length;
  const totalRestDays = getRestDaysCount(activity, profile.createdAt);

  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;

  return (
    <div className="page">
      <Header onLogout={handleLogout} />

      <main className="profile-page">
        <section className="profile-page__grid">
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
                  Membre depuis le {formatJoinDate(profile.createdAt)}
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

          <div className="profile-page__right">
            <div className="profile-stats__header">
              <h2 className="profile-stats__title">Vos statistiques</h2>
              <p className="profile-stats__subtitle">
                depuis le {formatJoinDate(profile.createdAt)}
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