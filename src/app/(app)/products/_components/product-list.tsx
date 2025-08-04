"use client";

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
import type { Product, WithId } from "@/lib/types";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProductForm } from "./product-form";
import { deleteProduct } from "@/services/product-service";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageIcon } from "lucide-react";

type ProductListProps = {
  products: WithId<Product>[];
  onProductDeleted: (id: string) => void;
  onProductUpdated: () => void;
};

export function ProductList({ products, onProductDeleted, onProductUpdated }: ProductListProps) {
    const { toast } = useToast();
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<WithId<Product> | null>(null);

    const handleDelete = async (id: string) => {
        try {
            await deleteProduct(id);
            onProductDeleted(id);
            toast({
                title: "Item excluído!",
                description: "O item foi excluído com sucesso.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro ao excluir o item",
                description: "Ocorreu um erro ao excluir o item. Tente novamente.",
            });
        }
    }
    
    const openEditDialog = (product: WithId<Product>) => {
      setSelectedProduct(product);
      setIsEditDialogOpen(true);
    }

    const handleSuccess = () => {
        setIsEditDialogOpen(false);
        onProductUpdated();
    }

  return (
    <>
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Foto</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                        Nenhum item encontrado.
                    </TableCell>
                </TableRow>
            ) : products.map((product) => (
              <TableRow key={product.id}>
                 <TableCell>
                  <Avatar>
                    <AvatarImage src={product.photoUrl} alt={product.name} data-ai-hint="product photo"/>
                    <AvatarFallback><ImageIcon className="h-5 w-5 text-muted-foreground" /></AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-muted-foreground">{product.type}</TableCell>
                <TableCell className="text-muted-foreground">{product.unit}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                    {product.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
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
                            <DropdownMenuItem onSelect={() => openEditDialog(product)}>
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
                            permanentemente o item.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(product.id)}>
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-headline">
                Editar Item
              </DialogTitle>
              <DialogDescription>
                Atualize os dados do item.
              </DialogDescription>
            </DialogHeader>
            <ProductForm product={selectedProduct!} onSuccess={handleSuccess} />
          </DialogContent>
      </Dialog>
    </>
  );
}
