import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatActivityPeriod,
  formatTooltipActivityPeriod,
  type WeeklyDistancePoint,
} from "../../utils/activity";
import "../../css/distance-card.css";

const WEEKS_PER_PAGE = 4;

type DistanceCardProps = {
  runningData: WeeklyDistancePoint[];
};

type DistanceTooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload: {
      week: string;
      distance: number;
      startDate: string;
      endDate: string;
    };
  }>;
};

// Divise les données en pages de 4 semaines.
// La première page peut contenir moins de 4 semaines si le total n'est pas un multiple de 4.
function buildWeekPages(runningData: WeeklyDistancePoint[]) {
  if (runningData.length === 0) return [[]];

  const pages: WeeklyDistancePoint[][] = [];
  const remainder = runningData.length % WEEKS_PER_PAGE;
  let cursor = 0;

  if (remainder > 0) {
    pages.push(runningData.slice(0, remainder));
    cursor = remainder;
  }

  while (cursor < runningData.length) {
    pages.push(runningData.slice(cursor, cursor + WEEKS_PER_PAGE));
    cursor += WEEKS_PER_PAGE;
  }

  return pages;
}

// Défini en dehors du composant pour éviter une recréation à chaque render.
function CustomTooltip({ active, payload }: DistanceTooltipProps) {
  if (!active || !payload?.length) return null;

  const { startDate, endDate, distance } = payload[0].payload;

  return (
    <div className="distance-card__tooltip">
      <p className="distance-card__tooltip-date">
        {formatTooltipActivityPeriod(startDate, endDate)}
      </p>
      <p className="distance-card__tooltip-value">
        {distance.toFixed(1).replace(".", ",")} km
      </p>
    </div>
  );
}

export default function DistanceCard({ runningData }: DistanceCardProps) {
  const weekPages = buildWeekPages(runningData);
  const pageCount = weekPages.length;
  const [pageIndex, setPageIndex] = useState(Math.max(pageCount - 1, 0));

  // Synchronise la page courante quand les données changent.
  useEffect(() => {
    setPageIndex(Math.max(pageCount - 1, 0));
  }, [pageCount]);

  const chartData = weekPages[pageIndex].map((week, index) => ({
    ...week,
    week: `S${index + 1}`,
  }));

  const totalDistance = chartData.reduce((total, item) => total + item.distance, 0);
  const averageDistance = chartData.length ? totalDistance / chartData.length : 0;

  const startDate = chartData[0]?.startDate;
  const endDate = chartData[chartData.length - 1]?.endDate;
  const period = startDate && endDate ? formatActivityPeriod(startDate, endDate) : "Aucune donnée";

  const canGoToPreviousPage = pageIndex > 0;
  const canGoToNextPage = pageIndex < pageCount - 1;

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
          <button
            type="button"
            className="distance-card__arrow"
            onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
            disabled={!canGoToPreviousPage}
            aria-label="Afficher les semaines précédentes"
          >
            ‹
          </button>
          <span>{period}</span>
          <button
            type="button"
            className="distance-card__arrow"
            onClick={() => setPageIndex((p) => Math.min(p + 1, pageCount - 1))}
            disabled={!canGoToNextPage}
            aria-label="Afficher les semaines suivantes"
          >
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
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
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