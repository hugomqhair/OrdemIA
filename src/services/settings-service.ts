'use server';

import { revalidatePath } from 'next/cache';
import { firestore } from '@/lib/firebase';
import type { CompanyInfo } from '@/lib/types';
import { z } from 'zod';
import { getCurrentUserId } from '@/lib/auth';

const CompanyInfoSchema = z.object({
  name: z.string().optional(),
  logoUrl: z.string().optional(),
});

type CompanyInfoInput = z.infer<typeof CompanyInfoSchema>;

const COLLECTION_NAME = 'companyInfo';

export async function getCompanyInfo(): Promise<CompanyInfo | null> {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    try {
        const doc = await firestore.collection(COLLECTION_NAME).doc(userId).get();
        if (!doc.exists) {
            return null;
        }
        return doc.data() as CompanyInfo;
    } catch (error) {
        console.error("Error fetching company info:", error);
        return null;
    }
}

export async function updateCompanyInfo(data: CompanyInfoInput) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");
  
  const validation = CompanyInfoSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(validation.error.errors.map(e => e.message).join(', '));
  }

  await firestore.collection(COLLECTION_NAME).doc(userId).set(data, { merge: true });

  revalidatePath('/settings');
  revalidatePath('/');
}
