import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getToken } from "../utils/auth";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProfileBanner from "../components/UserCard";
import DistanceCard from "../components/DistanceCard";
import BpmCard from "../components/DurationCard";
import WeeklyStats from "../components/WeeklySection";
import { getUserInfo, getUserActivity } from "../utils/dataProvider";
import { useAppContext } from "../context/AppContext";
import "../utils/dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, isCheckingAuth, logout } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userInfo, setUserInfo] = useState<Awaited<ReturnType<typeof getUserInfo>> | null>(null);
  const [activity, setActivity] = useState<Awaited<ReturnType<typeof getUserActivity>>>([]);

  useEffect(() => {
    // cette route reste protégée tant que la session n'est pas valide
    if (!isCheckingAuth && !isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isCheckingAuth, navigate]);

  useEffect(() => {
    if (isCheckingAuth || !isAuthenticated) {
      return;
    }

    const authToken = getToken();

    if (!authToken) {
      setLoading(false);
      setError("Session introuvable");
      return;
    }

    const token = authToken;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // le dashboard charge le profil et les activités en parallèle
        const [userData, activityData] = await Promise.all([
          getUserInfo(token),
          getUserActivity(token),
        ]);

        setUserInfo(userData);
        setActivity(activityData);
      } catch {
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isAuthenticated, isCheckingAuth]);

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

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!userInfo) {
    return <p>Données indisponibles</p>;
  }

  return (
    <div className="profile-page-layout">
      <main className="dashboard-page">
        <div className="dashboard-shell">
          <Header onLogout={handleLogout} />

          {/* les cartes consomment directement les données chargées ici */}
          <section className="dashboard">
            <ProfileBanner userInfo={userInfo} />

            <section className="dashboard__performances">
              <h2 className="dashboard__section-title">
                Vos dernières performances
              </h2>

              <div className="dashboard__cards">
                <DistanceCard activity={activity} />
                <BpmCard activity={activity} />
              </div>
            </section>

            <WeeklyStats activity={activity} />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
