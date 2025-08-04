'use server';

import { revalidatePath } from 'next/cache';
import { firestore } from '@/lib/firebase';
import type { Product, WithId } from '@/lib/types';
import { z } from 'zod';
import { getCurrentUserId } from '@/lib/auth';

const ProductSchema = z.object({
  userId: z.string(),
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['Produto', 'Serviço']),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  value: z.coerce.number().min(0.01, 'Valor deve ser positivo'),
  photoUrl: z.string().optional(),
});

type ProductInput = z.infer<typeof ProductSchema>;

export async function getProducts(): Promise<WithId<Product>[]> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  const snapshot = await firestore.collection('products').where('userId', '==', userId).orderBy('name').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithId<Product>));
}

export async function getProductById(id: string): Promise<WithId<Product>> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Not authenticated");

    const doc = await firestore.collection('products').doc(id).get();
    if (!doc.exists) {
        throw new Error(`Product with id ${id} not found`);
    }
    const product = { id: doc.id, ...doc.data() } as WithId<Product>;
    // Note: We don't check userId here because products can be shared across budgets of different users
    // This might need adjustment based on stricter multi-tenancy rules.
    // For now, we allow reading any product.
    return product;
}

export async function createProduct(data: ProductInput) {
  const validation = ProductSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(validation.error.errors.map(e => e.message).join(', '));
  }

  const userId = await getCurrentUserId();
  if (!userId || userId !== data.userId) throw new Error("Permission denied");

  await firestore.collection('products').add({
    ...data,
    createdAt: new Date().toISOString(),
  });
  revalidatePath('/products');
}

export async function updateProduct(id: string, data: ProductInput) {
    const validation = ProductSchema.safeParse(data);
    if (!validation.success) {
        throw new Error(validation.error.errors.map(e => e.message).join(', '));
    }

    const userId = await getCurrentUserId();
    if (!userId || userId !== data.userId) throw new Error("Permission denied");
    
    const docRef = firestore.collection('products').doc(id);
    const doc = await docRef.get();
    if (!doc.exists || doc.data()?.userId !== userId) {
        throw new Error("Permission denied or product not found");
    }

    await docRef.update(data);
    revalidatePath('/products');
}

export async function deleteProduct(id: string) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Not authenticated");

    const docRef = firestore.collection('products').doc(id);
    const doc = await docRef.get();
    if (!doc.exists || doc.data()?.userId !== userId) {
        throw new Error("Permission denied or product not found");
    }

    await docRef.delete();
    revalidatePath('/products');
}
