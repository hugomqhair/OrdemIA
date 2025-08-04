"use client";

import { getCustomers } from "@/services/customer-service";
import { CustomerForm } from "./_components/customer-form";
import { CustomerList } from "./_components/customer-list";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import type { Customer, WithId } from "@/lib/types";
import { useAuth } from "@/components/auth/auth-provider";
import { useToast } from "@/hooks/use-toast";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<WithId<Customer>[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      getCustomers()
        .then(setCustomers)
        .catch(err => {
            console.error(err);
            toast({
                variant: "destructive",
                title: "Erro ao buscar clientes",
                description: "Não foi possível carregar a lista de clientes."
            })
        })
        .finally(() => setLoading(false));
    }
  }, [user, toast]);

  const handleFormSuccess = () => {
      setIsCreateOpen(false);
      // Refetch customers after create/update
       getCustomers().then(setCustomers);
  }

  const handleCustomerDeleted = (id: string) => {
      setCustomers(prev => prev.filter(c => c.id !== id));
  }

  if (loading) {
    return <div>Carregando clientes...</div>;
  }
  
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus clientes e veja seus detalhes.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-headline">Novo Cliente</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo cliente.
              </DialogDescription>
            </DialogHeader>
            <CustomerForm onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <CustomerList customers={customers} onCustomerDeleted={handleCustomerDeleted} />
    </div>
  );
}
