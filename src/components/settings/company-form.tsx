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
import type { CompanyInfo } from "@/lib/types";
import { updateCompanyInfo } from "@/services/settings-service";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "../auth/auth-provider";

const FormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  logoUrl: z.string().optional(),
});

type CompanyFormProps = {
  companyInfo: CompanyInfo | null;
};

export function CompanyForm({ companyInfo }: CompanyFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [preview, setPreview] = useState<string | null>(companyInfo?.logoUrl || null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: companyInfo?.name ?? "",
      logoUrl: companyInfo?.logoUrl ?? "",
    },
  });

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
            variant: "destructive",
            title: "Arquivo muito grande",
            description: "A imagem da logo não pode ser maior que 2MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        form.setValue("logoUrl", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Não autenticado",
            description: "Você precisa estar logado para atualizar as informações.",
        });
        return;
    }
    try {
        await updateCompanyInfo(data);
        toast({
          title: "Informações da empresa atualizadas!",
          description: "Os dados foram salvos com sucesso.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Erro ao salvar informações",
            description: "Ocorreu um erro ao salvar. Tente novamente.",
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
              <FormLabel>Nome da Empresa</FormLabel>
              <FormControl>
                <Input placeholder="Nome da sua empresa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
            <FormLabel>Logomarca</FormLabel>
            <FormControl>
                <Input type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoChange} />
            </FormControl>
            <FormMessage />
        </FormItem>

        {preview && (
            <div className="mt-4">
                <FormLabel>Pré-visualização</FormLabel>
                <div className="relative w-40 h-20 mt-2 border rounded-md p-2">
                    <Image src={preview} alt="Logo preview" layout="fill" objectFit="contain" />
                </div>
            </div>
        )}

        <Button type="submit">Salvar Alterações</Button>
      </form>
    </Form>
  );
}
