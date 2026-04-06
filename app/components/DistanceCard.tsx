import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { mockUserActivity } from "../mocks/mockdata";
import "../utils/dashboard.css";
import type { UserActivity } from "../utils/dataProvider";

type DistanceCardProps = {
  activity?: UserActivity[];
};

function formatDate(dateString: string, options: Intl.DateTimeFormatOptions) {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", options);
}

function buildDistanceChart(activity: UserActivity[]) {
  const chartData = activity.slice(-4).map((entry, index) => ({
    week: `S${index + 1}`,
    distance: entry.distance,
    date: entry.date,
  }));
  const averageDistance =
    chartData.length > 0
      ? chartData.reduce((total, item) => total + item.distance, 0) /
        chartData.length
      : 0;
  const startDate = chartData[0]?.date;
  const endDate = chartData[chartData.length - 1]?.date;

  return {
    chartData,
    averageDistance,
    period:
      startDate && endDate
        ? `${formatDate(startDate, { day: "numeric", month: "short" })} - ${formatDate(endDate, { day: "numeric", month: "short" })}`
        : "",
  };
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="distance-card__tooltip">
      <p className="distance-card__tooltip-date">
        {formatDate(data.date, { day: "2-digit", month: "2-digit" })}
      </p>
      <p className="distance-card__tooltip-value">
        {data.distance.toFixed(1).replace(".", ",")} km
      </p>
    </div>
  );
}

export default function DistanceCard({
  activity = mockUserActivity,
}: DistanceCardProps) {
  // cette carte se base sur les 4 dernières séances pour rester lisible
  const { chartData, averageDistance, period } = buildDistanceChart(activity);

  return (
    <section className="distance-card">
      <div className="distance-card__header">
        <div className="distance-card__header-left">
          <h3 className="distance-card__title">
            {Math.round(averageDistance)}km en moyenne
          </h3>
          <p className="distance-card__subtitle">
            Total des kilomètres 4 dernières semaines
          </p>
        </div>
        <div className="distance-card__period">
          <button type="button" className="distance-card__arrow">
            ‹
          </button>
          <span>{period}</span>
          <button type="button" className="distance-card__arrow">
            ›
          </button>
        </div>
      </div>

      <div className="distance-card__chart">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} barCategoryGap={40}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e7e7e7" />
            <XAxis dataKey="week" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "transparent" }}
            />
            <Bar
              dataKey="distance"
              fill="#aeb4ff"
              activeBar={{ fill: "#1f38ff" }}
              radius={[20, 20, 20, 20]}
              barSize={12}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="distance-card__legend">
        <span className="distance-card__dot" />
        <span>Km</span>
      </div>
    </section>
  );
}