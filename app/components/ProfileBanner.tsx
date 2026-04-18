import { formatLongActivityDate } from "../utils/activity";
import "../css/profile-banner.css";

// type des données affichées par la bannière
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

// bannière du haut du dashboard avec photo, nom et distance totale
export default function ProfileBanner({ data }: ProfileBannerProps) {
  const { profile, statistics } = data;

  return (
    <section className="profile-banner profile-banner--animated">
      {/* partie gauche, photo et identité */}
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

          <p className="profile-banner__member">
            Membre depuis le {formatLongActivityDate(profile.createdAt)}
          </p>
        </div>
      </div>

      {/* partie droite, distance totale mise en avant */}
      <div className="profile-banner__right">
        <p className="profile-banner__label">Distance totale parcourue</p>

        <div className="profile-banner__distance-card">
          <div className="profile-banner__distance-content">
            <img
              src="/OUTLINE.png"
              alt="Icône distance"
              className="profile-banner__distance-icon"
            />

            {/* on arrondit pour ne pas afficher de décimales */}
            <span className="profile-banner__distance-value">
              {Math.round(statistics.totalDistance)} km
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}