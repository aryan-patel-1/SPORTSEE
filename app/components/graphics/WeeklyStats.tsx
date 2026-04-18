import { PieChart, Pie, ResponsiveContainer } from "recharts";
import {
  formatActivityPeriod,
  getLatestWeekActivities,
  type UserActivity,
} from "../../utils/activity";
import "../../css/weekly-stats.css";

type WeeklyStatsProps = {
  data: UserActivity[];
  goal: number;
};

export default function WeeklyStats({ data, goal }: WeeklyStatsProps) {
  const latestWeekActivities = getLatestWeekActivities(data);

  const completed = latestWeekActivities.length;
  const remaining = Math.max(0, goal - completed);
  const completedLabel = `${completed} réalisée${completed > 1 ? "s" : ""}`;
  const remainingLabel = `${remaining} restante${remaining > 1 ? "s" : ""}`;

  // Données du graphique : part réalisée vs part restante.
  const chartData = [
    { name: "réalisées", value: completed, fill: "#1f38ff" },
    { name: "restantes", value: remaining, fill: "#d6d9f5" },
  ];

  const totalDuration = latestWeekActivities.reduce((acc, item) => acc + item.duration, 0);
  const totalDistance = latestWeekActivities.reduce((acc, item) => acc + item.distance, 0);

  const startDate = latestWeekActivities[0]?.date;
  const endDate = latestWeekActivities[latestWeekActivities.length - 1]?.date;
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