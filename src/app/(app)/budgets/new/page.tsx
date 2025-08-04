import { getCustomers } from "@/services/customer-service";
import { getProducts } from "@/services/product-service";
import { BudgetForm } from "../_components/budget-form";

export default async function NewBudgetPage() {
  const customers = await getCustomers();
  const products = await getProducts();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Novo Orçamento</h1>
        <p className="text-muted-foreground">
          Preencha os dados para criar um novo orçamento.
        </p>
      </div>
      <BudgetForm customers={customers} products={products} />
    </div>
  );
}
