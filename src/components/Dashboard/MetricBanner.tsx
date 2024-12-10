import { useState } from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import React from 'react';


interface MetricBannerProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  historicalData?: { value: number; timestamp: string }[];
}

export function MetricBanner({ title, value, subtitle, change, historicalData }: MetricBannerProps) {
  const [showChart, setShowChart] = useState(false);

  return (
    <div 
      className="p-4 bg-white rounded-lg shadow-md relative"
      onMouseEnter={() => setShowChart(true)}
      onMouseLeave={() => setShowChart(false)}
    >
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-1">
        <span className="text-2xl font-semibold">{value}</span>
        {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
        {change && (
          <span className={`ml-2 text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      {showChart && historicalData && (
        <div className="absolute bottom-0 left-0 w-full h-16 bg-white rounded-b-lg">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#4F46E5" 
                dot={false} 
              />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}