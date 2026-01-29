// Template de Evolução/Prontuário - Typst
// Versão: 1.0.0

#let evolucao(
  medico_nome: "",
  medico_crm: "",
  medico_especialidade: "",
  clinica_nome: "",
  clinica_endereco: "",
  clinica_telefone: "",
  paciente_nome: "",
  paciente_cpf: "",
  paciente_nascimento: "",
  paciente_idade: "",
  data_atendimento: "",
  hora_atendimento: "",
  tipo_atendimento: "Consulta",
  queixa_principal: "",
  historia_doenca_atual: "",
  antecedentes: "",
  exame_fisico: "",
  hipotese_diagnostica: "",
  conduta: "",
  retorno: "",
  observacoes: "",
) = {
  set page(
    paper: "a4",
    margin: (top: 2cm, bottom: 2cm, left: 2cm, right: 2cm),
  )
  
  set text(font: "Helvetica", size: 10pt)
  
  // Cabeçalho
  grid(
    columns: (1fr, 2fr, 1fr),
    align: (left, center, right),
    [],
    [
      #text(size: 14pt, weight: "bold")[#clinica_nome]
      #linebreak()
      #text(size: 9pt)[#clinica_endereco]
      #linebreak()
      #text(size: 9pt)[Tel: #clinica_telefone]
    ],
    [
      #text(size: 8pt, fill: gray)[
        #data_atendimento
        #linebreak()
        #hora_atendimento
      ]
    ]
  )
  
  v(0.3cm)
  line(length: 100%, stroke: 1pt + rgb("#6b21a8"))
  v(0.3cm)
  
  // Dados do Paciente
  block(
    fill: rgb("#f8f4fc"),
    inset: 10pt,
    radius: 4pt,
    width: 100%,
  )[
    #grid(
      columns: (1fr, 1fr),
      gutter: 10pt,
      [
        #text(weight: "bold", size: 9pt, fill: rgb("#6b21a8"))[PACIENTE]
        #linebreak()
        #text(size: 11pt, weight: "bold")[#paciente_nome]
      ],
      [
        #text(weight: "bold", size: 9pt, fill: rgb("#6b21a8"))[TIPO]
        #linebreak()
        #text(size: 11pt)[#tipo_atendimento]
      ]
    )
    #v(0.2cm)
    #grid(
      columns: (1fr, 1fr, 1fr),
      gutter: 10pt,
      [
        #text(size: 8pt, fill: gray)[CPF: #paciente_cpf]
      ],
      [
        #text(size: 8pt, fill: gray)[Nasc: #paciente_nascimento]
      ],
      [
        #text(size: 8pt, fill: gray)[Idade: #paciente_idade]
      ]
    )
  ]
  
  v(0.5cm)
  
  // Função helper para seções
  let secao(titulo, conteudo) = {
    if conteudo != "" {
      block(
        width: 100%,
        inset: (left: 0pt, right: 0pt, top: 5pt, bottom: 10pt),
      )[
        #text(weight: "bold", size: 9pt, fill: rgb("#6b21a8"))[#titulo]
        #v(0.2cm)
        #text(size: 10pt)[#conteudo]
      ]
      line(length: 100%, stroke: 0.3pt + rgb("#e2e8f0"))
    }
  }
  
  // Seções do prontuário
  secao("QUEIXA PRINCIPAL", queixa_principal)
  secao("HISTÓRIA DA DOENÇA ATUAL", historia_doenca_atual)
  secao("ANTECEDENTES", antecedentes)
  secao("EXAME FÍSICO", exame_fisico)
  secao("HIPÓTESE DIAGNÓSTICA", hipotese_diagnostica)
  secao("CONDUTA", conduta)
  
  if retorno != "" {
    secao("RETORNO", retorno)
  }
  
  if observacoes != "" {
    secao("OBSERVAÇÕES", observacoes)
  }
  
  v(1cm)
  
  // Rodapé com assinatura
  align(center)[
    #v(1cm)
    #line(length: 50%, stroke: 0.5pt)
    #v(0.2cm)
    #text(weight: "bold")[#medico_nome]
    #linebreak()
    #text(size: 9pt)[CRM: #medico_crm - #medico_especialidade]
  ]
  
  // Registro de segurança LGPD
  v(0.5cm)
  align(center)[
    #block(
      fill: rgb("#f1f5f9"),
      inset: 8pt,
      radius: 4pt,
    )[
      #text(size: 7pt, fill: gray)[
        Documento gerado eletronicamente em #data_atendimento às #hora_atendimento.
        Protegido pela Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
        Este documento é confidencial e destinado exclusivamente ao paciente identificado.
      ]
    ]
  ]
}

// Exemplo de uso (remover em produção)
// #evolucao(
//   medico_nome: "Dr. Paulo Guimarães Jr.",
//   medico_crm: "12345-SP",
//   medico_especialidade: "Gastroenterologia",
//   clinica_nome: "Clínica Calyx",
//   clinica_endereco: "Rua Exemplo, 123 - São Paulo/SP",
//   clinica_telefone: "(11) 99999-9999",
//   paciente_nome: "João da Silva",
//   paciente_cpf: "123.456.789-00",
//   paciente_nascimento: "15/03/1985",
//   paciente_idade: "40 anos",
//   data_atendimento: "29/01/2026",
//   hora_atendimento: "14:30",
//   tipo_atendimento: "Consulta de Retorno",
//   queixa_principal: "Dor epigástrica há 2 semanas",
//   historia_doenca_atual: "Paciente refere dor em queimação na região epigástrica...",
//   antecedentes: "HAS controlada, DM2",
//   exame_fisico: "BEG, corado, hidratado. Abdome: RHA+, flácido, doloroso à palpação...",
//   hipotese_diagnostica: "Dispepsia funcional / Gastrite",
//   conduta: "1. Omeprazol 20mg 1x/dia em jejum\n2. Dieta leve\n3. Retorno em 30 dias",
//   retorno: "30 dias com EDA",
// )
