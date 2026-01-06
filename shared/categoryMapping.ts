/**
 * Category Mapping Configuration
 * Maps current simplified Category1 enum to proposed hierarchical structure
 *
 * Use this during Phase 1 migration (before enum restructuring)
 * Remove this file after Phase 2 migration is complete
 */

export type Category1Current =
  | "Receitas" | "Moradia" | "Mercado" | "Compras Online"
  | "Transporte" | "Saúde" | "Lazer" | "Viagem" | "Roupas"
  | "Tecnologia" | "Alimentação" | "Energia" | "Internet"
  | "Educação" | "Presentes" | "Streaming" | "Academia"
  | "Investimentos" | "Outros" | "Interno";

export type Category1Proposed =
  | "Moradia"
  | "Alimentação"
  | "Compras & Estilo de Vida"
  | "Mobilidade"
  | "Saúde & Seguros"
  | "Educação & Crianças"
  | "Lazer & Viagens"
  | "Interna"
  | "Finanças & Transferências"
  | "Trabalho & Receitas"
  | "Doações & Outros"
  | "Revisão & Não Classificado"
  | "Outros";

export interface CategoryLevel2 {
  name: string;
  keywords: string[];
}

export interface CategoryLevel3 {
  name: string;
  keywords: string[];
  level2Parent: string;
}

export interface CategoryMapping {
  current: Category1Current;
  proposed: Category1Proposed;
  level2Options: string[];
  level3Examples: string[];
}

/**
 * Maps current Category1 enum values to proposed structure
 */
export const categoryMappings: CategoryMapping[] = [
  // Moradia (Housing)
  {
    current: "Moradia",
    proposed: "Moradia",
    level2Options: ["Casa Olching", "Casa Karlsruhe", "Casa Esting"],
    level3Examples: [
      "Casa Olching – Aluguel (Pago)",
      "Casa Olching – Energia (Strom)",
      "Casa Karlsruhe – Aluguel (Recebido)"
    ]
  },
  {
    current: "Energia",
    proposed: "Moradia",
    level2Options: ["Casa Olching", "Casa Karlsruhe", "Casa Esting"],
    level3Examples: ["Casa Olching – Energia (Strom)", "Casa Karlsruhe – Energia/Água"]
  },
  {
    current: "Internet",
    proposed: "Moradia",
    level2Options: ["Casa Olching", "Casa Karlsruhe", "Casa Esting"],
    level3Examples: ["Casa Olching – Internet/TV/Telefone", "Casa Karlsruhe – Internet/TV"]
  },

  // Alimentação (Food)
  {
    current: "Alimentação",
    proposed: "Alimentação",
    level2Options: [
      "Supermercado e Mercearia",
      "Padaria e Café",
      "Restaurantes e Alimentação fora",
      "Bebidas e Especialidades",
      "Refeição no trabalho"
    ],
    level3Examples: [
      "Supermercado – REWE/Lidl/Edeka/Netto/Aldi",
      "Padaria/Café – Ihle/Wünsche",
      "Restaurante – Geral",
      "Fast-food – McDonald's"
    ]
  },
  {
    current: "Mercado",
    proposed: "Alimentação",
    level2Options: ["Supermercado e Mercearia"],
    level3Examples: ["Supermercado – REWE/Lidl/Edeka/Netto/Aldi"]
  },

  // Compras & Estilo de Vida (Shopping & Lifestyle)
  {
    current: "Compras Online",
    proposed: "Compras & Estilo de Vida",
    level2Options: ["Compras online & marketplace"],
    level3Examples: ["Marketplace – Amazon", "Marketplace – Temu", "Loja online – Zalando"]
  },
  {
    current: "Roupas",
    proposed: "Compras & Estilo de Vida",
    level2Options: ["Vestuário & calçados"],
    level3Examples: ["Roupas – Geral (H&M/About You)", "Esportes/roupa esportiva – Decathlon"]
  },
  {
    current: "Tecnologia",
    proposed: "Compras & Estilo de Vida",
    level2Options: ["Compras online & marketplace", "Assinaturas digitais & software"],
    level3Examples: ["Marketplace – Amazon", "Assinatura – Apple (iCloud/App Store)"]
  },
  {
    current: "Streaming",
    proposed: "Compras & Estilo de Vida",
    level2Options: ["Assinaturas digitais & software"],
    level3Examples: [
      "Assinatura – Netflix",
      "Assinatura – Disney+",
      "Assinatura – YouTube Premium"
    ]
  },
  {
    current: "Academia",
    proposed: "Compras & Estilo de Vida",
    level2Options: ["Esportes & Fitness"],
    level3Examples: ["Academia – Hommer Fitness (Olching)", "Artes marciais – BJJ/treinos"]
  },
  {
    current: "Presentes",
    proposed: "Compras & Estilo de Vida",
    level2Options: ["Presentes & Festas"],
    level3Examples: ["Presentes – Geral"]
  },

  // Mobilidade (Mobility)
  {
    current: "Transporte",
    proposed: "Mobilidade",
    level2Options: ["Carro", "Transporte público"],
    level3Examples: [
      "Carro – Combustível/Posto",
      "Carro – Seguro",
      "Transporte – MVV/Ônibus/Trem"
    ]
  },

  // Saúde & Seguros (Health & Insurance)
  {
    current: "Saúde",
    proposed: "Saúde & Seguros",
    level2Options: ["Saúde", "Seguros"],
    level3Examples: [
      "Médico/Clínica – PVS/consultas",
      "Dentista/Ortodontia",
      "Farmácia",
      "Seguro saúde – AOK"
    ]
  },

  // Educação & Crianças (Education & Children)
  {
    current: "Educação",
    proposed: "Educação & Crianças",
    level2Options: ["Escola & taxas", "Benefícios família", "Atividades"],
    level3Examples: [
      "Escola – Gymnasium Olching",
      "Benefício – Kindergeld",
      "Atividades – Cursos/clubes"
    ]
  },

  // Lazer & Viagens (Leisure & Travel)
  {
    current: "Lazer",
    proposed: "Lazer & Viagens",
    level2Options: ["Entretenimento & eventos"],
    level3Examples: ["Eventos – Ingressos/Tickets", "Lazer – Compras/serviços não essenciais"]
  },
  {
    current: "Viagem",
    proposed: "Lazer & Viagens",
    level2Options: ["Viagens"],
    level3Examples: ["Viagens – Hotéis", "Viagens – Aluguel de carro"]
  },

  // Interna (Internal Transfers)
  {
    current: "Interno",
    proposed: "Interna",
    level2Options: ["Pagamento de cartões"],
    level3Examples: [
      "Pagamento – Amex (Liquidação/Fatura)",
      "Pagamento – Miles & More / DKB (Liquidação)"
    ]
  },

  // Finanças & Transferências (Finance & Transfers)
  {
    current: "Investimentos",
    proposed: "Finanças & Transferências",
    level2Options: ["Dívidas & crédito", "Taxas & juros"],
    level3Examples: [
      "Crédito pessoal – ING DiBa",
      "Taxas bancárias – Sparkasse",
      "Juros/câmbio – Taxa internacional"
    ]
  },

  // Trabalho & Receitas (Work & Income)
  {
    current: "Receitas",
    proposed: "Trabalho & Receitas",
    level2Options: ["Salário", "Receita profissional", "Vendas online", "Aluguel e rendas"],
    level3Examples: [
      "Salário – Vinicius (Bosch)",
      "Salário – Erica (Transferência)",
      "Renda – Aluguel (Karlsruhe)"
    ]
  },

  // Outros (Others)
  {
    current: "Outros",
    proposed: "Outros",
    level2Options: ["Diversos"],
    level3Examples: ["Outros – Não classificado"]
  }
];

/**
 * Get proposed category for current enum value
 */
export function getProposedCategory(current: Category1Current): Category1Proposed {
  const mapping = categoryMappings.find(m => m.current === current);
  return mapping?.proposed || "Outros";
}

/**
 * Get Level 2 options for a current category
 */
export function getLevel2Options(current: Category1Current): string[] {
  const mapping = categoryMappings.find(m => m.current === current);
  return mapping?.level2Options || [];
}

/**
 * Get Level 3 examples for a current category
 */
export function getLevel3Examples(current: Category1Current): string[] {
  const mapping = categoryMappings.find(m => m.current === current);
  return mapping?.level3Examples || [];
}

/**
 * Full category hierarchy (for UI dropdowns)
 */
export const categoryHierarchy = {
  "Moradia": {
    "Casa Olching": [
      "Casa Olching – Aluguel (Pago)",
      "Casa Olching – Energia (Strom)",
      "Casa Olching – Internet/TV/Telefone (Casa)",
      "Casa Olching – Nebenkosten/Condomínio",
      "Casa Olching – Manutenção e Reparos",
      "Casa Olching – Materiais e Compras para Casa",
      "Casa Olching – Impostos e Taxas (Imóvel)"
    ],
    "Casa Karlsruhe": [
      "Casa Karlsruhe – Aluguel (Recebido)",
      "Casa Karlsruhe – Financiamento",
      "Casa Karlsruhe – Nebenkosten/WEG/Hausverwaltung",
      "Casa Karlsruhe – Aquecimento/Fernwärme",
      "Casa Karlsruhe – Energia/Água (Utilidades)",
      "Casa Karlsruhe – Internet/TV (Imóvel)",
      "Casa Karlsruhe – Manutenção e Reparos",
      "Casa Karlsruhe – Impostos e Taxas (Imóvel)"
    ],
    "Casa Esting": [
      "Casa Esting – Financiamento",
      "Casa Esting – Materiais e Obras (Construção)",
      "Casa Esting – Serviços (Projetos/Arquitetura/Admin)",
      "Casa Esting – Utilidades (Provisório/Construção)",
      "Casa Esting – Manutenção e Reparos"
    ]
  },
  "Alimentação": {
    "Supermercado e Mercearia": [
      "Supermercado – REWE/Lidl/Edeka/Netto/Aldi",
      "Supermercado – Outros/Mercados especiais"
    ],
    "Padaria e Café": [
      "Padaria/Café – Ihle/Wünsche e similares",
      "Padaria/Café – Outros"
    ],
    "Restaurantes e Alimentação fora": [
      "Restaurante – Geral",
      "Fast-food – McDonald's e similares"
    ],
    "Bebidas e Especialidades": [
      "Bebidas – Vinhos/Loja especializada"
    ],
    "Refeição no trabalho": [
      "Almoço – Bosch"
    ]
  },
  "Compras & Estilo de Vida": {
    "Compras online & marketplace": [
      "Marketplace – Amazon",
      "Marketplace – Temu",
      "Loja online – Zalando",
      "Pagamentos online – PayPal (Compras)"
    ],
    "Lojas para casa & utilidades": [
      "Casa – TEDi/lojas de utilidades"
    ],
    "Vestuário & calçados": [
      "Roupas – Geral (H&M/About You/Hollister etc.)",
      "Esportes/roupa esportiva – Decathlon"
    ],
    "Higiene & drogaria": [
      "Drogaria – DM",
      "Drogaria – Rossmann",
      "Drogaria/Perfumaria – Müller"
    ],
    "Assinaturas digitais & software": [
      "Assinatura – Apple (iCloud/App Store)",
      "Assinatura – Google One/Google",
      "Assinatura – Netflix",
      "Assinatura – Disney+",
      "Assinatura – YouTube Premium",
      "Assinatura – OpenAI (ChatGPT)",
      "Assinatura – Claude.ai",
      "Assinatura – ElevenLabs"
    ],
    "Pets": [
      "Pets – Alimentação e acessórios"
    ],
    "Esportes & Fitness": [
      "Academia – Hommer Fitness (Olching)",
      "Artes marciais – BJJ/treinos"
    ],
    "Presentes & Festas": [
      "Presentes – Geral"
    ]
  },
  "Mobilidade": {
    "Carro": [
      "Carro – Combustível/Posto",
      "Carro – Seguro",
      "Carro – Estacionamento/Pedágio",
      "Carro – Multas/Infrações"
    ],
    "Transporte público": [
      "Transporte – MVV/Ônibus/Trem"
    ]
  },
  "Saúde & Seguros": {
    "Saúde": [
      "Médico/Clínica – PVS/consultas",
      "Dentista/Ortodontia",
      "Farmácia",
      "Ótica e óculos (Compra)"
    ],
    "Seguros": [
      "Seguro saúde – AOK",
      "Seguros – DEVK (Vida/Residencial/RC/Legal)",
      "Seguro vida/financiamento – R+V"
    ]
  },
  "Educação & Crianças": {
    "Escola & taxas": [
      "Escola – Gymnasium Olching (Taxas/viagens/licenças)"
    ],
    "Benefícios família": [
      "Benefício – Kindergeld"
    ],
    "Atividades": [
      "Atividades – Cursos/clubes (Crianças)"
    ]
  },
  "Lazer & Viagens": {
    "Viagens": [
      "Viagens – Hotéis",
      "Viagens – Aluguel de carro (Car rental)",
      "Viagens – Transferências internacionais (Wise/TransferWise)"
    ],
    "Entretenimento & eventos": [
      "Eventos – Ingressos/Tickets",
      "Lazer – Compras/serviços não essenciais"
    ]
  },
  "Interna": {
    "Pagamento de cartões": [
      "Pagamento – Amex (Liquidação/Fatura)",
      "Pagamento – Miles & More / DKB (Liquidação)"
    ]
  },
  "Finanças & Transferências": {
    "Transferências & Pix/PayPal": [
      "Transferência – PayPal (Top-up/withdraw)"
    ],
    "Saque em dinheiro": [
      "Saque – Caixa eletrônico (Sparkasse/ATM)"
    ],
    "Taxas & juros": [
      "Taxas bancárias – Sparkasse",
      "Juros/câmbio – Taxa internacional (1,95%)",
      "Mensalidade cartão – Miles & More",
      "Taxas – Devolução/Retorno de débito (Chargeback/Lastschrift)"
    ],
    "Dívidas & crédito": [
      "Crédito pessoal – ING DiBa (Rahmenkredit)",
      "Financiamento varejista – Apollo Optik (Parcelamento)",
      "Empréstimo recebido – Targobank"
    ]
  },
  "Trabalho & Receitas": {
    "Salário": [
      "Salário – Vinicius (Bosch)",
      "Salário – Erica (Transferência)"
    ],
    "Receita profissional": [
      "Receita profissional – Clientes (PayPal/Überweisung)"
    ],
    "Vendas online": [
      "Vendas online – Vinted/Mangopay"
    ],
    "Aluguel e rendas": [
      "Renda – Aluguel (Karlsruhe)"
    ]
  },
  "Doações & Outros": {
    "Doações/associações": [
      "Doação/Associação – Projeto social"
    ]
  },
  "Revisão & Não Classificado": {
    "Moradia – Geral (Revisão)": [
      "Moradia – Geral (Revisão) – Financiamento",
      "Moradia – Geral (Revisão) – Nebenkosten/Condomínio",
      "Moradia – Geral (Revisão) – Utilidades",
      "Moradia – Geral (Revisão) – Manutenção/Reparos",
      "Moradia – Geral (Revisão) – Materiais/Obras",
      "Moradia – Geral (Revisão) – Aluguel"
    ],
    "Transferências pessoais": [
      "Transferência – Família/Amigos"
    ],
    "Despesa não identificada": [
      "Despesa – Comerciante não identificado (Revisão)"
    ],
    "Receita não identificada": [
      "Receita – Entrada não identificada (Revisão)"
    ]
  },
  "Outros": {
    "Diversos": [
      "Outros – Não classificado"
    ]
  }
} as const;
