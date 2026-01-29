// Template de Receita Médica - Typst
// Versão: 1.0.0

#let receita(
  medico_nome: "",
  medico_crm: "",
  medico_especialidade: "",
  clinica_nome: "",
  clinica_endereco: "",
  clinica_telefone: "",
  paciente_nome: "",
  paciente_cpf: "",
  medicamentos: (),
  data: "",
  cidade: "",
) = {
  set page(
    paper: "a5",
    margin: (top: 2cm, bottom: 2cm, left: 1.5cm, right: 1.5cm),
  )
  
  set text(font: "Helvetica", size: 10pt)
  
  // Cabeçalho
  align(center)[
    #text(size: 14pt, weight: "bold")[#clinica_nome]
    #linebreak()
    #text(size: 9pt)[#clinica_endereco]
    #linebreak()
    #text(size: 9pt)[Tel: #clinica_telefone]
  ]
  
  v(0.5cm)
  line(length: 100%, stroke: 0.5pt)
  v(0.5cm)
  
  // Título
  align(center)[
    #text(size: 16pt, weight: "bold")[RECEITUÁRIO]
  ]
  
  v(0.5cm)
  
  // Dados do Paciente
  text(weight: "bold")[Paciente: ] + paciente_nome
  linebreak()
  if paciente_cpf != "" {
    text(weight: "bold")[CPF: ] + paciente_cpf
    linebreak()
  }
  
  v(0.5cm)
  line(length: 100%, stroke: 0.3pt + gray)
  v(0.5cm)
  
  // Medicamentos
  for med in medicamentos {
    text(size: 11pt, weight: "bold")[#med.nome]
    linebreak()
    text(size: 10pt)[#med.posologia]
    v(0.3cm)
    line(length: 100%, stroke: 0.2pt + gray)
    v(0.3cm)
  }
  
  v(1cm)
  
  // Rodapé com assinatura
  align(center)[
    #cidade, #data
    #v(1.5cm)
    #line(length: 60%, stroke: 0.5pt)
    #v(0.2cm)
    #text(weight: "bold")[#medico_nome]
    #linebreak()
    #text(size: 9pt)[CRM: #medico_crm - #medico_especialidade]
  ]
}

// Exemplo de uso (remover em produção)
// #receita(
//   medico_nome: "Dr. Paulo Guimarães Jr.",
//   medico_crm: "12345-SP",
//   medico_especialidade: "Gastroenterologia",
//   clinica_nome: "Clínica Calyx",
//   clinica_endereco: "Rua Exemplo, 123 - São Paulo/SP",
//   clinica_telefone: "(11) 99999-9999",
//   paciente_nome: "João da Silva",
//   paciente_cpf: "123.456.789-00",
//   medicamentos: (
//     (nome: "Omeprazol 20mg", posologia: "Tomar 1 comprimido em jejum por 30 dias"),
//     (nome: "Domperidona 10mg", posologia: "Tomar 1 comprimido 30 min antes das refeições"),
//   ),
//   data: "29 de Janeiro de 2026",
//   cidade: "São Paulo",
// )
