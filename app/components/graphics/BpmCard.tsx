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

const ACTIVITIES_PER_PAGE = 7;
const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

type BpmCardProps = {
  data: UserActivity[];
};

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

// Défini en dehors du composant pour éviter une recréation à chaque render.
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

export default function BpmCard({ data }: BpmCardProps) {
  const sortedActivities = sortActivitiesByDate(data);
  const pageCount = Math.max(1, Math.ceil(sortedActivities.length / ACTIVITIES_PER_PAGE));
  const [pageIndex, setPageIndex] = useState(Math.max(pageCount - 1, 0));
  const [isChartHovered, setIsChartHovered] = useState(false);

  // Synchronise la page courante quand les données changent.
  useEffect(() => {
    setPageIndex(Math.max(pageCount - 1, 0));
  }, [pageCount]);

  const pageStart = pageIndex * ACTIVITIES_PER_PAGE;
  const visibleActivities = sortedActivities.slice(pageStart, pageStart + ACTIVITIES_PER_PAGE);

  const bpmChartData = visibleActivities.map((activity, index) => ({
    day: DAY_LABELS[index % DAY_LABELS.length],
    min: activity.heartRate.min,
    max: activity.heartRate.max,
    average: activity.heartRate.average,
    date: activity.date,
  }));

  const averageBpm =
    bpmChartData.length > 0
      ? bpmChartData.reduce((total, item) => total + item.average, 0) / bpmChartData.length
      : 0;

  const startDate = bpmChartData[0]?.date;
  const endDate = bpmChartData[bpmChartData.length - 1]?.date;
  const period = startDate && endDate ? formatActivityPeriod(startDate, endDate) : "Aucune donnée";

  const canGoToPreviousPage = pageIndex > 0;
  const canGoToNextPage = pageIndex < pageCount - 1;

  return (
    <section className="bpm-card">
      <div className="bpm-card__header">
        <div className="bpm-card__header-left">
          <h3 className="bpm-card__title">{Math.round(averageBpm)} BPM</h3>
          <p className="bpm-card__subtitle">Fréquence cardiaque moyenne</p>
        </div>

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
        <ResponsiveContainer width="100%" height={290}>
          <ComposedChart
            data={bpmChartData}
            barCategoryGap={22}
            onMouseMove={(state) => setIsChartHovered(Boolean(state?.isTooltipActive))}
            onMouseLeave={() => setIsChartHovered(false)}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e7e7e7" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <YAxis
              domain={[130, 187]}
              ticks={[130, 145, 160, 187]}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomBpmTooltip />} cursor={{ fill: "transparent" }} />
            <Bar
              dataKey="min"
              fill="#f3b8ac"
              radius={[10, 10, 10, 10]}
              barSize={14}
              isAnimationActive={false}
            />
            <Bar
              dataKey="max"
              fill="#ff3b0a"
              radius={[10, 10, 10, 10]}
              barSize={14}
              isAnimationActive={false}
            />
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