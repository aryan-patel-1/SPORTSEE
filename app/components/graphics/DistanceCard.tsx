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

// nombre de semaines affichées par page
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

// découpe les données en pages de 4 semaines

function buildWeekPages(runningData: WeeklyDistancePoint[]) {
  if (runningData.length === 0) return [[]];

  const pages: WeeklyDistancePoint[][] = [];
  // taille de la première page (0 si total déjà multiple de WEEKS_PER_PAGE)
  const offset = runningData.length % WEEKS_PER_PAGE;

  if (offset > 0) {
    pages.push(runningData.slice(0, offset));
  }

  // découpage régulier du reste en blocs pleins
  for (let i = offset; i < runningData.length; i += WEEKS_PER_PAGE) {
    pages.push(runningData.slice(i, i + WEEKS_PER_PAGE));
  }

  return pages;
}

// tooltip personnalisé, défini en dehors pour éviter une recréation à chaque render
function CustomTooltip({ active, payload }: DistanceTooltipProps) {
  if (!active || !payload?.length) return null;

  const { startDate, endDate, distance } = payload[0].payload;

  return (
    <div className="distance-card__tooltip">
      <p className="distance-card__tooltip-date">
        {formatTooltipActivityPeriod(startDate, endDate)}
      </p>
      <p className="distance-card__tooltip-value">
        {/* format français, virgule à la place du point */}
        {distance.toFixed(1).replace(".", ",")} km
      </p>
    </div>
  );
}

// carte de la distance hebdomadaire avec navigation par pages
export default function DistanceCard({ runningData }: DistanceCardProps) {
  const weekPages = buildWeekPages(runningData);
  const pageCount = weekPages.length;

  // on ouvre sur la dernière page (semaines les plus récentes)
  const [pageIndex, setPageIndex] = useState(Math.max(pageCount - 1, 0));

  // resynchronise la page si les données changent
  useEffect(() => {
    setPageIndex(Math.max(pageCount - 1, 0));
  }, [pageCount]);

  // on ajoute un label S1, S2... pour l'axe X
  const chartData = weekPages[pageIndex].map((week, index) => ({
    ...week,
    week: `S${index + 1}`,
  }));

  // moyenne affichée dans le titre
  const totalDistance = chartData.reduce((total, item) => total + item.distance, 0);
  const averageDistance = chartData.length ? totalDistance / chartData.length : 0;

  // période visible dans l'en-tête
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

        {/* contrôles de pagination */}
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
            {/* activeBar change la couleur de la barre survolée */}
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