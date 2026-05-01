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
import { getErrorMessage } from "../services/api";
import type { UserActivity, WeeklyDistancePoint } from "../utils/date";
import {
  buildBpmPages,
  buildDistancePages,
  getProfileBannerViewModel,
  getWeeklyStatsViewModel,
} from "../utils/viewModels";
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
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            "Impossible de charger le tableau de bord. Vérifiez la connexion à l'API."
          )
        );
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
  if (loading) return <div className="feedback-panel">Chargement du tableau de bord...</div>;
  if (error) return <div className="feedback-panel feedback-panel--error">{error}</div>;
  if (!userInfo) {
    return <div className="feedback-panel feedback-panel--error">Données indisponibles.</div>;
  }

  const profileBanner = getProfileBannerViewModel(userInfo);
  const distancePages = buildDistancePages(runningData);
  const bpmPages = buildBpmPages(activity);
  const weeklyStats = getWeeklyStatsViewModel(activity, goal);

  return (
    <div className="page">
      <Header onLogout={handleLogout} />

      <main className={styles.dashboard}>
        {/* bannière haute avec photo et distance totale */}
        <ProfileBanner data={profileBanner} />

        <section className={styles.dashboard__performances}>
          <h2 className={styles.title}>Vos dernières performances</h2>

          {/* deux graphiques côte à côte, distance et fréquence cardiaque */}
          <div className={styles.dashboard__cards}>
            <DistanceCard pages={distancePages} />
            <BpmCard pages={bpmPages} />
          </div>
        </section>

        {/* stats de la semaine en cours */}
        <WeeklyStats data={weeklyStats} />
      </main>
    </div>
  );
}