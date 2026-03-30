import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ProductChart = () => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: '#f1f5f9',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Mock data for product names and their performance (views/orders)
  const labels = ['Biological Booster', 'Nutri-Supp', 'Vita-Max', 'Growth Plus', 'Eco-Vaccine', 'Immuno-Strong'];

  const data = {
    labels,
    datasets: [
      {
        label: 'Product Views',
        data: [450, 320, 680, 210, 540, 490],
        backgroundColor: '#1E3A8A', // --admin-primary
        borderRadius: 8,
      },
      {
        label: 'Orders',
        data: [120, 85, 156, 45, 98, 110],
        backgroundColor: '#F97316', // --accent
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="chart-container fade-in">
      <div className="chart-header">
        <h2>Product Performance Analysis</h2>
      </div>
      <Bar options={options} data={data} />
    </div>
  );
};

export default ProductChart;