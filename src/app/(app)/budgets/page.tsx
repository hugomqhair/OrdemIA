
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlusCircle, MoreHorizontal, FilePen, Download, Share2, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deleteBudget, getBudgets } from "@/services/budget-service";
import { StatusBadge } from "@/components/status-badge";
import type { BudgetStatus, CompanyInfo, HydratedBudget } from "@/lib/types";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { BudgetPdfDocument } from "./_components/budget-pdf-document";
import { getCompanyInfo } from "@/services/settings-service";
import { useAuth } from "@/components/auth/auth-provider";
import { useToast } from "@/hooks/use-toast";

export default function BudgetsPage() {
  const budgetStatuses: BudgetStatus[] = ["Aberto", "Aceito", "Finalizado", "Recusado"];
  const [allBudgets, setAllBudgets] = useState<HydratedBudget[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [budgets, companyData] = await Promise.all([
          getBudgets(),
          getCompanyInfo()
        ]);
        setAllBudgets(budgets);
        setCompanyInfo(companyData);
      } catch (error) {
        console.error("Failed to fetch data", error);
        toast({
            variant: "destructive",
            title: "Erro ao carregar dados",
            description: "Não foi possível carregar os dados. Tente novamente."
        })
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, toast]);

  const handleDelete = async (id: string) => {
    try {
        await deleteBudget(id);
        setAllBudgets(prev => prev.filter(b => b.id !== id));
        toast({
            title: "Orçamento excluído!",
            description: "O orçamento foi excluído com sucesso."
        })
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Erro ao excluir",
            description: "Não foi possível excluir o orçamento. Tente novamente."
        })
    }
  }

  const handleDownloadPdf = async (budget: HydratedBudget) => {
    const element = document.getElementById(`budget-pdf-${budget.id}`);
    if (!element) return;

    const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: true,
     });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`orcamento-${budget.id.substring(0,6).toUpperCase()}.pdf`);
  };

  if (loading) {
      return <div>Carregando orçamentos...</div>
  }
  
  const renderBudgetsTable = (budgets: HydratedBudget[]) => (
    <Card className="mt-4">
        <CardContent className="p-0">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Data</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>
                    <span className="sr-only">Ações</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {budgets.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                            Nenhum orçamento encontrado.
                        </TableCell>
                    </TableRow>
                ) : budgets.map((budget) => (
                <TableRow key={budget.id}>
                    <TableCell className="font-mono text-xs">{budget.id.substring(0, 6).toUpperCase()}</TableCell>
                    <TableCell className="font-medium">{budget.customer.name}</TableCell>
                    <TableCell>
                    <StatusBadge status={budget.status} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                    {format(new Date(budget.createdAt), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                    {budget.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </TableCell>
                    <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                            <Link href={`/budgets/${budget.id}`}>
                                <FilePen className="mr-2 h-4 w-4" /> Ver/Editar
                            </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadPdf(budget)}>
                            <Download className="mr-2 h-4 w-4" /> Baixar PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                            <Share2 className="mr-2 h-4 w-4" /> Compartilhar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(budget.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </CardContent>
    </Card>
  )

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Orçamentos</h1>
          <p className="text-muted-foreground">
            Crie e gerencie os orçamentos dos seus clientes.
          </p>
        </div>
        <Button asChild>
          <Link href="/budgets/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Orçamento
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="Todos">
        <TabsList>
          <TabsTrigger value="Todos">Todos</TabsTrigger>
          {budgetStatuses.map(status => (
            <TabsTrigger key={status} value={status}>{status}</TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="Todos">
            {renderBudgetsTable(allBudgets)}
        </TabsContent>

        {budgetStatuses.map(status => (
           <TabsContent key={status} value={status}>
                {renderBudgetsTable(allBudgets.filter(b => b.status === status))}
           </TabsContent>
        ))}
      </Tabs>
      <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', zIndex: -1 }}>
        {allBudgets.map(b => <BudgetPdfDocument key={b.id} budget={b} companyInfo={companyInfo} />)}
      </div>
    </div>
  );
}
