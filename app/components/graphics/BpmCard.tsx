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
import {
  formatActivityPeriod,
  formatTooltipActivityDate,
  sortActivitiesByDate,
  type UserActivity,
} from "../../utils/activity";
import "../../css/bpm-card.css";

// nombre d'activités affichées par page du graphique
const ACTIVITIES_PER_PAGE = 7;
// libellés des jours affichés sous le graphique
const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

type BpmCardProps = {
  data: UserActivity[];
};

// type du tooltip passé à Recharts
type BpmTooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload: {
      min: number;
      max: number;
      average: number;
      date: string;
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
      <p className="bpm-card__tooltip-date">{formatTooltipActivityDate(d.date)}</p>
      <p className="bpm-card__tooltip-value">Min : {d.min} BPM</p>
      <p className="bpm-card__tooltip-value">Max : {d.max} BPM</p>
      <p className="bpm-card__tooltip-value">Moy : {d.average} BPM</p>
    </div>
  );
}

// carte des fréquences cardiaques, barres min/max et ligne de moyenne
export default function BpmCard({ data }: BpmCardProps) {
  // on trie les activités par date avant d'afficher
  const sortedActivities = sortActivitiesByDate(data);

  // nombre de pages, toujours au moins 1
  const pageCount = Math.max(1, Math.ceil(sortedActivities.length / ACTIVITIES_PER_PAGE));

  // on ouvre par défaut sur la dernière page (données récentes)
  const [pageIndex, setPageIndex] = useState(Math.max(pageCount - 1, 0));
  const [isChartHovered, setIsChartHovered] = useState(false);

  // si le nombre de pages change on repositionne sur la dernière
  useEffect(() => {
    setPageIndex(Math.max(pageCount - 1, 0));
  }, [pageCount]);

  // activités visibles de la page courante
  const pageStart = pageIndex * ACTIVITIES_PER_PAGE;
  const visibleActivities = sortedActivities.slice(pageStart, pageStart + ACTIVITIES_PER_PAGE);

  // on formate les données pour Recharts
  const bpmChartData = visibleActivities.map((activity, index) => ({
    day: DAY_LABELS[index % DAY_LABELS.length],
    min: activity.heartRate.min,
    max: activity.heartRate.max,
    average: activity.heartRate.average,
    date: activity.date,
  }));

  // moyenne des bpm moyens affichée dans le titre
  const averageBpm =
    bpmChartData.length > 0
      ? bpmChartData.reduce((total, item) => total + item.average, 0) / bpmChartData.length
      : 0;

  // période affichée dans l'en-tête
  const startDate = bpmChartData[0]?.date;
  const endDate = bpmChartData[bpmChartData.length - 1]?.date;
  const period = startDate && endDate ? formatActivityPeriod(startDate, endDate) : "Aucune donnée";

  // désactive les flèches aux extrémités
  const canGoToPreviousPage = pageIndex > 0;
  const canGoToNextPage = pageIndex < pageCount - 1;

  return (
    <section className="bpm-card">
      <div className="bpm-card__header">
        <div className="bpm-card__header-left">
          <h3 className="bpm-card__title">{Math.round(averageBpm)} BPM</h3>
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
          <span>{period}</span>
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
              isAnimationActive={false}
            />
            {/* barre du bpm maximum */}
            <Bar
              dataKey="max"
              fill="#ff3b0a"
              radius={[10, 10, 10, 10]}
              barSize={14}
              isAnimationActive={false}
            />
            {/* ligne de la moyenne, change de couleur au survol */}
            <Line
              type="monotone"
              dataKey="average"
              stroke={isChartHovered ? "#1f38ff" : "#e3e8ff"}
              strokeWidth={3}
              dot={{ r: 4, fill: "#1f38ff", stroke: "#ffffff", strokeWidth: 1 }}
              activeDot={{ r: 5, fill: "#1f38ff", stroke: "#ffffff", strokeWidth: 1 }}
              isAnimationActive={false}
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