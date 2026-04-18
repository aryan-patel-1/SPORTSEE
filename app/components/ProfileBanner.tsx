import "../css/profile-banner.css";

// type des données reçues par le composant
type ProfileBannerProps = {
  data: {
    profile: {
      firstName: string;
      lastName: string;
      createdAt: string;
      profilePicture: string;
    };
    statistics: {
      totalDistance: number;
    };
  };
};

// fonction pour formater la date en français
function formatJoinDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// composant bannière du profil
export default function ProfileBanner({ data }: ProfileBannerProps) {
  // on récupère les infos du profil et les statistiques
  const { profile, statistics } = data;

  return (
    <section className="profile-banner profile-banner--animated">
      <div className="profile-banner__left">
        <img
          src={profile.profilePicture}
          alt={`${profile.firstName} ${profile.lastName}`}
          className="profile-banner__image"
        />
        <div className="profile-banner__infos">
          <h2 className="profile-banner__name">
            {profile.firstName} {profile.lastName}
          </h2>

          {/* date d'inscription */}
          <p className="profile-banner__member">
            Membre depuis le {formatJoinDate(profile.createdAt)}
          </p>
        </div>
      </div>

      {/* partie droite : statistique principale */}
      <div className="profile-banner__right">
        <p className="profile-banner__label">Distance totale parcourue</p>

        <div className="profile-banner__distance-card">
          <div className="profile-banner__distance-content">
            <img
              src="/OUTLINE.png"
              alt="Icône distance"
              className="profile-banner__distance-icon"
            />

            {/* affichage de la distance totale arrondie */}
            <span className="profile-banner__distance-value">
              {Math.round(statistics.totalDistance)} km
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}