"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { seedDatabase } from "@/services/seed-service";
import { Rocket } from "lucide-react";
import { useState } from "react";

export function SeedButton() {
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedDatabase();
      toast({
        title: "Banco de dados populado!",
        description: "Os dados de exemplo foram inseridos com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao popular o banco de dados",
        description: "Ocorreu um erro ao inserir os dados. Tente novamente.",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Button onClick={handleSeed} disabled={isSeeding}>
        <Rocket className="mr-2 h-4 w-4" />
        {isSeeding ? "Populando..." : "Popular Banco de Dados"}
    </Button>
  );
}
