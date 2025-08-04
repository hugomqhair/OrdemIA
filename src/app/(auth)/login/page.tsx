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
import { BookMarked, LogIn } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase-client";

const FormSchema = z.object({
    email: z.string().email("Por favor, insira um email válido."),
    password: z.string().min(1, "Senha é obrigatória."),
});

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleGoogleSignIn = async () => {
    try {
        await signInWithGoogle();
        router.push("/");
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Erro no login",
            description: "Não foi possível fazer login com o Google. Tente novamente.",
        });
    }
  }

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
        console.log('Login')
        await signInWithEmail(data.email, data.password);
        const idToken = await auth.currentUser?.getIdToken();
        idToken
        console.log('idToken', idToken)
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }),
        });

        console.log('response', response)

        if (response.ok) {
            router.push("/");
        } else {
             throw new Error("Falha ao criar sessão");
        }

    } catch (error) {
        toast({
            variant: "destructive",
            title: "Erro no login",
            description: "Email ou senha inválidos. Verifique e tente novamente.",
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
          <CardTitle className="font-headline text-2xl">BudgetBuddy</CardTitle>
          <CardDescription>
            Faça login para acessar seus orçamentos.
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
                            <Input type="password" placeholder="Sua senha" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full">
                    <LogIn className="mr-2 h-4 w-4" /> Entrar
                </Button>
            </form>
          </Form>
           <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                Ou continue com
                </span>
            </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.5 173.5 56.6l-67.2 64.4C318.3 99.9 284.4 86 248 86c-82.3 0-150.3 66.6-150.3 148.4s68 148.4 150.3 148.4c87.7 0 129.2-61.2 135-95.2h-135v-73.6h256.3c1.6 9.2 2.6 19.2 2.6 29.8z"></path></svg>
                Google
            </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Button variant="link" size="sm" asChild className="p-0">
                <Link href="/signup">Crie uma agora</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
