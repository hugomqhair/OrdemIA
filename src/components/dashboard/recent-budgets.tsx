import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "../ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { format } from "date-fns"
import type { HydratedBudget } from "@/lib/types"

type RecentBudgetsProps = {
  budgets: HydratedBudget[];
}

export function RecentBudgets({ budgets }: RecentBudgetsProps) {
  return (
    <Card className="col-span-1 lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="font-headline">Orçamentos Recentes</CardTitle>
                <CardDescription>Confira os últimos orçamentos cadastrados.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
                <Link href="/budgets">
                    Ver todos <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgets.map((budget) => (
              <TableRow key={budget.id}>
                <TableCell>
                  <div className="font-medium">{budget.customer.name}</div>
                  <div className="text-sm text-muted-foreground hidden md:inline">
                    {budget.customer.email}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={budget.status} />
                </TableCell>
                <TableCell>{format(new Date(budget.createdAt), "dd/MM/yyyy")}</TableCell>
                <TableCell className="text-right">
                  {budget.total.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
