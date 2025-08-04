import type { WithId, Customer, Product, HydratedBudget } from './types';

export const customers: WithId<Customer>[] = [
  { id: '1', name: 'Constructora Alfa', email: 'contato@alfa.com', phone: '(11) 98765-4321', document: '12.345.678/0001-90', createdAt: '2023-10-15' },
  { id: '2', name: 'João da Silva', email: 'joao.silva@email.com', phone: '(21) 99876-5432', document: '123.456.789-00', createdAt: '2023-10-18' },
  { id: '3', name: 'Maria Souza', email: 'maria.souza@email.com', phone: '(31) 98765-1234', document: '987.654.321-00', createdAt: '2023-10-20' },
  { id: '4', name: 'Escritório Beta', email: 'escritorio@beta.com', phone: '(41) 91234-5678', document: '98.765.432/0001-10', createdAt: '2023-10-22' },
];

export const products: WithId<Product>[] = [
  { id: 'p1', name: 'Desenvolvimento de Website', type: 'Serviço', unit: 'un', value: 5000 },
  { id: 'p2', name: 'Consultoria SEO', type: 'Serviço', unit: 'h', value: 250 },
  { id: 'p3', name: 'Licença de Software', type: 'Produto', unit: 'un', value: 800 },
  { id: 'p4', name: 'Manutenção Mensal', type: 'Serviço', unit: 'mês', value: 600 },
  { id: 'p5', name: 'Design de Logo', type: 'Serviço', unit: 'un', value: 1200 },
];

export const budgets: HydratedBudget[] = [
  { 
    id: 'B001', 
    customer: customers[0],
    items: [
      { product: products[0], quantity: 1, unitValue: 5000 },
      { product: products[3], quantity: 6, unitValue: 600 },
    ],
    total: 8600,
    status: 'Aceito',
    createdAt: '2023-10-25',
    expiresAt: '2023-11-25',
  },
  { 
    id: 'B002', 
    customer: customers[1],
    items: [
      { product: products[1], quantity: 10, unitValue: 250 },
    ],
    total: 2500,
    status: 'Finalizado',
    createdAt: '2023-10-26',
    expiresAt: '2023-11-26',
  },
  { 
    id: 'B003', 
    customer: customers[2],
    items: [
      { product: products[4], quantity: 1, unitValue: 1200 },
    ],
    total: 1200,
    status: 'Aberto',
    createdAt: '2023-10-28',
    expiresAt: '2023-11-28',
  },
  { 
    id: 'B004', 
    customer: customers[3],
    items: [
      { product: products[2], quantity: 5, unitValue: 800 },
    ],
    total: 4000,
    status: 'Recusado',
    createdAt: '2023-10-29',
    expiresAt: '2023-11-29',
  }
];
