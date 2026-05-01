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
import type { DistancePage } from "../../utils/viewModels";
import "../../css/distance-card.css";

type DistanceCardProps = {
  pages: DistancePage[];
};

type DistanceTooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload: {
      week: string;
      distance: number;
      tooltipPeriodLabel: string;
      distanceLabel: string;
    };
  }>;
};

// tooltip personnalisé, défini en dehors pour éviter une recréation à chaque render
function CustomTooltip({ active, payload }: DistanceTooltipProps) {
  if (!active || !payload?.length) return null;

  const { tooltipPeriodLabel, distanceLabel } = payload[0].payload;

  return (
    <div className="distance-card__tooltip">
      <p className="distance-card__tooltip-date">{tooltipPeriodLabel}</p>
      <p className="distance-card__tooltip-value">{distanceLabel}</p>
    </div>
  );
}

// carte de la distance hebdomadaire avec navigation par pages
export default function DistanceCard({ pages }: DistanceCardProps) {
  const pageCount = pages.length;

  // on ouvre sur la dernière page (semaines les plus récentes)
  const [pageIndex, setPageIndex] = useState(Math.max(pageCount - 1, 0));

  // resynchronise la page si les données changent
  useEffect(() => {
    setPageIndex(Math.max(pageCount - 1, 0));
  }, [pageCount]);

  const currentPage = pages[pageIndex] ?? pages[0];
  const chartData = currentPage?.chartData ?? [];

  const canGoToPreviousPage = pageIndex > 0;
  const canGoToNextPage = pageIndex < pageCount - 1;

  return (
    <section className="distance-card">
      <div className="distance-card__header">
        <div className="distance-card__header-left">
          <h3 className="distance-card__title">{currentPage.averageDistanceLabel} en moyenne</h3>
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
          <span>{currentPage.periodLabel}</span>
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
              animationDuration={360}
              animationEasing="ease-out"
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