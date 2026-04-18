import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getToken } from "../utils/auth";
import { UserContext } from "../context/UserContext";
import Header from "../components/Header";
import ProfileBanner from "../components/ProfileBanner";
import DistanceCard from "../components/graphics/DistanceCard";
import BpmCard from "../components/graphics/BpmCard";
import WeeklyStats from "../components/graphics/WeeklyStats";
import {
  getFutureActivityEndDate,
  getUserInfo,
  getUserActivity,
  getUserGoal,
} from "../services/dataProvider";
import type { UserActivity, WeeklyDistancePoint } from "../utils/activity";
import styles from "../css/dashboard.module.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const context = useContext(UserContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [activity, setActivity] = useState<UserActivity[]>([]);
  const [runningData, setRunningData] = useState<WeeklyDistancePoint[]>([]);
  const [goal, setGoal] = useState<number>(0);

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

        // Charge toutes les données en parallèle pour minimiser le temps d'attente.
        const [userData, userGoal, activityResponse] = await Promise.all([
          getUserInfo(token!),
          getUserGoal(token!),
          getUserActivity(token!, undefined, getFutureActivityEndDate()),
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

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;
  if (!userInfo) return <p>Données indisponibles</p>;

  return (
    <div className="page">
      <Header onLogout={handleLogout} />

      <main className={styles.dashboard}>
        <ProfileBanner data={userInfo} />

        <section className={styles.dashboard__performances}>
          <h2 className={styles.title}>Vos dernières performances</h2>

          <div className={styles.dashboard__cards}>
            <DistanceCard runningData={runningData} />
            <BpmCard data={activity} />
          </div>
        </section>

        <WeeklyStats data={activity} goal={goal} />
      </main>
    </div>
  );
}