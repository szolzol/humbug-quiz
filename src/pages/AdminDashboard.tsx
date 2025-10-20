/**
 * Admin Dashboard - Main Overview Page
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Users,
  BookOpen,
  Package,
  Activity,
  TrendingUp,
  Play,
  CheckCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DashboardStats {
  totalUsers: number;
  totalQuestions: number;
  totalPacks: number;
  totalPlays: number;
  totalSolved: number;
  recentActivities: number;
  usersChange: number;
  questionsChange: number;
  packsChange: number;
  playsChange: number;
  solvedChange: number;
}

interface ChartDataPoint {
  date: string;
  users: number;
  plays: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalQuestions: 0,
    totalPacks: 0,
    totalPlays: 0,
    totalSolved: 0,
    recentActivities: 0,
    usersChange: 0,
    questionsChange: 0,
    packsChange: 0,
    playsChange: 0,
    solvedChange: 0,
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch stats and chart data
      const response = await fetch("/api/admin?resource=dashboard-stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setChartData(data.chartData);
      }
    } catch (error) {
      // Error fetching dashboard data
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the Humbug Quiz Admin Panel
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 animate-pulse bg-muted rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats.totalUsers.toLocaleString()}
                </div>
                {stats.usersChange !== 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    {stats.usersChange > 0 ? "+" : ""}
                    {stats.usersChange} this week
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 animate-pulse bg-muted rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats.totalQuestions.toLocaleString()}
                </div>
                {stats.questionsChange !== 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    {stats.questionsChange > 0 ? "+" : ""}
                    {stats.questionsChange} this week
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Played</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 animate-pulse bg-muted rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats.totalPlays.toLocaleString()}
                </div>
                {stats.playsChange !== 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    {stats.playsChange > 0 ? "+" : ""}
                    {stats.playsChange} this week
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Activities (24h)
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 animate-pulse bg-muted rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats.recentActivities.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Admin actions
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Trends (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[400px] flex items-center justify-center">
              <div className="text-muted-foreground">Loading chart...</div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Activity className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No data available</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString();
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#eab308"
                  strokeWidth={2}
                  name="Total Users"
                  dot={{ r: 3, fill: "#eab308" }}
                />
                <Line
                  type="monotone"
                  dataKey="plays"
                  stroke="hsl(142, 76%, 36%)"
                  strokeWidth={2}
                  name="Total Plays"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
