"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FilePen, Trash2 } from "lucide-react";
import type { Customer, WithId } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { CustomerForm } from "./customer-form";
import { deleteCustomer } from "@/services/customer-service";
import { useToast } from "@/hooks/use-toast";

type CustomerListProps = {
  customers: WithId<Customer>[];
  onCustomerDeleted: (id: string) => void;
};

export function CustomerList({ customers, onCustomerDeleted }: CustomerListProps) {
    const { toast } = useToast();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<WithId<Customer> | null>(null);

    const handleDelete = async (id: string) => {
        try {
            await deleteCustomer(id);
            onCustomerDeleted(id);
            toast({
                title: "Cliente excluído!",
                description: "O cliente foi excluído com sucesso.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro ao excluir cliente",
                description: "Ocorreu um erro ao excluir o cliente. Tente novamente.",
            });
        }
    }

    const handleEditClick = (customer: WithId<Customer>) => {
        setSelectedCustomer(customer);
        setIsEditOpen(true);
    }

    const handleFormSuccess = () => {
        setIsEditOpen(false);
    }

  return (
    <>
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Telefone</TableHead>
              <TableHead className="hidden lg:table-cell">CPF/CNPJ</TableHead>
              <TableHead>
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        Nenhum cliente encontrado.
                    </TableCell>
                </TableRow>
            ) : customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {customer.email}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {customer.phone}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {customer.document}
                </TableCell>
                <TableCell>
                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => handleEditClick(customer)}>
                              <FilePen className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Você tem certeza absoluta?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Essa ação não pode ser desfeita. Isso excluirá
                            permanentemente o cliente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(customer.id)}>
                            Continuar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle className="font-headline">
                Editar Cliente
            </DialogTitle>
            <DialogDescription>
                Atualize os dados do cliente.
            </DialogDescription>
            </DialogHeader>
            <CustomerForm customer={selectedCustomer!} onSuccess={handleFormSuccess} />
        </DialogContent>
    </Dialog>
    </>
  );
}
