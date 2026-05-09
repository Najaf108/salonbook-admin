// src/components/charts/TopSalonsChart.js
'use client';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

export default function TopSalonsChart({ data }) {
  if (!data?.length) return null;

  const config = {
    labels: data.map(d => d.name),
    datasets: [{
      data: data.map(d => d.revenue),
      backgroundColor: ['#7C3AED','#059669','#2563EB','#D97706','#DC2626'],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, font: { size: 11 }, padding: 16 } },
      tooltip: { callbacks: { label: ctx => ` PKR ${ctx.parsed.toLocaleString()}` } },
    },
    cutout: '65%',
  };

  return <Doughnut data={config} options={options} />;
}
