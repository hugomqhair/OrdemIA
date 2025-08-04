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
import { useToast } from "@/hooks/use-toast";
import { createCustomer, updateCustomer } from "@/services/customer-service";
import type { Customer, WithId } from "@/lib/types";
import { useAuth } from "@/components/auth/auth-provider";

const FormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  document: z.string().min(1, 'CPF/CNPJ é obrigatório'),
});

type CustomerFormProps = {
  customer?: WithId<Customer>;
  onSuccess?: () => void;
};

export function CustomerForm({ customer, onSuccess }: CustomerFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: customer?.name ?? "",
      email: customer?.email ?? "",
      phone: customer?.phone ?? "",
      document: customer?.document ?? "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Erro de autenticação",
            description: "Você precisa estar logado para salvar um cliente.",
        });
        return;
    }
    try {
      if (customer) {
        await updateCustomer(customer.id, { ...data, userId: user.uid });
        toast({
          title: "Cliente atualizado!",
          description: "Os dados do cliente foram atualizados com sucesso.",
        });
      } else {
        await createCustomer({ ...data, userId: user.uid });
        toast({
          title: "Cliente criado!",
          description: "O novo cliente foi criado com sucesso.",
        });
        form.reset();
      }
      onSuccess?.();
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Erro ao salvar cliente",
            description: "Ocorreu um erro ao salvar o cliente. Tente novamente.",
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
                <Input placeholder="Nome do cliente" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@cliente.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input placeholder="(99) 99999-9999" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="document"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF/CNPJ</FormLabel>
              <FormControl>
                <Input placeholder="99.999.999/0001-99" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Salvar</Button>
      </form>
    </Form>
  );
}
