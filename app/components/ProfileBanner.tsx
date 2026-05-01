import type { ProfileBannerViewModel } from "../utils/viewModels";
import "../css/profile-banner.css";

type ProfileBannerProps = {
  data: ProfileBannerViewModel;
};

// bannière du haut du dashboard avec photo, nom et distance totale
export default function ProfileBanner({ data }: ProfileBannerProps) {
  return (
    <section className="profile-banner profile-banner--animated">
      {/* partie gauche, photo et identité */}
      <div className="profile-banner__left">
        <img
          src={data.profilePicture}
          alt={data.fullName}
          className="profile-banner__image"
        />
        <div className="profile-banner__infos">
          <h2 className="profile-banner__name">{data.fullName}</h2>
          <p className="profile-banner__member">{data.memberSinceLabel}</p>
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
            <span className="profile-banner__distance-value">{data.totalDistanceLabel}</span>
          </div>
        </div>
      </div>
    </section>
  );
}