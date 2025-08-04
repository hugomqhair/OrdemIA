"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createProduct, updateProduct } from "@/services/product-service";
import type { Product, WithId } from "@/lib/types";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";

const FormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['Produto', 'Serviço']),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  value: z.coerce.number().min(0.01, 'Valor deve ser positivo'),
  photoUrl: z.string().optional(),
});

type ProductFormProps = {
  product?: WithId<Product>;
  onSuccess?: () => void;
};

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [preview, setPreview] = useState<string | null>(product?.photoUrl || null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: product?.name ?? "",
      type: product?.type ?? "Serviço",
      unit: product?.unit ?? "",
      value: product?.value ?? 0,
      photoUrl: product?.photoUrl ?? "",
    },
  });

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
            variant: "destructive",
            title: "Arquivo muito grande",
            description: "A imagem não pode ser maior que 2MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        form.setValue("photoUrl", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Erro de autenticação",
            description: "Você precisa estar logado para salvar um item.",
        });
        return;
    }
    try {
      if (product) {
        await updateProduct(product.id, { ...data, userId: user.uid });
        toast({
          title: "Item atualizado!",
          description: "Os dados do item foram atualizados com sucesso.",
        });
      } else {
        await createProduct({ ...data, userId: user.uid });
        toast({
          title: "Item criado!",
          description: "O novo item foi criado com sucesso.",
        });
        form.reset();
        setPreview(null);
      }
      onSuccess?.();
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Erro ao salvar item",
            description: "Ocorreu um erro ao salvar o item. Tente novamente.",
        });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome do item" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
               <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Produto">Produto</SelectItem>
                  <SelectItem value="Serviço">Serviço</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidade</FormLabel>
              <FormControl>
                <Input placeholder="un, h, m², etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
            <FormLabel>Foto do Item</FormLabel>
            <FormControl>
                <Input type="file" accept="image/png, image/jpeg" onChange={handlePhotoChange} />
            </FormControl>
            <FormMessage />
        </FormItem>

        {preview && (
            <div className="mt-4">
                <FormLabel>Pré-visualização</FormLabel>
                <div className="relative w-40 h-40 mt-2 border rounded-md">
                    <Image src={preview} alt="Pré-visualização do item" layout="fill" objectFit="contain" />
                </div>
            </div>
        )}
        <Button type="submit">Salvar</Button>
      </form>
    </Form>
  );
}
