"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
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
import { createBudget, updateBudget, type BudgetInput } from "@/services/budget-service";
import type { Customer, HydratedBudget, Product, WithId } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

const FormSchema = z.object({
  customerId: z.string().min(1, 'Cliente é obrigatório'),
  status: z.enum(['Aberto', 'Aceito', 'Finalizado', 'Recusado']),
  expiresAt: z.date({ required_error: "A data de validade é obrigatória." }),
  items: z.array(z.object({
    productId: z.string().min(1, "Selecione um item"),
    quantity: z.coerce.number().min(1, "A quantidade deve ser no mínimo 1"),
    unitValue: z.coerce.number(),
    productName: z.string(),
  })).min(1, "Adicione pelo menos um item"),
});

type BudgetFormProps = {
  customers: WithId<Customer>[];
  products: WithId<Product>[];
  budget?: HydratedBudget;
};

export function BudgetForm({ customers, products, budget }: BudgetFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  const defaultValues = budget ? {
    customerId: budget.customer.id,
    status: budget.status,
    expiresAt: new Date(budget.expiresAt),
    items: budget.items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitValue: item.unitValue,
        productName: item.product.name,
    })),
  } : {
    customerId: "",
    status: "Aberto" as const,
    expiresAt: addDays(new Date(), 30),
    items: [],
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchItems = form.watch("items");
  const total = watchItems.reduce((acc, item) => acc + (item.quantity * item.unitValue), 0);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Erro de autenticação",
            description: "Você precisa estar logado para salvar um orçamento.",
        });
        return;
    }
    try {
      const customer = customers.find(c => c.id === data.customerId);
      if (!customer) throw new Error("Cliente não encontrado");

      const budgetData: BudgetInput = {
        ...data,
        expiresAt: data.expiresAt.toISOString(),
        customerName: customer.name,
        total,
        userId: user.uid,
      };

      if (budget) {
        await updateBudget(budget.id, budgetData);
        toast({
          title: "Orçamento atualizado!",
          description: "Os dados do orçamento foram atualizados com sucesso.",
        });
        router.push("/budgets");
      } else {
        await createBudget(budgetData);
        toast({
          title: "Orçamento criado!",
          description: "O novo orçamento foi criado com sucesso.",
        });
        form.reset();
        router.push("/budgets");
      }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Erro ao salvar orçamento",
            description: "Ocorreu um erro ao salvar o orçamento. Tente novamente.",
        });
    }
  }

  const handleProductSelect = (productId: string, itemIndex: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
        form.setValue(`items.${itemIndex}.unitValue`, product.value);
        form.setValue(`items.${itemIndex}.productName`, product.name);
    }
  }

  const addNewItem = () => {
    append({ productId: "", quantity: 1, unitValue: 0, productName: "" });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
            <CardHeader><CardTitle>Informações Gerais</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
                <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um cliente" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {customers.map(customer => (
                                <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Aberto">Aberto</SelectItem>
                                <SelectItem value="Aceito">Aceito</SelectItem>
                                <SelectItem value="Finalizado">Finalizado</SelectItem>
                                <SelectItem value="Recusado">Recusado</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="expiresAt"
                    render={({ field }) => (
                        <FormItem className="flex flex-col pt-2">
                        <FormLabel>Validade</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>Selecione uma data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                date < new Date()
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Itens do Orçamento</CardTitle></CardHeader>
            <CardContent>
                <div className="mb-4">
                     {form.formState.errors.items && !form.formState.errors.items.root && (
                        <p className="text-sm font-medium text-destructive">
                           {form.formState.errors.items.message}
                        </p>
                    )}
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50%]">Item</TableHead>
                            <TableHead>Qtd.</TableHead>
                            <TableHead>Valor Un.</TableHead>
                            <TableHead>Subtotal</TableHead>
                            <TableHead><span className="sr-only">Ações</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields.map((field, index) => (
                            <TableRow key={field.id}>
                                <TableCell>
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.productId`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <Select onValueChange={(value) => {
                                                    field.onChange(value);
                                                    handleProductSelect(value, index);
                                                }} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione um item" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {products.map(p => (
                                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.quantity`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.unitValue`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input type="number" step="0.01" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </TableCell>
                                <TableCell>
                                    {(watchItems[index]?.quantity * watchItems[index]?.unitValue || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                </TableCell>
                                <TableCell>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={addNewItem}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Item
                </Button>
            </CardContent>
        </Card>
        
        <div className="flex justify-end items-center gap-4">
            <div className="text-right">
                <p className="text-muted-foreground">Total do Orçamento</p>
                <p className="text-2xl font-bold font-headline">{total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
            </div>
            <Button type="submit" size="lg">Salvar Orçamento</Button>
        </div>
      </form>
    </Form>
  );
}
