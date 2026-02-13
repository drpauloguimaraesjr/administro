import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
const execAsync = promisify(exec);
// Path to local Typst binary
const TYPST_PATH = path.join(process.cwd(), 'bin', 'typst');
const TEMPLATES_PATH = path.join(process.cwd(), 'src', 'templates');
const OUTPUT_PATH = path.join(process.cwd(), 'generated');
// Ensure output directory exists
async function ensureOutputDir() {
    try {
        await fs.mkdir(OUTPUT_PATH, { recursive: true });
    }
    catch (error) {
        // Directory exists
    }
}
/**
 * Generate a Typst document content based on template type and data
 */
function generateTypstContent(type, data) {
    const templatePath = path.join(TEMPLATES_PATH, `${type}.typ`);
    if (type === 'receita') {
        const d = data;
        const medsArray = d.medicamentos.map(m => `(nome: "${m.nome}", posologia: "${m.posologia}")`).join(',\n    ');
        return `
#import "${templatePath}": receita

#receita(
    medico_nome: "${d.medico_nome}",
    medico_crm: "${d.medico_crm}",
    medico_especialidade: "${d.medico_especialidade}",
    clinica_nome: "${d.clinica_nome}",
    clinica_endereco: "${d.clinica_endereco}",
    clinica_telefone: "${d.clinica_telefone}",
    paciente_nome: "${d.paciente_nome}",
    paciente_cpf: "${d.paciente_cpf || ''}",
    medicamentos: (
    ${medsArray}
    ),
    data: "${d.data}",
    cidade: "${d.cidade}",
)`;
    }
    if (type === 'atestado') {
        const d = data;
        return `
#import "${templatePath}": atestado

#atestado(
    medico_nome: "${d.medico_nome}",
    medico_crm: "${d.medico_crm}",
    medico_especialidade: "${d.medico_especialidade}",
    clinica_nome: "${d.clinica_nome}",
    clinica_endereco: "${d.clinica_endereco}",
    clinica_telefone: "${d.clinica_telefone}",
    paciente_nome: "${d.paciente_nome}",
    paciente_cpf: "${d.paciente_cpf || ''}",
    cid: "${d.cid || ''}",
    dias_afastamento: ${d.dias_afastamento},
    data_inicio: "${d.data_inicio || ''}",
    motivo: "${d.motivo || ''}",
    data: "${d.data}",
    cidade: "${d.cidade}",
)`;
    }
    if (type === 'evolucao') {
        const d = data;
        return `
#import "${templatePath}": evolucao

#evolucao(
    medico_nome: "${d.medico_nome}",
    medico_crm: "${d.medico_crm}",
    medico_especialidade: "${d.medico_especialidade}",
    clinica_nome: "${d.clinica_nome}",
    clinica_endereco: "${d.clinica_endereco}",
    clinica_telefone: "${d.clinica_telefone}",
    paciente_nome: "${d.paciente_nome}",
    paciente_cpf: "${d.paciente_cpf}",
    paciente_nascimento: "${d.paciente_nascimento || ''}",
    paciente_idade: "${d.paciente_idade || ''}",
    data_atendimento: "${d.data_atendimento}",
    hora_atendimento: "${d.hora_atendimento}",
    tipo_atendimento: "${d.tipo_atendimento || 'Consulta'}",
    queixa_principal: "${d.queixa_principal || ''}",
    historia_doenca_atual: "${d.historia_doenca_atual || ''}",
    antecedentes: "${d.antecedentes || ''}",
    exame_fisico: "${d.exame_fisico || ''}",
    hipotese_diagnostica: "${d.hipotese_diagnostica || ''}",
    conduta: "${d.conduta || ''}",
    retorno: "${d.retorno || ''}",
    observacoes: "${d.observacoes || ''}",
)`;
    }
    throw new Error(`Unknown document type: ${type}`);
}
/**
 * Compile Typst content to PDF
 */
export async function compileToPdf(type, data) {
    await ensureOutputDir();
    const documentId = uuidv4();
    const typstContent = generateTypstContent(type, data);
    // Write temporary .typ file
    const tempTypFile = path.join(OUTPUT_PATH, `${documentId}.typ`);
    const outputPdfFile = path.join(OUTPUT_PATH, `${documentId}.pdf`);
    await fs.writeFile(tempTypFile, typstContent, 'utf-8');
    try {
        // Compile with Typst
        await execAsync(`${TYPST_PATH} compile "${tempTypFile}" "${outputPdfFile}"`);
        // Read the PDF
        const pdfBuffer = await fs.readFile(outputPdfFile);
        // Clean up temp .typ file (keep PDF for now)
        await fs.unlink(tempTypFile);
        return {
            pdfPath: outputPdfFile,
            pdfBuffer,
            documentId
        };
    }
    catch (error) {
        // Clean up on error
        try {
            await fs.unlink(tempTypFile);
        }
        catch { }
        console.error('Typst compilation error:', error.stderr || error.message);
        throw new Error(`Failed to compile document: ${error.stderr || error.message}`);
    }
}
/**
 * Delete a generated PDF
 */
export async function deletePdf(documentId) {
    const pdfPath = path.join(OUTPUT_PATH, `${documentId}.pdf`);
    try {
        await fs.unlink(pdfPath);
    }
    catch (error) {
        // File might not exist
    }
}
//# sourceMappingURL=typstService.js.map