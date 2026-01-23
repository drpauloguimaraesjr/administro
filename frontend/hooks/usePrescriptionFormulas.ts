import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { prescriptionFormulasCollection } from '@/lib/firebase/collections';
import { PrescriptionFormula } from '@/types/prescription';

export function usePrescriptionFormulas(searchTerm: string = '') {
    const [formulas, setFormulas] = useState<PrescriptionFormula[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFormulas() {
            setLoading(true);

            try {
                const q = query(
                    prescriptionFormulasCollection,
                    orderBy('name', 'asc')
                );

                const snapshot = await getDocs(q);
                let data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as PrescriptionFormula[];

                // Local filtering
                if (searchTerm) {
                    const term = searchTerm.toLowerCase();
                    data = data.filter(f =>
                        f.name.toLowerCase().includes(term) ||
                        f.usage.toLowerCase().includes(term) ||
                        f.description.toLowerCase().includes(term)
                    );
                }

                setFormulas(data);
            } catch (error) {
                console.error('Erro ao buscar fórmulas:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchFormulas();
    }, [searchTerm]); // Re-run when searchTerm changes. In prod with huge datasets, we might want debouncing or server-side filtering.

    return { formulas, loading };
}
