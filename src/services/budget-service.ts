'use server';

import { revalidatePath } from 'next/cache';
import { firestore } from '@/lib/firebase';
import type { Budget, WithId, HydratedBudget } from '@/lib/types';
import { z } from 'zod';
import { getCustomerById } from './customer-service';
import { getProductById } from './product-service';
import { getCurrentUserId } from '@/lib/auth';

const BudgetItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantity: z.coerce.number().min(1, 'Quantidade deve ser maior que zero'),
  unitValue: z.coerce.number().min(0.01, 'Valor unitário deve ser positivo'),
});

const BudgetSchema = z.object({
  userId: z.string(),
  customerId: z.string().min(1, 'Cliente é obrigatório'),
  customerName: z.string(),
  items: z.array(BudgetItemSchema).min(1, 'Orçamento deve ter pelo menos um item'),
  total: z.coerce.number(),
  status: z.enum(['Aberto', 'Aceito', 'Finalizado', 'Recusado']),
  expiresAt: z.string().min(1, 'Data de validade é obrigatória'),
});

export type BudgetInput = z.infer<typeof BudgetSchema>;

async function hydrateBudget(budget: WithId<Budget>): Promise<HydratedBudget> {
    const customer = await getCustomerById(budget.customerId);
    const items = await Promise.all(
        budget.items.map(async (item) => {
            const product = await getProductById(item.productId);
            return {
                product,
                quantity: item.quantity,
                unitValue: item.unitValue,
            };
        })
    );

    return {
        ...budget,
        customer,
        items,
    };
}


export async function getBudgets(): Promise<HydratedBudget[]> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");
  
  const snapshot = await firestore.collection('budgets').where('userId', '==', userId).orderBy('createdAt', 'desc').get();
  const budgets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithId<Budget>));
  return Promise.all(budgets.map(hydrateBudget));
}

export async function getBudgetById(id: string): Promise<HydratedBudget | null> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Not authenticated");

    const doc = await firestore.collection('budgets').doc(id).get();
    if (!doc.exists) {
        return null;
    }
    const budget = { id: doc.id, ...doc.data() } as WithId<Budget>;
    if (budget.userId !== userId) {
        throw new Error("Permission denied");
    }

    return hydrateBudget(budget);
}


export async function createBudget(data: BudgetInput) {
  const validation = BudgetSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(validation.error.errors.map(e => e.message).join(', '));
  }
  
  const userId = await getCurrentUserId();
  if (!userId || userId !== data.userId) throw new Error("Permission denied");

  const newBudget = {
    ...data,
    createdAt: new Date().toISOString(),
  }

  await firestore.collection('budgets').add(newBudget);

  revalidatePath('/budgets');
  revalidatePath('/');
}

export async function updateBudget(id: string, data: BudgetInput) {
    const validation = BudgetSchema.safeParse(data);
    if (!validation.success) {
        throw new Error(validation.error.errors.map(e => e.message).join(', '));
    }

    const userId = await getCurrentUserId();
    if (!userId || userId !== data.userId) throw new Error("Permission denied");

    // Verify ownership before update
    const docRef = firestore.collection('budgets').doc(id);
    const doc = await docRef.get();
    if (!doc.exists || doc.data()?.userId !== userId) {
        throw new Error("Permission denied or budget not found");
    }

    await docRef.update(data);
    revalidatePath('/budgets');
    revalidatePath(`/budgets/${id}`);
    revalidatePath('/');
}

export async function deleteBudget(id: string) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Not authenticated");

    const docRef = firestore.collection('budgets').doc(id);
    const doc = await docRef.get();
    if (!doc.exists || doc.data()?.userId !== userId) {
        throw new Error("Permission denied or budget not found");
    }

    await docRef.delete();
    revalidatePath('/budgets');
    revalidatePath('/');
}
