"use client";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast";
import { BookMarked, UserPlus } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";

const FormSchema = z.object({
    email: z.string().email("Por favor, insira um email válido."),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
});

export default function SignupPage() {
  const { signUpWithEmail } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: ""
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
        await signUpWithEmail(data.email, data.password);
        router.push("/");
    } catch (error: any) {
        let description = "Ocorreu um erro ao criar a conta. Tente novamente.";
        if (error.code === 'auth/email-already-in-use') {
            description = "Este email já está em uso. Tente fazer login."
        }
        toast({
            variant: "destructive",
            title: "Erro no cadastro",
            description,
        });
    }
  }


  return (
    <div className="w-full max-w-md">
       <Card>
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <BookMarked className="h-10 w-10 text-primary" />
            </div>
          <CardTitle className="font-headline text-2xl">Criar Conta</CardTitle>
          <CardDescription>
            Crie sua conta para começar a gerenciar seus orçamentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input placeholder="seu@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="Crie uma senha" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Confirmar Senha</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="Confirme sua senha" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full">
                    <UserPlus className="mr-2 h-4 w-4" /> Criar Conta
                </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Button variant="link" size="sm" asChild className="p-0">
                <Link href="/login">Faça login</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
