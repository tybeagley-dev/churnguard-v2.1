import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface MonthlyTrendsData {
  month: string;
  monthLabel: string;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
}

export default function MonthlyTrendsChart() {
  // Fetch historical monthly data for the previous 12 months
  const { data: monthlyData, isLoading, error } = useQuery({
    queryKey: ['/api/bigquery/monthly-trends', 'risk_level'],
    queryFn: async () => {
      const response = await fetch(`/api/bigquery/monthly-trends?segmentation=risk_level`);
      if (!response.ok) {
        throw new Error('Failed to fetch monthly trends data');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: true,
    retry: 1,
    staleTime: 30000
  });

  const colors = {
    high_risk: '#dc2626', // Red
    medium_risk: '#f59e0b', // Orange
    low_risk: '#10b981' // Green
  };

  // Custom tooltip content that includes totals
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Calculate total from all payload values
      const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
      
      return (
        <div className="bg-white border border-gray-300 rounded-md p-3 shadow-lg">
          <p className="text-gray-900 font-bold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {new Intl.NumberFormat('en-US').format(entry.value)}
            </p>
          ))}
          <hr className="my-2 border-gray-200" />
          <p className="text-gray-900 font-semibold text-sm">
            Total: {new Intl.NumberFormat('en-US').format(total)}
          </p>
        </div>
      );
    }
    return null;
  };

  const formatYAxisTick = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends - Previous 12 Months</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends - Previous 12 Months</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-red-500">Error loading monthly trends data</p>
            <p className="text-sm text-gray-500 mt-2">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!monthlyData || !Array.isArray(monthlyData) || monthlyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends - Previous 12 Months</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500">No monthly trend data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Monthly Trends</CardTitle>
            <p className="text-sm text-gray-600">Total Accounts by Risk Level | Rolling 12 months</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="monthLabel" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={formatYAxisTick}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="high_risk" stackId="a" fill={colors.high_risk} name="High Risk" />
              <Bar dataKey="medium_risk" stackId="a" fill={colors.medium_risk} name="Medium Risk" />
              <Bar dataKey="low_risk" stackId="a" fill={colors.low_risk} name="Low Risk" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}