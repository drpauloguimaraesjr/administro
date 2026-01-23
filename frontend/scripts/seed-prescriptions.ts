
import { addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { prescriptionFormulasCollection } from '@/lib/firebase/collections';
import formulasData from '@/data/prescriptions_library.json';

// Utility function to categorize formulas based on their name
function categorizeFormula(name: string): string {
    const n = name.toUpperCase();
    if (n.includes('VITAMINA')) return 'Vitaminas';
    if (n.includes('TESTOSTERONA') || n.includes('HORMÔNIO') || n.includes('HORMONIO') || n.includes('ESTRADIOL') || n.includes('NANDROLONA')) return 'Hormônios';
    if (n.includes('ÁCIDO') || n.includes('ACIDO')) return 'Ácidos';
    if (n.includes('AMINOÁCIDO') || n.includes('LEUCINA') || n.includes('ISOLEUCINA') || n.includes('VALINA') || n.includes('ARGININA') || n.includes('GLUTAMINA')) return 'Aminoácidos';
    if (n.includes('MINERAL') || n.includes('MAGNÉSIO') || n.includes('ZINCO') || n.includes('SELENIO') || n.includes('CROMO')) return 'Minerais';
    return 'Injetáveis';
}

// Utility function to extract tags from description
function extractTags(description: string): string[] {
    if (!description) return [];
    const keywords = ['antioxidante', 'imunidade', 'energia', 'metabolismo', 'hormonal', 'gordura', 'muscular', 'cognitivo', 'ansiedade', 'sono', 'pele', 'cabelo', 'unhas'];
    const descLower = description.toLowerCase();
    return keywords.filter(keyword => descLower.includes(keyword));
}

// Function to seed the database
export async function seedPrescriptions() {
    console.log('🌱 Iniciando seed de prescrições...');

    try {
        // Optional: Clear existing data first strictly for dev/demo purposes if needed. 
        // Be careful with this in production!
        // const snapshot = await getDocs(prescriptionFormulasCollection);
        // const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        // await Promise.all(deletePromises);
        // console.log('🧹 Coleção limpa.');

        let count = 0;
        for (const formula of formulasData) {
            // Check if it already exists to avoid duplicates if running multiple times without clearing
            // Ideally we would query by name, but for a simple seed script we might skip or just add.
            // For now, we'll just add. 

            await addDoc(prescriptionFormulasCollection, {
                ...formula,
                category: categorizeFormula(formula.name),
                tags: extractTags(formula.description),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'system',
                clinicId: 'default'
            });
            count++;
        }
        console.log(`✅ ${count} fórmulas inseridas com sucesso!`);
        return { success: true, count };
    } catch (error) {
        console.error('❌ Erro durante o seed:', error);
        return { success: false, error };
    }
}
