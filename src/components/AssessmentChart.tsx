'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface AssessmentChartProps {
  data: Record<string, number[]>;
  selectedCategory: string;
}

export default function AssessmentChart({ data, selectedCategory }: AssessmentChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // 이전 차트 인스턴스 제거
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // 데이터 준비
    const dates = Object.keys(data).sort();
    const values = dates.map(date => {
      const measurements = data[date];
      return measurements.length > 0 
        ? measurements.reduce((sum, val) => sum + val, 0) / measurements.length
        : 0;
    });

    // 차트 생성
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: `${selectedCategory} 점수`,
          data: values,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                return `${selectedCategory}: ${value.toFixed(1)}점`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: '점수'
            }
          },
          x: {
            title: {
              display: true,
              text: '평가 날짜'
            }
          }
        }
      }
    });

    // 컴포넌트 언마운트 시 차트 정리
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, selectedCategory]);

  return (
    <div className="relative h-80">
      <canvas ref={chartRef} />
    </div>
  );
} 