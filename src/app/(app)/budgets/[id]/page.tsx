import { getBudgetById } from "@/services/budget-service";
import { getCustomers } from "@/services/customer-service";
import { getProducts } from "@/services/product-service";
import { BudgetForm } from "../_components/budget-form";

export default async function EditBudgetPage({ params }: { params: { id: string } }) {
  const budget = await getBudgetById(params.id);
  const customers = await getCustomers();
  const products = await getProducts();

  if (!budget) {
    return <div>Orçamento não encontrado.</div>;
  }

  return (
    <div>
       <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Editar Orçamento</h1>
        <p className="text-muted-foreground">
          Atualize os detalhes do orçamento.
        </p>
      </div>
      <BudgetForm budget={budget} customers={customers} products={products} />
    </div>
  );
}
