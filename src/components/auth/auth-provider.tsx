
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { 
    onAuthStateChanged, 
    signOut, 
    type User, 
    GoogleAuthProvider, 
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { auth, firestore } from '@/lib/firebase-client';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<any>;
  signUpWithEmail: (email: string, pass: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  logout: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithEmail: async () => {},
    signUpWithEmail: async () => {},
    signInWithGoogle: async () => {},
    logout: async () => {},
});

const publicPaths = ['/login', '/signup'];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (loading) return;

        const isPublicPath = publicPaths.some(p => pathname.startsWith(p));

        if (!user && !isPublicPath) {
            router.push('/login');
        } else if (user && isPublicPath) {
             router.push('/');
        }
    }, [user, loading, pathname, router]);


    const createUserProfileDocument = async (user: User) => {
        const userRef = doc(firestore, 'users', user.uid);
        const snapshot = await getDoc(userRef);

        if (!snapshot.exists()) {
            const { email, displayName, photoURL } = user;
            const createdAt = new Date().toISOString();
            try {
                await setDoc(userRef, {
                    uid: user.uid,
                    email,
                    displayName,
                    photoURL,
                    createdAt,
                });
            } catch (error) {
                console.error("Error creating user profile", error);
            }
        }
    };
    
    const signInWithEmail = async (email: string, pass: string) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        await createUserProfileDocument(userCredential.user);
        return userCredential;
    };
    
    const signUpWithEmail = async (email: string, pass: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        await createUserProfileDocument(userCredential.user);
        return userCredential;
    };
    
    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        await createUserProfileDocument(result.user);
        return result;
    };

    const logout = async () => {
        await signOut(auth);
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
        });
        if(response.ok) {
            router.push('/login');
        }
    };


    const value = {
        user,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        logout,
    };

    const isPublic = publicPaths.some(p => pathname.startsWith(p));
    if (loading || (!user && !isPublic)) {
        return <div className="flex h-screen w-full items-center justify-center">Carregando...</div>;
    }


    return <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
