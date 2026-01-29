// Template de Atestado Médico - Typst
// Versão: 1.0.0

#let atestado(
  medico_nome: "",
  medico_crm: "",
  medico_especialidade: "",
  clinica_nome: "",
  clinica_endereco: "",
  clinica_telefone: "",
  paciente_nome: "",
  paciente_cpf: "",
  cid: "",
  dias_afastamento: 0,
  data_inicio: "",
  motivo: "",
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
    #text(size: 16pt, weight: "bold")[ATESTADO MÉDICO]
  ]
  
  v(1cm)
  
  // Corpo do atestado
  set par(justify: true, leading: 0.8em)
  
  [Atesto, para os devidos fins, que o(a) paciente *#paciente_nome*]
  if paciente_cpf != "" [, portador(a) do CPF *#paciente_cpf*]
  [, esteve sob meus cuidados profissionais]
  if data_inicio != "" [ a partir de *#data_inicio*]
  [, necessitando de *#dias_afastamento* (#if dias_afastamento == 1 [um] else [#dias_afastamento]) dia(s) de afastamento de suas atividades]
  if motivo != "" [ em razão de #motivo]
  [.]
  
  v(0.5cm)
  
  if cid != "" {
    text(size: 9pt, style: "italic")[CID-10: #cid]
  }
  
  v(1.5cm)
  
  // Rodapé com assinatura
  align(center)[
    #cidade, #data
    #v(2cm)
    #line(length: 60%, stroke: 0.5pt)
    #v(0.2cm)
    #text(weight: "bold")[#medico_nome]
    #linebreak()
    #text(size: 9pt)[CRM: #medico_crm - #medico_especialidade]
  ]
}

// Exemplo de uso (remover em produção)
// #atestado(
//   medico_nome: "Dr. Paulo Guimarães Jr.",
//   medico_crm: "12345-SP",
//   medico_especialidade: "Gastroenterologia",
//   clinica_nome: "Clínica Calyx",
//   clinica_endereco: "Rua Exemplo, 123 - São Paulo/SP",
//   clinica_telefone: "(11) 99999-9999",
//   paciente_nome: "João da Silva",
//   paciente_cpf: "123.456.789-00",
//   cid: "K29",
//   dias_afastamento: 3,
//   data_inicio: "29/01/2026",
//   motivo: "tratamento médico",
//   data: "29 de Janeiro de 2026",
//   cidade: "São Paulo",
// )
