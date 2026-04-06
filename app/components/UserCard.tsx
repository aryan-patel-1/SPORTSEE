import { mockUserInfo } from "../mocks/mockdata";
import outlineIcon from "../img/OUTLINE.png";
import "../utils/dashboard.css";
import type { UserInfo } from "../utils/dataProvider";

function formatJoinDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDistance(distance: string) {
  const numericDistance = parseFloat(
    distance.replace(",", ".").replace(/[^\d.]/g, "")
  );

  if (Number.isNaN(numericDistance)) {
    return distance;
  }

  return `${Math.round(numericDistance)} km`;
}

type ProfileBannerProps = {
  userInfo?: UserInfo;
};

export default function ProfileBanner({ userInfo = mockUserInfo }: ProfileBannerProps) {
  const { profile, statistics } = userInfo;

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
          <p className="profile-banner__member">
            Membre depuis le {formatJoinDate(profile.createdAt)}
          </p>
        </div>
      </div>

      <div className="profile-banner__right">
        <p className="profile-banner__label">Distance totale parcourue</p>

        <div className="profile-banner__distance-card">
          <div className="profile-banner__distance-content">
            <img
              src={outlineIcon}
              alt="Icône distance"
              className="profile-banner__distance-icon"
            />
            <span className="profile-banner__distance-value">
              {formatDistance(statistics.totalDistance)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}