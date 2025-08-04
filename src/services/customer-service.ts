'use server';

import { revalidatePath } from 'next/cache';
import { firestore } from '@/lib/firebase';
import type { Customer, WithId } from '@/lib/types';
import { z } from 'zod';
import { getCurrentUserId } from '@/lib/auth';

const CustomerSchema = z.object({
  userId: z.string(),
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  document: z.string().min(1, 'CPF/CNPJ é obrigatório'),
});

type CustomerInput = z.infer<typeof CustomerSchema>;

export async function getCustomers(): Promise<WithId<Customer>[]> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  const snapshot = await firestore.collection('customers').where('userId', '==', userId).orderBy('name').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithId<Customer>));
}

export async function getCustomerById(id: string): Promise<WithId<Customer>> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Not authenticated");

    const doc = await firestore.collection('customers').doc(id).get();
    if (!doc.exists) {
        throw new Error(`Customer with id ${id} not found`);
    }
    const customer = { id: doc.id, ...doc.data() } as WithId<Customer>;
    if (customer.userId !== userId) {
        throw new Error("Permission denied");
    }
    return customer;
}

export async function createCustomer(data: CustomerInput) {
  const validation = CustomerSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(validation.error.errors.map(e => e.message).join(', '));
  }

  const userId = await getCurrentUserId();
  if (!userId || userId !== data.userId) throw new Error("Permission denied");

  const newCustomer = {
      ...data,
      createdAt: new Date().toISOString(),
  }

  await firestore.collection('customers').add(newCustomer);
  revalidatePath('/customers');
}

export async function updateCustomer(id: string, data: CustomerInput) {
    const validation = CustomerSchema.safeParse(data);
    if (!validation.success) {
        throw new Error(validation.error.errors.map(e => e.message).join(', '));
    }

    const userId = await getCurrentUserId();
    if (!userId || userId !== data.userId) throw new Error("Permission denied");
    
    const docRef = firestore.collection('customers').doc(id);
    const doc = await docRef.get();
    if (!doc.exists || doc.data()?.userId !== userId) {
        throw new Error("Permission denied or customer not found");
    }

    await docRef.update(data);
    revalidatePath('/customers');
}

export async function deleteCustomer(id: string) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Not authenticated");

    const docRef = firestore.collection('customers').doc(id);
    const doc = await docRef.get();
    if (!doc.exists || doc.data()?.userId !== userId) {
        throw new Error("Permission denied or customer not found");
    }

    await docRef.delete();
    revalidatePath('/customers');
}
