"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProductForm } from "./_components/product-form";
import { ProductList } from "./_components/product-list";
import { getProducts } from "@/services/product-service";
import { useAuth } from "@/components/auth/auth-provider";
import { useEffect, useState, useCallback } from "react";
import type { Product, WithId } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";


export default function ProductsPage() {
  const [products, setProducts] = useState<WithId<Product>[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    try {
        const productList = await getProducts();
        setProducts(productList);
    } catch(err) {
        console.error(err);
        toast({
            variant: "destructive",
            title: "Erro ao carregar produtos",
            description: "Não foi possível buscar a lista de itens."
        })
    }
  }, [toast]);


  useEffect(() => {
    if (user) {
      fetchProducts().finally(() => setLoading(false));
    }
  }, [user, fetchProducts]);

  const handleSuccess = () => {
      setIsCreateOpen(false);
      fetchProducts();
  }

  const handleProductDeleted = (id: string) => {
      setProducts(prev => prev.filter(p => p.id !== id));
  }

  if (loading) {
    return <div>Carregando produtos e serviços...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Produtos e Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie seus produtos e serviços.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-headline">Novo Item</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo item.
              </DialogDescription>
            </DialogHeader>
            <ProductForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

     <ProductList products={products} onProductDeleted={handleProductDeleted} onProductUpdated={fetchProducts} />

    </div>
  );
}
