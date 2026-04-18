import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getToken } from "../utils/auth";
import { UserContext } from "../context/UserContext";
import Header from "../components/Header";
import ProfileBanner from "../components/ProfileBanner";
import DistanceCard from "../components/graphics/DistanceCard";
import BpmCard from "../components/graphics/BpmCard";
import WeeklyStats from "../components/graphics/WeeklyStats";
import { getUserInfo, getUserActivity, getUserGoal } from "../services/dataProvider";
import type { UserActivity, WeeklyDistancePoint } from "../utils/activity";
import styles from "../css/dashboard.module.css";

// page principale, affiche la bannière, les graphiques et la semaine en cours
export default function Dashboard() {
  const navigate = useNavigate();
  const context = useContext(UserContext);

  // états locaux pour le chargement, les erreurs et les données de l'API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [activity, setActivity] = useState<UserActivity[]>([]);
  const [runningData, setRunningData] = useState<WeeklyDistancePoint[]>([]);
  const [goal, setGoal] = useState<number>(0);

  // chargement des données
  // le useEffect doit rester avant tout return conditionnel pour respecter
  useEffect(() => {
    const token = getToken();

    // pas de token, on renvoie vers la page de connexion
    if (!token) {
      navigate("/", { replace: true, viewTransition: true });
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // appels en parallèle pour réduire le temps de chargement total
        const [userData, userGoal, activityResponse] = await Promise.all([
          getUserInfo(token!),
          getUserGoal(token!),
          getUserActivity(token!),
        ]);

        setUserInfo(userData);
        setGoal(userGoal);
        setActivity(activityResponse.activities);
        setRunningData(activityResponse.runningData);
      } catch {
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [navigate]);

  // déconnexion, le token est supprimé par le Header via removeToken
  const handleLogout = () => {
    context?.setUser(null);
  };

  // affichages intermédiaires selon l'état du chargement
  if (!context) return <p>Erreur de contexte</p>;
  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;
  if (!userInfo) return <p>Données indisponibles</p>;

  return (
    <div className="page">
      <Header onLogout={handleLogout} />

      <main className={styles.dashboard}>
        {/* bannière haute avec photo et distance totale */}
        <ProfileBanner data={userInfo} />

        <section className={styles.dashboard__performances}>
          <h2 className={styles.title}>Vos dernières performances</h2>

          {/* deux graphiques côte à côte, distance et fréquence cardiaque */}
          <div className={styles.dashboard__cards}>
            <DistanceCard runningData={runningData} />
            <BpmCard data={activity} />
          </div>
        </section>

        {/* stats de la semaine en cours */}
        <WeeklyStats data={activity} goal={goal} />
      </main>
    </div>
  );
}