// src/components/charts/RevenueChart.js
'use client';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, LineElement, PointElement,
  LinearScale, CategoryScale, Filler, Tooltip, Legend,
} from 'chart.js';
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

export default function RevenueChart({ data }) {
  const labels  = data?.map(d => d.label) ?? [];
  const revenue = data?.map(d => d.revenue) ?? [];
  const fees    = data?.map(d => d.fees) ?? [];

  const config = {
    labels,
    datasets: [
      {
        label: 'Gross Revenue',
        data: revenue,
        borderColor: '#7C3AED',
        backgroundColor: 'rgba(124,58,237,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
      {
        label: 'Platform Fees',
        data: fees,
        borderColor: '#059669',
        backgroundColor: 'rgba(5,150,105,0.05)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, pointStyleWidth: 8, font: { size: 12 } } },
      tooltip: {
        callbacks: {
          label: ctx => `PKR ${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: {
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: { font: { size: 11 }, callback: v => `PKR ${(v / 1000).toFixed(0)}k` },
      },
    },
  };

  return <Line data={config} options={options} />;
}
