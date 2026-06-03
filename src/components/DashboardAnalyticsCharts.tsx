import React from 'react';

const mockChartDataMonthly = [
  { month: 'Jan', spend: 320, flights: 1 },
  { month: 'Feb', spend: 890, flights: 2 },
  { month: 'Mar', spend: 410, flights: 1 },
  { month: 'Apr', spend: 1120, flights: 3 },
  { month: 'May', spend: 750, flights: 2 },
  { month: 'Jun', spend: 1420, flights: 4 }
];

interface AnalyticsChartsProps {
  lang: 'en' | 'ar';
}

export default function DashboardAnalyticsCharts({ lang }: AnalyticsChartsProps) {
  const [AreaChart, setAreaChart] = React.useState<any>(null);
  const [BarChart, setBarChart] = React.useState<any>(null);
  const [ResponsiveContainer, setResponsiveContainer] = React.useState<any>(null);
  const [Area, setArea] = React.useState<any>(null);
  const [XAxis, setXAxis] = React.useState<any>(null);
  const [YAxis, setYAxis] = React.useState<any>(null);
  const [CartesianGrid, setCartesianGrid] = React.useState<any>(null);
  const [Tooltip, setTooltip] = React.useState<any>(null);
  const [Bar, setBar] = React.useState<any>(null);

  React.useEffect(() => {
    let mounted = true;
    import('recharts').then((module) => {
      if (!mounted) return;
      setAreaChart(() => module.AreaChart);
      setBarChart(() => module.BarChart);
      setResponsiveContainer(() => module.ResponsiveContainer);
      setArea(() => module.Area);
      setXAxis(() => module.XAxis);
      setYAxis(() => module.YAxis);
      setCartesianGrid(() => module.CartesianGrid);
      setTooltip(() => module.Tooltip);
      setBar(() => module.Bar);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!AreaChart || !BarChart || !ResponsiveContainer || !Area || !XAxis || !YAxis || !CartesianGrid || !Tooltip || !Bar) {
    return (
      <div className="grid grid-cols-1 gap-6">
        <div className="h-56 rounded-3xl bg-slate-100 dark:bg-stone-900 animate-pulse" />
        <div className="h-56 rounded-3xl bg-slate-100 dark:bg-stone-900 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-stone-900 border border-slate-100 dark:border-stone-800/85 p-6 rounded-3xl space-y-4">
        <div>
          <h3 className="font-serif text-base font-bold text-slate-800 dark:text-slate-100">
            {lang === 'en' ? 'Monthly Flight Expenditures' : 'إحصائيات الإنفاق السنوي'}
          </h3>
          <p className="text-xs text-slate-400">Total spend of active miles rewards in 2026</p>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockChartDataMonthly} margin={{ left: -25, top: 10 }}>
              <defs>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4A24C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4A24C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tickLine={false} style={{ fontSize: '10px', fill: '#94a3b8' }} />
              <YAxis tickLine={false} style={{ fontSize: '10px', fill: '#94a3b8' }} />
              <Tooltip />
              <Area type="monotone" dataKey="spend" stroke="#D4A24C" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-900 border border-slate-100 dark:border-stone-800/85 p-6 rounded-3xl space-y-4">
        <div>
          <h3 className="font-serif text-base font-bold text-slate-800 dark:text-slate-100">
            {lang === 'en' ? 'Flight Tallies' : 'معدل السفر الشهري'}
          </h3>
          <p className="text-xs text-slate-400">Flights taken per month in 2026</p>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockChartDataMonthly} margin={{ left: -25, top: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tickLine={false} style={{ fontSize: '10px', fill: '#94a3b8' }} />
              <YAxis tickLine={false} style={{ fontSize: '10px', fill: '#94a3b8' }} />
              <Tooltip />
              <Bar dataKey="flights" fill="#E0B15A" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
