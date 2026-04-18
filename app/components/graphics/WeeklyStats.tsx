import { PieChart, Pie, ResponsiveContainer } from "recharts";
import {
  formatActivityPeriod,
  getLatestWeekActivities,
  type UserActivity,
} from "../../utils/activity";
import "../../css/weekly-stats.css";

type WeeklyStatsProps = {
  data: UserActivity[];
  // objectif hebdomadaire défini côté profil
  goal: number;
};

// ajoute le 's' du pluriel français au libellé si count >= 2
function pluralize(count: number, label: string) {
  return `${count} ${label}${count > 1 ? "s" : ""}`;
}

// bloc "cette semaine" avec donut de progression et totaux
export default function WeeklyStats({ data, goal }: WeeklyStatsProps) {
  // on ne garde que les activités de la semaine la plus récente
  // (même si data contient plusieurs mois d'historique)
  const latestWeekActivities = getLatestWeekActivities(data);

  const completed = latestWeekActivities.length;
  // Math.max évite un nombre négatif quand l'utilisateur dépasse son objectif
  const remaining = Math.max(0, goal - completed);

  const completedLabel = pluralize(completed, "réalisée");
  const remainingLabel = pluralize(remaining, "restante");

  // deux parts du donut : bleu = fait, gris = restant
  // Recharts dessine les segments dans l'ordre du tableau
  const chartData = [
    { name: "réalisées", value: completed, fill: "#1f38ff" },
    { name: "restantes", value: remaining, fill: "#d6d9f5" },
  ];

  // totaux sur la semaine en cours (durée en minutes, distance en km)
  const totalDuration = latestWeekActivities.reduce((acc, item) => acc + item.duration, 0);
  const totalDistance = latestWeekActivities.reduce((acc, item) => acc + item.distance, 0);

  // période affichée dans l'en-tête, ex "Du 12 févr - 18 févr"
  // les activités sont déjà triées par getLatestWeekActivities
  const startDate = latestWeekActivities[0]?.date;
  const endDate = latestWeekActivities.at(-1)?.date;
  const period =
    startDate && endDate
      ? `Du ${formatActivityPeriod(startDate, endDate)}`
      : "Aucune activité récente";

  return (
    <section className="weekly">
      <div className="weekly__header">
        <h2>Cette semaine</h2>
        <p>{period}</p>
      </div>

      <div className="weekly__content">
        <div className="weekly__card">
          <h3>
            <span className="weekly__blue">x{completed}</span> sur objectif de {goal}
          </h3>
          <p>Courses hebdomadaire réalisées</p>

          <div className="weekly__chart-area">
            <div className="weekly__chart">
              <ResponsiveContainer width={220} height={220}>
                <PieChart>
                  {/* angle négatif pour tourner dans le sens anti-horaire */}
                  <Pie
                    data={chartData}
                    dataKey="value"
                    innerRadius={48}
                    outerRadius={82}
                    startAngle={0}
                    endAngle={-360}
                    stroke="none"
                    isAnimationActive={false}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="weekly__legend weekly__legend--left">
              <span className="weekly__dot weekly__dot--blue" />
              <span>{completedLabel}</span>
            </div>

            <div className="weekly__legend weekly__legend--right">
              <span className="weekly__dot weekly__dot--gray" />
              <span>{remainingLabel}</span>
            </div>
          </div>
        </div>

        {/* cartes latérales avec les totaux durée et distance */}
        <div className="weekly__right">
          <div className="weekly__mini">
            <p>Durée d'activité</p>
            <h3 className="blue">{totalDuration} minutes</h3>
          </div>

          <div className="weekly__mini">
            <p>Distance</p>
            <h3 className="orange">{totalDistance.toFixed(1)} kilomètres</h3>
          </div>
        </div>
      </div>
    </section>
  );
}