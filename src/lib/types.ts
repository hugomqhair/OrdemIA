export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
}

export type Customer = {
  userId: string;
  name: string;
  email: string;
  phone: string;
  document: string; // CPF/CNPJ
  createdAt: string;
};

export type Product = {
  userId: string;
  name: string;
  type: 'Produto' | 'Serviço';
  unit: string;
  value: number;
  photoUrl?: string;
};

export type BudgetStatus = 'Aberto' | 'Aceito' | 'Finalizado' | 'Recusado';

export type BudgetItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitValue: number;
};

export type Budget = {
  userId: string;
  customerId: string;
  customerName: string;
  items: BudgetItem[];
  total: number;
  status: BudgetStatus;
  createdAt: string;
  expiresAt: string;
};

export type WithId<T> = T & { id: string };

export type HydratedBudgetItem = {
  product: WithId<Product>;
  quantity: number;
  unitValue: number;
}

export type HydratedBudget = {
  id: string;
  customer: WithId<Customer>;
  items: HydratedBudgetItem[];
  total: number;
  status: BudgetStatus;
  createdAt: string;
  expiresAt: string;
}

export type CompanyInfo = {
  name: string;
  logoUrl: string;
}
