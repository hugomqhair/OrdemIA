'use server';

import admin from 'firebase-admin';
import { cookies } from 'next/headers';
import { firestore } from './firebase'; // Ensures firebase-admin is initialized

export async function getCurrentUser() {
    const sessionCookie = cookies().get('__session')?.value || '';
    
    if (!sessionCookie) {
        return null;
    }

    try {
        const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
        return decodedClaims;
    } catch (error) {
        // Session cookie is invalid or expired.
        return null;
    }
}

export async function getCurrentUserId() {
    const user = await getCurrentUser();
    return user?.uid;
}

export async function createOrUpdateUser(uid: string, data: any) {
    return firestore.collection('users').doc(uid).set(data, { merge: true });
}
