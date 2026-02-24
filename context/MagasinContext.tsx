'use client';

/**
 * MagasinContext — Contexte global pour le magasin sélectionné
 * Tous les composants peuvent utiliser useMagasin() pour obtenir
 * le magasin actif et la liste des magasins du marchand.
 */
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/axios';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export interface Magasin {
    id: number;
    libelle: string;
    logo?: string | null;
    adresse?: string | null;
}

interface MagasinContextValue {
    /** Magasin actuellement sélectionné */
    magasin: Magasin | null;
    /** ID du magasin sélectionné (null si aucun) */
    magasinId: number | null;
    /** Liste de tous les magasins du marchand */
    magasins: Magasin[];
    /** Chargement en cours */
    isLoading: boolean;
    /** Changer de magasin */
    selectMagasin: (m: Magasin) => void;
    /** Recharger la liste des magasins */
    refreshMagasins: () => void;
}

const MagasinContext = createContext<MagasinContextValue>({
    magasin: null,
    magasinId: null,
    magasins: [],
    isLoading: false,
    selectMagasin: () => { },
    refreshMagasins: () => { },
});

// ─────────────────────────────────────────────────────────────
// Clé localStorage pour persister la sélection
// ─────────────────────────────────────────────────────────────
const LS_KEY = 'moomen_selected_magasin_id';

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────
export function MagasinProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const u = (session?.user as any);
    const isAdmin = u?.kind === 'admin';
    const isPro = u?.type === 'PROFESSIONNEL' || u?.type === 'ETABLISSEMENT';

    const [magasins, setMagasins] = useState<Magasin[]>([]);
    const [magasin, setMagasin] = useState<Magasin | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchMagasins = useCallback(async () => {
        if (isAdmin || isPro || status !== 'authenticated') return;
        setIsLoading(true);
        try {
            const res = await apiFetch('/magasins/getFromUser');
            const list: Magasin[] = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data?.data)
                    ? res.data.data
                    : [];
            setMagasins(list);

            // Restaurer le dernier magasin sélectionné depuis localStorage
            const savedId = typeof window !== 'undefined'
                ? localStorage.getItem(LS_KEY)
                : null;
            const saved = savedId ? list.find(m => m.id === Number(savedId)) : null;

            // Sélectionner le sauvegardé ou le premier de la liste
            const toSelect = saved ?? list[0] ?? null;
            setMagasin(toSelect);
        } catch (err) {
            console.error('MagasinContext: erreur chargement magasins', err);
        } finally {
            setIsLoading(false);
        }
    }, [isAdmin, isPro, status]);

    useEffect(() => {
        fetchMagasins();
    }, [fetchMagasins]);

    const selectMagasin = useCallback((m: Magasin) => {
        setMagasin(m);
        if (typeof window !== 'undefined') {
            localStorage.setItem(LS_KEY, String(m.id));
        }
    }, []);

    return (
        <MagasinContext.Provider
            value={{
                magasin,
                magasinId: magasin?.id ?? null,
                magasins,
                isLoading,
                selectMagasin,
                refreshMagasins: fetchMagasins,
            }}
        >
            {children}
        </MagasinContext.Provider>
    );
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────
export function useMagasin() {
    return useContext(MagasinContext);
}
