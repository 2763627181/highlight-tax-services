import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TrendingUp, Activity, Calendar, DollarSign } from "lucide-react";

interface AnalyticsData {
  casesByMonth: { month: string; count: number; amount: number }[];
  casesByStatus: { status: string; count: number }[];
  casesByYear: { year: number; count: number; amount: number }[];
  recentActivity: { date: string; action: string; details: string }[];
}

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  in_process: "En Proceso",
  sent_to_irs: "Enviado IRS",
  approved: "Aprobado",
  refund_issued: "Reembolso",
};

const statusColors: Record<string, string> = {
  pending: "#f59e0b",
  in_process: "#3b82f6",
  sent_to_irs: "#8b5cf6",
  approved: "#22c55e",
  refund_issued: "#10b981",
};

const CHART_COLORS = ["#0A3D62", "#2ECC71", "#3498db", "#9b59b6", "#f39c12"];

export function AnalyticsDashboard() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  const pieData = analytics?.casesByStatus.map(item => ({
    name: statusLabels[item.status] || item.status,
    value: item.count,
    color: statusColors[item.status] || "#666",
  })) || [];

  const totalCases = pieData.reduce((acc, item) => acc + item.value, 0);
  const totalRevenue = analytics?.casesByMonth.reduce((acc, item) => acc + item.amount, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="analytics-total-cases">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCases}</p>
                <p className="text-xs text-muted-foreground">Total Casos (12 meses)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="analytics-revenue">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-accent">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Ingresos Est. (12 meses)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="analytics-monthly-avg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(totalCases / 12)}</p>
                <p className="text-xs text-muted-foreground">Promedio Mensual</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="analytics-years">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics?.casesByYear.length || 0}</p>
                <p className="text-xs text-muted-foreground">Años Fiscales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="analytics-cases-chart">
          <CardHeader>
            <CardTitle className="text-lg">Casos por Mes</CardTitle>
            <CardDescription>Tendencia de los últimos 12 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.casesByMonth || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 10 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [value, "Casos"]}
                  />
                  <Bar dataKey="count" fill="#0A3D62" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="analytics-status-chart">
          <CardHeader>
            <CardTitle className="text-lg">Casos por Estado</CardTitle>
            <CardDescription>Distribución actual de casos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground w-full">Sin datos</p>
              )}
              <div className="space-y-2">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="analytics-revenue-chart">
          <CardHeader>
            <CardTitle className="text-lg">Ingresos por Mes</CardTitle>
            <CardDescription>Montos estimados de reembolsos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.casesByMonth || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 10 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }}
                    className="text-muted-foreground"
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Monto"]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#2ECC71" 
                    strokeWidth={2}
                    dot={{ fill: "#2ECC71", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="analytics-activity">
          <CardHeader>
            <CardTitle className="text-lg">Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {analytics.recentActivity.map((activity, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-3 p-2 rounded-lg border"
                      data-testid={`activity-item-${index}`}
                    >
                      <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {activity.action.replace(/_/g, " ")}
                          </Badge>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {format(new Date(activity.date), "dd/MM HH:mm", { locale: es })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {activity.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Sin actividad reciente</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {analytics?.casesByYear && analytics.casesByYear.length > 0 && (
        <Card data-testid="analytics-years-table">
          <CardHeader>
            <CardTitle className="text-lg">Resumen por Año Fiscal</CardTitle>
            <CardDescription>Estadísticas por año de declaración</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analytics.casesByYear.map((year) => (
                <div 
                  key={year.year} 
                  className="p-4 rounded-lg border text-center"
                  data-testid={`year-stat-${year.year}`}
                >
                  <p className="text-2xl font-bold text-primary">{year.year}</p>
                  <p className="text-sm text-muted-foreground">{year.count} casos</p>
                  <p className="text-sm font-medium text-accent">${year.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
