import { useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Landmark, ArrowDownRight, ArrowUpRight, ArrowDown, ArrowUp, CheckCheck } from "lucide-react";
import { useDashboard } from "../../store/Dashboard/Dashboard";
import { Skeleton } from "../../components/ui/skeleton"

const Dashboard = () => {
  const { summary, monthlyData, recentPayments, loading, fetchDashboard } = useDashboard();

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background p-6 md:p-8">
        <div className="w-full">
          <div className="mb-6">
            <Skeleton className="h-10 w-52 mb-3" />
            <Skeleton className="h-4 w-72" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-card rounded-2xl border border-border p-5"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-6 w-56" />
                <Skeleton className="h-8 w-16" />
              </div>

              <Skeleton className="h-[320px] w-full rounded-xl" />
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex justify-between items-center mb-5">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-5 w-16" />
              </div>

              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />

                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>

                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-14" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!summary) return null;

  const fmt = (n: number | string) =>
    Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const net = Number(summary.outstanding.net_balance);

  return (
    <section className="min-h-screen w-full bg-background p-6 md:p-8">
      <div className="w-full max-w-none">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Welcome!</h1>
          <p className="text-sm text-muted-foreground mt-1">Here is your financial overview for today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <SummaryCard
            label="Net Total"
            value={`${net >= 0 ? "+" : ""}${fmt(net)}`}
            unit="TJS"
            valueColor="text-foreground"
            icon={<Landmark className="w-5 h-5 text-muted-foreground" />}
            iconBg="bg-muted"
          />
          <SummaryCard
            label="Owes Me"
            value={`+${fmt(summary.outstanding.they_owe_me)}`}
            unit="TJS"
            valueColor="text-emerald-600 dark:text-emerald-400"
            icon={<ArrowDownRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            iconBg="bg-emerald-500/10"
          />
          <SummaryCard
            label="I Owe"
            value={`-${fmt(summary.outstanding.i_owe_them)}`}
            unit="TJS"
            valueColor="text-rose-600 dark:text-rose-400"
            icon={<ArrowUpRight className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
            iconBg="bg-rose-500/10"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Monthly Debts Overview</h3>
              <div className="text-sm border border-border rounded-md px-3 py-1.5 text-muted-foreground bg-card">
                2026
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card)",
                    color: "var(--foreground)",
                    fontSize: 12,
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Line
                  type="monotone"
                  dataKey="lent"
                  stroke="#059669"
                  strokeWidth={2.5}
                  name="Lent (Owes Me)"
                  dot={{ r: 4, fill: "#059669" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="borrowed"
                  stroke="#e11d48"
                  strokeWidth={2.5}
                  strokeDasharray="6 4"
                  name="Borrowed (I Owe)"
                  dot={{ r: 4, fill: "#e11d48" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-foreground">Recent Payments</h3>
              <button className="text-sm text-sky-600 hover:text-sky-700 font-medium cursor-pointer">View All</button>
            </div>
            <ul className="space-y-4">
              {recentPayments.map((p) => {
                const incoming = p.direction === "they_owe_me";
                const closed = p.status === "closed" || p.status === "paid";
                return (
                  <li key={p.id} className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${closed
                          ? "bg-muted text-muted-foreground"
                          : incoming
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                    >
                      {closed ? (
                        <CheckCheck className="w-4 h-4" />
                      ) : incoming ? (
                        <ArrowDown className="w-4 h-4" />
                      ) : (
                        <ArrowUp className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{p.contact_name}</p>
                      {p.paid_at && (
                        <p className="text-xs text-muted-foreground truncate">
                          {new Date(p.paid_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${closed
                            ? "text-muted-foreground line-through"
                            : incoming
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                      >
                        {!closed && (incoming ? "+" : "-")}
                        {fmt(p.amount)}
                      </p>
                      <span
                        className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${closed
                            ? "bg-muted text-muted-foreground"
                            : incoming
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          }`}
                      >
                        {closed ? "Closed" : incoming ? "Incoming" : "Outgoing"}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

const SummaryCard = ({
  label,
  value,
  unit,
  valueColor,
  icon,
  iconBg,
}: {
  label: string;
  value: string;
  unit: string;
  valueColor: string;
  icon: React.ReactNode;
  iconBg: string;
}) => (
  <div className="rounded-xl bg-card border p-6 shadow-sm flex items-start justify-between transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl">    <div>
    <p className="text-sm text-muted-foreground mb-2">{label}</p>
    <h2 className={`text-2xl font-bold ${valueColor}`}>
      {value} <span className="text-xs font-medium text-muted-foreground/60 ml-1">{unit}</span>
    </h2>
  </div>
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>
      {icon}
    </div>
  </div>
);

export default Dashboard;
