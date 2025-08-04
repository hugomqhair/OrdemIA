
"use client";

import { StatsCard } from "@/components/dashboard/stats-card"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { RecentBudgets } from "@/components/dashboard/recent-budgets"
import { getBudgets } from "@/services/budget-service"
import { FileText, CheckCircle, Clock, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { HydratedBudget } from "@/lib/types"
import { useAuth } from "@/components/auth/auth-provider"

export default function DashboardPage() {
  const { user } = useAuth();
  const [allBudgets, setAllBudgets] = useState<HydratedBudget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBudgets() {
      if (!user) return;
      try {
        const budgets = await getBudgets();
        setAllBudgets(budgets);
      } catch (error) {
        console.error("Failed to fetch budgets", error);
      } finally {
        setLoading(false);
      }
    }
    loadBudgets();
  }, [user]);

  const totalBudgets = allBudgets.length;
  const acceptedBudgets = allBudgets.filter(b => b.status === 'Aceito').length;
  const openBudgets = allBudgets.filter(b => b.status === 'Aberto').length;
  const refusedBudgets = allBudgets.filter(b => b.status === 'Recusado').length;
  const finalizedBudgets = allBudgets.filter(b => b.status === 'Finalizado').length;

  const chartData = [
    { status: "Abertos", value: openBudgets, fill: "var(--color-open)" },
    { status: "Aceitos", value: acceptedBudgets, fill: "var(--color-accepted)" },
    { status: "Finalizados", value: finalizedBudgets, fill: "var(--color-finalized)" },
    { status: "Recusados", value: refusedBudgets, fill: "var(--color-refused)" },
  ]

  const recentBudgets = allBudgets.slice(0, 5);

  if (loading) {
      return <div>Carregando...</div>
  }


  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta! Aqui está um resumo do seu negócio.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Orçamentos"
          value={totalBudgets}
          Icon={FileText}
          description="Total de orçamentos criados"
        />
        <StatsCard
          title="Orçamentos Aceitos"
          value={acceptedBudgets}
          Icon={CheckCircle}
          description="Orçamentos aprovados pelos clientes"
        />
        <StatsCard
          title="Em Aberto"
          value={openBudgets}
          Icon={Clock}
          description="Aguardando aprovação do cliente"
        />
        <StatsCard
          title="Recusados"
          value={refusedBudgets}
          Icon={XCircle}
          description="Orçamentos que foram recusados"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-5">
        <OverviewChart data={chartData} />
        <RecentBudgets budgets={recentBudgets} />
      </div>
    </div>
  )
}
