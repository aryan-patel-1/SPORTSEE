import { useEffect, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  ComposedChart,
} from "recharts";
import type { BpmPage } from "../../utils/viewModels";
import "../../css/bpm-card.css";

type BpmCardProps = {
  pages: BpmPage[];
};

// type du tooltip passé à Recharts
type BpmTooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload: {
      min: number;
      max: number;
      average: number;
      tooltipDateLabel: string;
    };
  }>;
};

// tooltip personnalisé qui remplace celui par défaut de Recharts
// défini en dehors du composant pour éviter de le recréer à chaque render
function CustomBpmTooltip({ active, payload }: BpmTooltipProps) {
  if (!active || !payload?.length) return null;

  const d = payload[0].payload;

  return (
    <div className="bpm-card__tooltip">
      <p className="bpm-card__tooltip-date">{d.tooltipDateLabel}</p>
      <p className="bpm-card__tooltip-value">Min : {d.min} BPM</p>
      <p className="bpm-card__tooltip-value">Max : {d.max} BPM</p>
      <p className="bpm-card__tooltip-value">Moy : {d.average} BPM</p>
    </div>
  );
}

// carte des fréquences cardiaques, barres min/max et ligne de moyenne
export default function BpmCard({ pages }: BpmCardProps) {
  const pageCount = pages.length;

  // on ouvre par défaut sur la dernière page (données récentes)
  const [pageIndex, setPageIndex] = useState(Math.max(pageCount - 1, 0));
  const [isChartHovered, setIsChartHovered] = useState(false);

  // si le nombre de pages change on repositionne sur la dernière
  useEffect(() => {
    setPageIndex(Math.max(pageCount - 1, 0));
  }, [pageCount]);

  const currentPage = pages[pageIndex] ?? pages[0];
  const bpmChartData = currentPage?.chartData ?? [];

  // désactive les flèches aux extrémités
  const canGoToPreviousPage = pageIndex > 0;
  const canGoToNextPage = pageIndex < pageCount - 1;

  return (
    <section className="bpm-card">
      <div className="bpm-card__header">
        <div className="bpm-card__header-left">
          <h3 className="bpm-card__title">{currentPage.averageBpmLabel}</h3>
          <p className="bpm-card__subtitle">Fréquence cardiaque moyenne</p>
        </div>

        {/* flèches de pagination + période visible */}
        <div className="bpm-card__period">
          <button
            type="button"
            className="bpm-card__arrow"
            onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
            disabled={!canGoToPreviousPage}
            aria-label="Afficher les activités précédentes"
          >
            ‹
          </button>
          <span>{currentPage.periodLabel}</span>
          <button
            type="button"
            className="bpm-card__arrow"
            onClick={() => setPageIndex((p) => Math.min(p + 1, pageCount - 1))}
            disabled={!canGoToNextPage}
            aria-label="Afficher les activités suivantes"
          >
            ›
          </button>
        </div>
      </div>

      <div className="bpm-card__chart">
        {/* adapte la taille du graphique au parent */}
        <ResponsiveContainer width="100%" height={290}>
          <ComposedChart
            data={bpmChartData}
            barCategoryGap={22}
            onMouseMove={(state) => setIsChartHovered(Boolean(state?.isTooltipActive))}
            onMouseLeave={() => setIsChartHovered(false)}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e7e7e7" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            {/* axe Y fixé pour garder la même échelle entre les pages */}
            <YAxis
              domain={[130, 187]}
              ticks={[130, 145, 160, 187]}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomBpmTooltip />} cursor={{ fill: "transparent" }} />

            {/* barre du bpm minimum */}
            <Bar
              dataKey="min"
              fill="#f3b8ac"
              radius={[10, 10, 10, 10]}
              barSize={14}
              animationDuration={360}
              animationEasing="ease-out"
            />
            {/* barre du bpm maximum */}
            <Bar
              dataKey="max"
              fill="#ff3b0a"
              radius={[10, 10, 10, 10]}
              barSize={14}
              animationDuration={360}
              animationEasing="ease-out"
            />
            {/* ligne de la moyenne, change de couleur au survol */}
            <Line
              type="monotone"
              dataKey="average"
              stroke={isChartHovered ? "#1f38ff" : "#e3e8ff"}
              strokeWidth={3}
              dot={{ r: 4, fill: "#1f38ff", stroke: "#ffffff", strokeWidth: 1 }}
              activeDot={{ r: 5, fill: "#1f38ff", stroke: "#ffffff", strokeWidth: 1 }}
              animationDuration={420}
              animationEasing="ease-out"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* légende affichée sous le graphique */}
      <div className="bpm-card__legend">
        <div className="bpm-card__legend-item">
          <span className="bpm-card__dot bpm-card__dot--min" />
          <span>Min</span>
        </div>
        <div className="bpm-card__legend-item">
          <span className="bpm-card__dot bpm-card__dot--max" />
          <span>Max BPM</span>
        </div>
        <div className="bpm-card__legend-item">
          <span className="bpm-card__dot bpm-card__dot--avg" />
          <span>Moy BPM</span>
        </div>
      </div>
    </section>
  );
}