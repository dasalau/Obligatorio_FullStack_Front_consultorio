import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

const estadosBase = ["pendiente", "confirmado", "cancelado", "atendido"];

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const TurnosByEstadoChart = ({ turnos }) => {
  const grouped = turnos.reduce((acc, turno) => {
    const estado = turno.estado || "pendiente";
    acc[estado] = (acc[estado] || 0) + 1;
    return acc;
  }, {});

  const labels = estadosBase;
  const data = {
    labels,
    datasets: [
      {
        data: labels.map((estado) => grouped[estado] || 0),
        backgroundColor: [
          "rgba(24, 68, 93, 0.82)",
          "rgba(47, 96, 123, 0.82)",
          "rgba(108, 140, 160, 0.82)",
          "rgba(160, 184, 196, 0.82)",
        ],
        borderColor: [
          "rgba(15, 47, 66, 1)",
          "rgba(34, 75, 104, 1)",
          "rgba(94, 122, 138, 1)",
          "rgba(136, 157, 170, 1)",
        ],
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500,
      easing: "easeOutCubic",
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(24, 36, 45, 0.94)",
        titleColor: "#f8fafc",
        bodyColor: "#f8fafc",
        borderColor: "rgba(148, 163, 184, 0.35)",
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#475569",
          font: {
            weight: "600",
          },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: "#475569",
        },
        grid: {
          color: "rgba(148, 163, 184, 0.18)",
        },
      },
    },
  };

  return (
    <section className="card section-card border-0">
      <div className="section-head">
        <h2 className="mb-1">Turnos por estado</h2>
        <p className="mb-2 text-secondary">Distribucion actual en la agenda</p>
      </div>
      <div className="chart-box" style={{ height: 280 }}>
        <Bar options={options} data={data} />
      </div>
    </section>
  );
};

export default TurnosByEstadoChart;
