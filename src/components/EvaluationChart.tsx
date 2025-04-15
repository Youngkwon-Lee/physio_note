import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Evaluation } from '../types/evaluation';

interface EvaluationChartProps {
  evaluations: Evaluation[];
  fieldId: string;
  fieldLabel: string;
}

const EvaluationChart: React.FC<EvaluationChartProps> = ({
  evaluations,
  fieldId,
  fieldLabel,
}) => {
  // 평가 결과 데이터 가공
  const chartData = evaluations
    .filter(evaluation => evaluation.results[fieldId]?.value !== undefined)
    .map(evaluation => ({
      date: new Date(evaluation.date).toLocaleDateString(),
      value: evaluation.results[fieldId].value,
      type: evaluation.type === 'initial' ? '초기' : 
            evaluation.type === 'progress' ? '진행' : '종료',
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">{fieldLabel} 추이</h3>
        <p className="text-gray-500">데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">{fieldLabel} 추이</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              name={fieldLabel}
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EvaluationChart; 