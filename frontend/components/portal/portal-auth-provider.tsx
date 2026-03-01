'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase/config';

interface PortalAuthContextType {
    user: User | null;
    patientId: string | null;
    loading: boolean;
    logout: () => Promise<void>;
}

const PortalAuthContext = createContext<PortalAuthContextType>({
    user: null,
    patientId: null,
    loading: true,
    logout: async () => { },
});

export function usePortalAuth() {
    return useContext(PortalAuthContext);
}

export function PortalAuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [patientId, setPatientId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            if (firebaseUser) {
                // Verifica custom claims
                const tokenResult = await firebaseUser.getIdTokenResult();
                if (tokenResult.claims.role === 'patient' && tokenResult.claims.patientId) {
                    setUser(firebaseUser);
                    setPatientId(tokenResult.claims.patientId as string);
                } else {
                    // Não é paciente, redireciona para login
                    setUser(null);
                    setPatientId(null);
                    if (pathname !== '/portal/login') {
                        router.push('/portal/login');
                    }
                }
            } else {
                setUser(null);
                setPatientId(null);
                if (pathname !== '/portal/login') {
                    router.push('/portal/login');
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [pathname, router]);

    const logout = async () => {
        if (auth) {
            const { signOut } = await import('firebase/auth');
            await signOut(auth);
        }
        router.push('/portal/login');
    };

    return (
        <PortalAuthContext.Provider value={{ user, patientId, loading, logout }}>
            {children}
        </PortalAuthContext.Provider>
    );
}
