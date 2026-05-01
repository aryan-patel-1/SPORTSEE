import { PieChart, Pie, ResponsiveContainer } from "recharts";
import type { WeeklyStatsViewModel } from "../../utils/viewModels";
import "../../css/weekly-stats.css";

type WeeklyStatsProps = {
  data: WeeklyStatsViewModel;
};

// bloc "cette semaine" avec donut de progression et totaux
export default function WeeklyStats({ data }: WeeklyStatsProps) {
  return (
    <section className="weekly">
      <div className="weekly__header">
        <h2>Cette semaine</h2>
        <p>{data.periodLabel}</p>
      </div>

      <div className="weekly__content">
        <div className="weekly__card">
          <h3>
            <span className="weekly__blue">x{data.completed}</span> sur objectif de {data.goal}
          </h3>
          <p>Courses hebdomadaire réalisées</p>

          <div className="weekly__chart-area">
            <div className="weekly__chart">
              <ResponsiveContainer width={220} height={220}>
                <PieChart>
                  <Pie
                    data={data.chartData}
                    dataKey="value"
                    innerRadius={48}
                    outerRadius={82}
                    startAngle={0}
                    endAngle={-360}
                    stroke="none"
                    animationDuration={420}
                    animationEasing="ease-out"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="weekly__legend weekly__legend--left">
              <span className="weekly__dot weekly__dot--blue" />
              <span>{data.completedLabel}</span>
            </div>

            <div className="weekly__legend weekly__legend--right">
              <span className="weekly__dot weekly__dot--gray" />
              <span>{data.remainingLabel}</span>
            </div>
          </div>
        </div>

        {/* cartes latérales avec les totaux durée et distance */}
        <div className="weekly__right">
          <div className="weekly__mini">
            <p>Durée d'activité</p>
            <h3 className="blue">{data.totalDurationLabel}</h3>
          </div>

          <div className="weekly__mini">
            <p>Distance</p>
            <h3 className="orange">{data.totalDistanceLabel}</h3>
          </div>
        </div>
      </div>
    </section>
  );
}