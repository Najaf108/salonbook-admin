// src/components/charts/BookingsChart.js
'use client';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, BarElement, LinearScale,
  CategoryScale, Tooltip, Legend,
} from 'chart.js';
ChartJS.register(BarElement, LinearScale, CategoryScale, Tooltip, Legend);

const STATUS_COLORS = {
  COMPLETED: '#059669',
  CONFIRMED: '#7C3AED',
  PENDING: '#D97706',
  CANCELLED: '#DC2626',
};

export default function BookingsChart({ data }) {
  const labels = data?.map(d => d.label) ?? [];

  const statusKeys = ['COMPLETED', 'CONFIRMED', 'PENDING', 'CANCELLED'];

  const config = {
    labels,
    datasets: statusKeys.map(status => ({
      label: status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' '),
      data: data?.map(d => d[status] ?? 0) ?? [],
      backgroundColor: STATUS_COLORS[status] + 'cc',
      borderRadius: 4,
      borderSkipped: false,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, pointStyleWidth: 8, font: { size: 12 } } },
    },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { stacked: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 } } },
    },
  };

  return <Bar data={config} options={options} />;
}
