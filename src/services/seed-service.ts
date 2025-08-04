"use server";

import { firestore } from "@/lib/firebase";
import { customers, products, budgets as mockBudgets } from "@/lib/data";
import type { Budget, Customer, Product, WithId } from "@/lib/types";
import { revalidatePath } from "next/cache";

async function seedCollection<T extends { id: string }>(collectionName: string, data: WithId<T>[]) {
    const collectionRef = firestore.collection(collectionName);
    const snapshot = await collectionRef.limit(1).get();

    if (!snapshot.empty) {
        console.log(`Collection ${collectionName} is not empty. Skipping seed.`);
        return;
    }

    const batch = firestore.batch();
    data.forEach(item => {
        const { id, ...rest } = item;
        const docRef = collectionRef.doc(id);
        batch.set(docRef, rest);
    });

    await batch.commit();
    console.log(`Seeded ${data.length} documents into ${collectionName}`);
}

export async function seedDatabase() {
    await seedCollection<Customer>('customers', customers);
    await seedCollection<Product>('products', products);

    // For budgets, we need to convert HydratedBudget to Budget
    const budgetsToSeed: WithId<Budget>[] = mockBudgets.map(b => ({
        id: b.id,
        customerId: b.customer.id,
        customerName: b.customer.name,
        items: b.items.map(i => ({
            productId: i.product.id,
            productName: i.product.name,
            quantity: i.quantity,
            unitValue: i.unitValue,
        })),
        total: b.total,
        status: b.status,
        createdAt: b.createdAt,
        expiresAt: b.expiresAt,
    }));

    await seedCollection<Budget>('budgets', budgetsToSeed);
    
    // Revalidate all paths that might show the new data
    revalidatePath('/');
    revalidatePath('/budgets');
    revalidatePath('/customers');
    revalidatePath('/products');
}
