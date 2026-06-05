"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#f43f5e', '#10b981']

interface AnalyticsChartsProps {
  videoData: any[];
  viewDistribution: any[];
}

export function AnalyticsCharts({ videoData, viewDistribution }: AnalyticsChartsProps) {
  // Custom tooltip styles
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-sm p-4 border border-gray-100 shadow-xl rounded-xl">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-medium flex items-center gap-2" style={{ color: entry.color === 'url(#colorViews)' ? '#f43f5e' : '#8b5cf6' }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color === 'url(#colorViews)' ? '#f43f5e' : '#8b5cf6' }}></span>
              {entry.name}: <span className="text-gray-900 ml-auto pl-4">{entry.value.toLocaleString()}</span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const color = payload[0].payload.fill
      return (
        <div className="bg-white/90 backdrop-blur-sm p-3 border border-gray-100 shadow-xl rounded-xl">
          <p className="text-sm font-medium flex items-center gap-2" style={{ color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
            {payload[0].name}: <span className="text-gray-900 ml-auto pl-2">{payload[0].value}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-2 gap-8 mb-8">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-shadow hover:shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          Views & Comments
          <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Top 10</span>
        </h3>
        {videoData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={videoData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0.9}/>
                </linearGradient>
                <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#6d28d9" stopOpacity={0.9}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                angle={-45} 
                textAnchor="end"
                height={60} 
                dy={20}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
              <Bar dataKey="views" fill="url(#colorViews)" name="Views" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="comments" fill="url(#colorComments)" name="Comments" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[320px] flex items-center justify-center">
            <p className="text-gray-500 text-sm">No video data available</p>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-shadow hover:shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Video Status Distribution</h3>
        {viewDistribution.some((d) => d.value > 0) ? (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie 
                data={viewDistribution} 
                cx="50%" 
                cy="50%" 
                innerRadius={80}
                outerRadius={110} 
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {viewDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend iconType="circle" verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[320px] flex items-center justify-center">
            <p className="text-gray-500 text-sm">No video data available</p>
          </div>
        )}
      </div>
    </div>
  )
}
