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
import { mockUserActivity } from "../mocks/mockdata";
import "../utils/dashboard.css";
import type { UserActivity } from "../utils/dataProvider";

const dayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

type BpmCardProps = {
  activity?: UserActivity[];
};

function formatDate(dateString: string, options: Intl.DateTimeFormatOptions) {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", options);
}

function buildBpmChart(activity: UserActivity[]) {
  const chartData = activity.slice(-7).map((entry, index) => ({
    day: dayLabels[index] ?? `J${index + 1}`,
    min: entry.heartRate.min,
    max: entry.heartRate.max,
    average: entry.heartRate.average,
    date: entry.date,
  }));
  const averageBpm =
    chartData.length > 0
      ? chartData.reduce((total, item) => total + item.average, 0) /
        chartData.length
      : 0;
  const startDate = chartData[0]?.date;
  const endDate = chartData[chartData.length - 1]?.date;

  return {
    chartData,
    averageBpm,
    period:
      startDate && endDate
        ? `${formatDate(startDate, { day: "numeric", month: "short" })} - ${formatDate(endDate, { day: "numeric", month: "short" })}`
        : "",
  };
}

function CustomBpmTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="bpm-card__tooltip">
      <p className="bpm-card__tooltip-date">
        {formatDate(data.date, { day: "2-digit", month: "2-digit" })}
      </p>
      <p className="bpm-card__tooltip-value">Min : {data.min} BPM</p>
      <p className="bpm-card__tooltip-value">Max : {data.max} BPM</p>
      <p className="bpm-card__tooltip-value">Moy : {data.average} BPM</p>
    </div>
  );
}

export default function BpmCard({ activity = mockUserActivity }: BpmCardProps) {
  // cette carte garde 7 points pour couvrir une semaine complète
  const { chartData, averageBpm, period } = buildBpmChart(activity);

  return (
    <section className="bpm-card">
      <div className="bpm-card__header">
        <div className="bpm-card__header-left">
          <h3 className="bpm-card__title">{Math.round(averageBpm)} BPM</h3>
          <p className="bpm-card__subtitle">Fréquence cardiaque moyenne</p>
        </div>

        <div className="bpm-card__period">
          <button type="button" className="bpm-card__arrow">
            ‹
          </button>
          <span>{period}</span>
          <button type="button" className="bpm-card__arrow">
            ›
          </button>
        </div>
      </div>

      <div className="bpm-card__chart">
        <ResponsiveContainer width="100%" height={290}>
          <ComposedChart data={chartData} barCategoryGap={22}>
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
            />
            <Bar
              dataKey="max"
              fill="#ff3b0a"
              activeBar={{ fill: "#e73300" }}
              radius={[10, 10, 10, 10]}
              barSize={14}
            />
            <Line
              type="monotone"
              dataKey="average"
              stroke="#7f8cff"
              strokeWidth={3}
              dot={{ r: 4, fill: "#1f38ff", stroke: "#ffffff", strokeWidth: 1 }}
              activeDot={{ r: 5 }}
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