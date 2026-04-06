import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { mockUserActivity } from "../mocks/mockdata";
import "../utils/dashboard.css";
import type { UserActivity } from "../utils/dataProvider";

const goal = 6;
const COLORS = ["#1f38ff", "#d6d9f5"];

type WeeklyStatsProps = {
  activity?: UserActivity[];
};

function formatDateRange(dateString: string) {
  return new Date(dateString).toLocaleDateString("fr-FR");
}

export default function WeeklyStats({
  activity = mockUserActivity,
}: WeeklyStatsProps) {
  // cette section résume les objectifs à partir de la liste complète des séances
  const completed = activity.length;
  const remaining = goal - completed > 0 ? goal - completed : 0;
  const chartData = [
    { name: "done", value: completed },
    { name: "remaining", value: remaining },
  ];

  const totalDuration = activity.reduce(
    (acc, item) => acc + item.duration,
    0
  );
  const totalDistance = activity.reduce(
    (acc, item) => acc + item.distance,
    0
  );
  const startDate = activity[0]?.date;
  const endDate = activity[activity.length - 1]?.date;

  return (
    <section className="weekly">
      <div className="weekly__header">
        <h2>Cette semaine</h2>
        <p>
          {startDate && endDate
            ? `Du ${formatDateRange(startDate)} au ${formatDateRange(endDate)}`
            : "Période indisponible"}
        </p>
      </div>

      <div className="weekly__content">
        {/* carte objectif */}
        <div className="weekly__card">
          <h3>
            <span className="weekly__blue">X{completed}</span> sur objectif de {goal}
          </h3>

          <p>Courses hebdomadaire réalisées</p>

          <div className="weekly__chart">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="weekly__legend">
            <span>{completed} réalisées</span>
            <span>{remaining} restantes</span>
          </div>
        </div>
 
        {/* cartes de synthèse */}
        <div className="weekly__right">
          <div className="weekly__mini">
            <p>Durée d’activité</p>
            <h3 className="blue">{totalDuration} minutes</h3>
          </div>

          <div className="weekly__mini">
            <p>Distance</p>
            <h3 className="orange">
              {totalDistance.toFixed(1)} kilomètres
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
}