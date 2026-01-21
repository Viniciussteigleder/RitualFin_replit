"use client";

import { 
  Upload, CheckCircle, Shuffle, Tag, Eye, BarChart3,
  FileText, Database, Key, Fingerprint, Shield, AlertTriangle,
  Zap, TrendingUp, Search, Settings, Target, BookOpen, Check
} from "lucide-react";
import { TOCSidebar } from "@/components/help/toc-sidebar";
import { JourneyStepper } from "@/components/help/journey-stepper";
import { ConceptCard } from "@/components/help/concept-card";
import { ExampleBeforeAfterCard } from "@/components/help/example-before-after-card";
import { ImpactMatrix } from "@/components/help/impact-matrix";
import { GlossaryPopover } from "@/components/help/glossary-popover";
import { FAQAccordion } from "@/components/help/faq-accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const tocItems = [
  { id: "hero", title: "Comece por aqui", level: 1 },
  { id: "jornada", title: "Mapa da Jornada", level: 1 },
  { id: "logica", title: "A Lógica por Trás do App", level: 1 },
  { id: "regras", title: "Regras de Categorização", level: 1 },
  { id: "regras-conceito", title: "Conceito", level: 2 },
  { id: "regras-aplicacao", title: "Como uma Regra é Aplicada", level: 2 },
  { id: "regras-exemplos", title: "Exemplos Práticos", level: 2 },
  { id: "regras-impacto", title: "Impacto de Mudanças", level: 2 },
  { id: "regras-conflitos", title: "Conflitos e Boas Práticas", level: 2 },
  { id: "navegacao", title: "Como Navegar pelo App", level: 1 },
  { id: "diagnostico", title: "Diagnóstico e Integridade", level: 1 },
  { id: "glossario", title: "Glossário", level: 1 },
  { id: "fluxos", title: "Fluxos Recomendados", level: 1 },
  { id: "faq", title: "Perguntas Frequentes", level: 1 },
];

const journeySteps = [
  {
    id: "importar",
    number: 1,
    title: "Importar",
    icon: Upload,
    whatHappens: "O sistema lê o arquivo CSV, detecta o formato (Sparkasse, Amex, M&M) e extrai as transações brutas.",
    whatUserDoes: "Você faz upload do extrato bancário em CSV na tela de Importar Arquivos.",
    screenLinks: [{ name: "Importar Arquivos", href: "/uploads" }],
    checklist: [
      "Baixe o extrato do seu banco em formato CSV",
      "Acesse 'Importar Arquivos'",
      "Faça upload do arquivo",
      "Aguarde o processamento"
    ]
  },
  {
    id: "validar",
    number: 2,
    title: "Validar",
    icon: CheckCircle,
    whatHappens: "O Diagnóstico verifica problemas como colunas deslocadas, valores divergentes, duplicidades e inconsistências.",
    whatUserDoes: "Você revisa os problemas detectados e corrige importações com erro.",
    screenLinks: [{ name: "Diagnóstico", href: "/admin/diagnostics" }],
    checklist: [
      "Execute o Diagnóstico",
      "Revise problemas críticos",
      "Corrija importações problemáticas",
      "Verifique duplicidades"
    ]
  },
  {
    id: "normalizar",
    number: 3,
    title: "Normalizar",
    icon: Shuffle,
    whatHappens: "O sistema cria key_desc (descrição normalizada) e fingerprint (identidade única) para cada transação.",
    whatUserDoes: "Processo automático. Você não precisa fazer nada.",
    screenLinks: [],
    checklist: [
      "Normalização é automática",
      "key_desc remove ruído e padroniza",
      "fingerprint evita duplicidades"
    ]
  },
  {
    id: "categorizar",
    number: 4,
    title: "Categorizar",
    icon: Tag,
    whatHappens: "As regras são aplicadas. Transações que casam com keywords recebem categoria automaticamente.",
    whatUserDoes: "Você cria e ajusta regras para melhorar a categorização automática.",
    screenLinks: [
      { name: "Regras de IA", href: "/settings/rules" },
      { name: "Sugestões IA", href: "/confirm" }
    ],
    checklist: [
      "Revise transações OPEN",
      "Crie regras a partir de padrões",
      "Use Sugestões IA para descobrir regras",
      "Reapl ique regras após mudanças"
    ]
  },
  {
    id: "revisar",
    number: 5,
    title: "Revisar",
    icon: Eye,
    whatHappens: "Você visualiza transações categorizadas e ajusta manualmente quando necessário.",
    whatUserDoes: "Você revisa o Extrato, corrige categorias e marca transações como revisadas.",
    screenLinks: [{ name: "Extrato", href: "/transactions" }],
    checklist: [
      "Filtre por 'Precisa de revisão'",
      "Corrija categorias incorretas",
      "Marque como revisado",
      "Crie regras para padrões recorrentes"
    ]
  },
  {
    id: "analisar",
    number: 6,
    title: "Analisar",
    icon: BarChart3,
    whatHappens: "Relatórios e gráficos mostram para onde seu dinheiro está indo, baseado nas categorias.",
    whatUserDoes: "Você analisa gastos, compara meses e toma decisões financeiras.",
    screenLinks: [
      { name: "Dashboard", href: "/" },
      { name: "Análise Total", href: "/analytics" }
    ],
    checklist: [
      "Revise Dashboard mensal",
      "Compare períodos em Análise Total",
      "Identifique categorias problemáticas",
      "Ajuste orçamentos e metas"
    ]
  }
];

const faqItems = [
  {
    id: "faq-open",
    question: "Por que minha transação ficou OPEN (Não classificado)?",
    answer: (
      <div className="space-y-2">
        <p>Uma transação fica OPEN quando:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Nenhuma regra casou com a descrição</li>
          <li>A descrição é muito genérica ou única</li>
          <li>É a primeira vez que esse tipo de transação aparece</li>
        </ul>
        <p className="mt-2"><strong>Solução:</strong> Crie uma regra a partir da transação ou categorize manualmente.</p>
      </div>
    )
  },
  {
    id: "faq-reaplicar",
    question: "Como reaplicar regras depois de criar ou editar uma?",
    answer: "Vá em Extrato, clique no botão 'Reaplicar Regras' no topo da página. Isso recategoriza todas as transações com base nas regras atuais."
  },
  {
    id: "faq-key-desc",
    question: "O que é key_desc?",
    answer: "key_desc é a descrição normalizada da transação. Remove ruído (datas, números de referência), padroniza espaços e caracteres especiais. É usada para casar com as regras de forma mais confiável."
  },
  {
    id: "faq-fingerprint",
    question: "O que é fingerprint?",
    answer: "Fingerprint é a 'identidade única' da transação, calculada a partir de data, valor e descrição. Serve para evitar duplicidades: se duas linhas têm o mesmo fingerprint, são consideradas a mesma transação."
  },
  {
    id: "faq-duplicidade",
    question: "Como evitar duplicidades ao importar?",
    answer: "O sistema usa fingerprint para detectar duplicidades automaticamente. Se você importar o mesmo arquivo duas vezes, as transações duplicadas não serão criadas novamente. Verifique o Diagnóstico para confirmar."
  },
  {
    id: "faq-desfazer",
    question: "Importei errado — posso desfazer?",
    answer: "Atualmente não há função de 'desfazer importação'. Você pode deletar transações manualmente no Extrato ou usar o Diagnóstico para identificar e corrigir problemas. Sempre revise o preview antes de confirmar importações."
  },
  {
    id: "faq-salario",
    question: "Como garantir que salários entram como Receita?",
    answer: "Crie uma regra com keyword 'GEHALT' ou 'SALÁRIO' e defina tipo como 'Receita'. Certifique-se de que a categoria é 'Trabalho > Salário'. Reapl ique as regras após criar."
  },
  {
    id: "faq-relatorio-mudou",
    question: "Por que meu relatório mudou depois de editar uma regra?",
    answer: "Quando você muda uma regra, ela afeta TODAS as transações que casam com ela, inclusive transações antigas. Isso recalcula os totais por categoria, mudando gráficos e relatórios. Sempre reapl ique regras após editar."
  },
  {
    id: "faq-datas",
    question: "Como o app trata datas e fuso horário?",
    answer: "O app usa payment_date (data de pagamento) como data principal. Fusos são tratados como UTC por padrão. Datas são exibidas no formato local do navegador."
  },
  {
    id: "faq-diagnostico-verifica",
    question: "O que o Diagnóstico verifica?",
    answer: (
      <div className="space-y-2">
        <p>O Diagnóstico verifica:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Colunas deslocadas (datas em key_desc)</li>
          <li>Valores divergentes (amount diferente de key_desc)</li>
          <li>Duplicidades (mesmo fingerprint)</li>
          <li>Inconsistências de categoria (leaf_id vs category_1)</li>
          <li>Salários categorizados como Despesa</li>
          <li>Transações sem evidência (sem link para CSV bruto)</li>
        </ul>
      </div>
    )
  },
  {
    id: "faq-severidade",
    question: "Como interpretar a severidade no Diagnóstico?",
    answer: "Crítico = bloqueia análises confiáveis (ex: colunas deslocadas). Alto = afeta precisão (ex: categoria errada). Médio = pode gerar confusão. Baixo = informativo."
  },
  {
    id: "faq-regra-nao-funciona",
    question: "Criei uma regra mas ela não está funcionando. Por quê?",
    answer: (
      <div className="space-y-2">
        <p>Verifique:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>A regra está ativa?</li>
          <li>As keywords estão corretas (sem acentos se necessário)?</li>
          <li>Não há keywords negativas bloqueando?</li>
          <li>Você reaplicou as regras após criar?</li>
          <li>Não há outra regra com prioridade maior conflitando?</li>
        </ul>
      </div>
    )
  }
];

export function ComoFuncionaClient() {
  return (
    <div className="relative min-h-screen pb-20">
      <TOCSidebar items={tocItems} />
      
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-16">
        {/* HERO */}
        <section id="hero" className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
              Como o RitualFin funciona
            </h1>
            <p className="text-xl text-muted-foreground">
              Entenda a lógica do app, as regras de categorização e o impacto em todas as telas.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card">
            <h2 className="font-bold text-lg text-foreground mb-4">Você vai aprender</h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-sm">1</span>
                </div>
                <span className="text-muted-foreground">Como o RitualFin processa seus extratos do início ao fim</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-sm">2</span>
                </div>
                <span className="text-muted-foreground">O que são normalização, key_desc, fingerprint e como funcionam</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-sm">3</span>
                </div>
                <span className="text-muted-foreground">Como criar e gerenciar regras de categorização eficazes</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-sm">4</span>
                </div>
                <span className="text-muted-foreground">Como mudanças em regras ou categorias afetam TODAS as telas</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-sm">5</span>
                </div>
                <span className="text-muted-foreground">Fluxos práticos para primeiro uso, revisão semanal e mensal</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href="#jornada">Ver jornada do usuário</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="#regras">Entender regras</a>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/diagnostics">Executar Diagnóstico</Link>
            </Button>
          </div>
        </section>

        {/* JORNADA */}
        <section id="jornada" className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Mapa Interativo da Jornada</h2>
            <p className="text-muted-foreground">
              Clique em cada passo para ver detalhes, telas relacionadas e checklist rápido.
            </p>
          </div>
          <JourneyStepper steps={journeySteps} />
        </section>

        {/* LÓGICA */}
        <section id="logica" className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">A Lógica por Trás do App</h2>
            <p className="text-muted-foreground">
              Entenda como seus dados fluem do CSV até os relatórios finais.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-primary/30 bg-primary/5">
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <div className="flex items-center gap-2 shrink-0">
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-semibold text-sm">CSV Bruto</span>
              </div>
              <div className="text-muted-foreground">→</div>
              <div className="flex items-center gap-2 shrink-0">
                <Database className="h-5 w-5 text-primary" />
                <span className="font-semibold text-sm">Parsing</span>
              </div>
              <div className="text-muted-foreground">→</div>
              <div className="flex items-center gap-2 shrink-0">
                <Shuffle className="h-5 w-5 text-primary" />
                <span className="font-semibold text-sm">Normalização</span>
              </div>
              <div className="text-muted-foreground">→</div>
              <div className="flex items-center gap-2 shrink-0">
                <Key className="h-5 w-5 text-primary" />
                <span className="font-semibold text-sm">key_desc</span>
              </div>
              <div className="text-muted-foreground">→</div>
              <div className="flex items-center gap-2 shrink-0">
                <Settings className="h-5 w-5 text-primary" />
                <span className="font-semibold text-sm">Regras</span>
              </div>
              <div className="text-muted-foreground">→</div>
              <div className="flex items-center gap-2 shrink-0">
                <Tag className="h-5 w-5 text-primary" />
                <span className="font-semibold text-sm">Categoria</span>
              </div>
              <div className="text-muted-foreground">→</div>
              <div className="flex items-center gap-2 shrink-0">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="font-semibold text-sm">Relatórios</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <ConceptCard
              icon={Shuffle}
              title="Normalização"
              description="Remove ruído das descrições: datas, números de referência, espaços extras. Padroniza para facilitar o casamento com regras."
              example="'REWE 12.01.2024 REF123' → 'REWE'"
              iconColor="#8B5CF6"
            />
            <ConceptCard
              icon={Key}
              title="key_desc"
              description="Descrição normalizada. É o texto limpo usado para casar com as keywords das regras. Garante consistência."
              example="Usado internamente para matching de regras"
              iconColor="#3B82F6"
            />
            <ConceptCard
              icon={Fingerprint}
              title="Fingerprint"
              description="Identidade única da transação, calculada a partir de data + valor + descrição. Evita duplicidades ao importar o mesmo arquivo duas vezes."
              example="SHA256(data + amount + desc)"
              iconColor="#10B981"
            />
            <ConceptCard
              icon={Shield}
              title="Detecção de Erros"
              description="O Diagnóstico verifica colunas deslocadas, valores divergentes, duplicidades e inconsistências de categoria."
              example="Alerta se key_desc contém datas (coluna errada)"
              iconColor="#EF4444"
            />
          </div>
        </section>

        {/* REGRAS */}
        <section id="regras" className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Regras de Categorização</h2>
            <p className="text-muted-foreground">
              O coração do RitualFin. Entenda como funcionam, como criar e como evitar conflitos.
            </p>
          </div>

          {/* Conceito */}
          <div id="regras-conceito" className="space-y-4">
            <h3 className="text-2xl font-bold text-foreground">Conceito</h3>
            <div className="p-6 rounded-xl border border-border bg-card">
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong className="text-foreground">Regra = quando a descrição parece com X, categorize como Y.</strong>
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Regras tornam a categorização consistente e reduzem trabalho manual. Uma vez criada, a regra se aplica a TODAS as transações que casam com ela, passadas e futuras.
              </p>
            </div>
          </div>

          {/* Como é aplicada */}
          <div id="regras-aplicacao" className="space-y-4">
            <h3 className="text-2xl font-bold text-foreground">Como uma Regra é Aplicada</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-primary font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Normalização primeiro</h4>
                    <p className="text-sm text-muted-foreground">A descrição é normalizada (key_desc) antes de casar com as keywords.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-primary font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Keywords positivas</h4>
                    <p className="text-sm text-muted-foreground">Se a key_desc contém QUALQUER keyword positiva, a regra casa.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-primary font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Keywords negativas bloqueiam</h4>
                    <p className="text-sm text-muted-foreground">Se houver keyword negativa na descrição, a regra NÃO se aplica, mesmo que haja positiva.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-primary font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Prioridade decide conflitos</h4>
                    <p className="text-sm text-muted-foreground">Se duas regras casam, a de maior prioridade vence (número menor = maior prioridade).</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Exemplos */}
          <div id="regras-exemplos" className="space-y-4">
            <h3 className="text-2xl font-bold text-foreground">Exemplos Práticos</h3>
            <div className="space-y-4">
              <ExampleBeforeAfterCard
                title="Exemplo 1: Salário"
                before={{ description: "GEHALT ARBEITGEBER", category: "OPEN" }}
                rule={{ keywords: ["GEHALT"], targetCategory: "Receita > Trabalho > Salário" }}
                after={{ category: "Receita > Trabalho > Salário", impact: "Aparece corretamente no Dashboard como Receita" }}
              />
              <ExampleBeforeAfterCard
                title="Exemplo 2: Supermercado"
                before={{ description: "REWE SAGT DANKE", category: "OPEN" }}
                rule={{ keywords: ["REWE", "EDEKA", "ALDI"], targetCategory: "Despesa > Alimentação > Supermercado" }}
                after={{ category: "Despesa > Alimentação > Supermercado", impact: "Totais de Alimentação são atualizados" }}
              />
              <ExampleBeforeAfterCard
                title="Exemplo 3: Transporte (com negativa)"
                before={{ description: "UBER EATS DELIVERY", category: "OPEN" }}
                rule={{ keywords: ["UBER"], targetCategory: "Despesa > Transporte > Uber" }}
                after={{ category: "OPEN", impact: "Regra NÃO se aplica porque 'EATS' está em keywords negativas" }}
              />
            </div>
          </div>

          {/* Impacto */}
          <div id="regras-impacto" className="space-y-4">
            <h3 className="text-2xl font-bold text-foreground">O que acontece quando você muda uma regra?</h3>
            <p className="text-muted-foreground">
              Mudanças em regras afetam <strong className="text-foreground">TODAS as telas</strong>. Veja o impacto:
            </p>
            <ImpactMatrix />
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
              <p className="text-sm text-amber-900 dark:text-amber-200">
                <strong>⚠️ Importante:</strong> Sempre clique em "Reaplicar Regras" após criar ou editar regras para garantir que todas as transações sejam recategorizadas.
              </p>
            </div>
          </div>

          {/* Conflitos */}
          <div id="regras-conflitos" className="space-y-4">
            <h3 className="text-2xl font-bold text-foreground">Conflitos e Boas Práticas</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                <h4 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Evite
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Regras muito genéricas (ex: keyword "DE")</li>
                  <li>• Múltiplas regras para o mesmo padrão</li>
                  <li>• Keywords com acentos se o banco não usa</li>
                  <li>• Esquecer de reaplicar após editar</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                <h4 className="font-semibold text-emerald-600 mb-2 flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Boas Práticas
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Use keywords específicas e únicas</li>
                  <li>• Revise regras mensalmente</li>
                  <li>• Use keywords negativas para exceções</li>
                  <li>• Teste regras antes de reaplicar em massa</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* NAVEGAÇÃO */}
        <section id="navegacao" className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Como Navegar pelo App</h2>
            <p className="text-muted-foreground">Tarefas comuns e onde encontrá-las.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-foreground">Quero categorizar mais rápido</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Use <GlossaryPopover term="Sugestões IA" definition="Tela que descobre padrões e sugere regras automaticamente" /> para criar regras a partir de padrões detectados.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/confirm">Ir para Sugestões IA</Link>
              </Button>
            </div>
            <div className="p-5 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Search className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-foreground">Quero conferir duplicidades</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Execute o <GlossaryPopover term="Diagnóstico" definition="Ferramenta que verifica integridade dos dados e detecta problemas" /> e veja a seção "Fingerprints Duplicados".
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/diagnostics">Executar Diagnóstico</Link>
              </Button>
            </div>
            <div className="p-5 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-foreground">Quero entender para onde foi meu dinheiro</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Veja o Dashboard para visão mensal ou Análise Total para comparar períodos.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/">Dashboard</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/analytics">Análise Total</Link>
                </Button>
              </div>
            </div>
            <div className="p-5 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-foreground">Quero planejar meus gastos</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Use Orçamentos para definir limites por categoria e Metas para objetivos financeiros.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/budgets">Orçamentos</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/goals">Metas</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* DIAGNÓSTICO */}
        <section id="diagnostico" className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Diagnóstico e Integridade</h2>
            <p className="text-muted-foreground">
              Como usar o Diagnóstico para garantir que seus dados estão corretos.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card space-y-4">
            <h3 className="font-bold text-lg text-foreground">O que o Diagnóstico verifica</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Colunas deslocadas</p>
                  <p className="text-xs text-muted-foreground">Datas aparecendo em key_desc</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Valores divergentes</p>
                  <p className="text-xs text-muted-foreground">Amount diferente de key_desc</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Duplicidades</p>
                  <p className="text-xs text-muted-foreground">Mesmo fingerprint</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Inconsistências de categoria</p>
                  <p className="text-xs text-muted-foreground">leaf_id não bate com category_1</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Salários como Despesa</p>
                  <p className="text-xs text-muted-foreground">GEHALT categorizado errado</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Sem evidência</p>
                  <p className="text-xs text-muted-foreground">Transação sem link para CSV bruto</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>💡 Regra de ouro:</strong> Sempre use a evidência do arquivo bruto (CSV original) para corrigir importações problemáticas.
            </p>
          </div>
        </section>

        {/* GLOSSÁRIO */}
        <section id="glossario" className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Glossário Inteligente</h2>
            <p className="text-muted-foreground">
              Passe o mouse sobre os termos para ver definições e exemplos.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border bg-card">
              <GlossaryPopover 
                term="Conta" 
                definition="Conta bancária ou cartão de crédito de onde vêm as transações."
                example="Sparkasse, Amex, M&M"
              />
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <GlossaryPopover 
                term="Lote de importação" 
                definition="Conjunto de transações importadas de um único arquivo CSV."
                example="Upload de 'extrato_janeiro.csv' cria 1 lote"
              />
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <GlossaryPopover 
                term="Transação" 
                definition="Movimentação financeira individual: pagamento, recebimento ou transferência."
                example="Compra no supermercado, salário recebido"
              />
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <GlossaryPopover 
                term="Descrição normalizada (key_desc)" 
                definition="Versão limpa da descrição, sem ruído. Usada para casar com regras."
                example="'REWE 12.01 REF123' → 'REWE'"
              />
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <GlossaryPopover 
                term="Fingerprint" 
                definition="Identidade única da transação (hash de data + valor + descrição). Evita duplicidades."
                example="SHA256(2024-01-15 + 50.00 + REWE)"
              />
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <GlossaryPopover 
                term="Regra" 
                definition="Instrução que diz: se a descrição contém X, categorize como Y."
                example="Se contém 'REWE' → Alimentação > Supermercado"
              />
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <GlossaryPopover 
                term="Categoria (Leaf)" 
                definition="Nível mais detalhado da taxonomia (Category3). Define onde a transação aparece nos relatórios."
                example="Alimentação > Restaurantes > Fast Food"
              />
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <GlossaryPopover 
                term="OPEN / Não classificado" 
                definition="Transação sem categoria definida. Nenhuma regra casou."
                example="Primeira vez que aparece ou descrição muito genérica"
              />
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <GlossaryPopover 
                term="Receita / Despesa" 
                definition="Tipo da transação. Receita = dinheiro entrando. Despesa = dinheiro saindo."
                example="Salário = Receita. Supermercado = Despesa"
              />
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <GlossaryPopover 
                term="Reaplicar regras" 
                definition="Recategorizar TODAS as transações com base nas regras atuais."
                example="Após criar/editar regra, clique em 'Reaplicar Regras'"
              />
            </div>
          </div>
        </section>

        {/* FLUXOS */}
        <section id="fluxos" className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Fluxos Recomendados</h2>
            <p className="text-muted-foreground">
              Checklists práticos para diferentes momentos.
            </p>
          </div>
          <div className="space-y-4">
            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Primeiro Uso (0 → Pronto)
              </h3>
              <ul className="space-y-2">
                {[
                  "Baixe extratos dos últimos 3 meses (CSV)",
                  "Importe cada arquivo em 'Importar Arquivos'",
                  "Execute Diagnóstico e corrija problemas críticos",
                  "Revise transações OPEN no Extrato",
                  "Crie 5-10 regras básicas (salário, supermercado, transporte)",
                  "Reapl ique regras",
                  "Confira Dashboard e Análise Total"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-primary font-bold text-xs">{idx + 1}</span>
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-border bg-card">
                <h3 className="font-bold text-base text-foreground mb-3">Revisão Semanal (Ritual)</h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Importe extrato da semana</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Revise transações OPEN</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Crie 1-2 regras novas se necessário</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Confira Dashboard</span>
                  </li>
                </ul>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card">
                <h3 className="font-bold text-base text-foreground mb-3">Revisão Mensal</h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Execute Diagnóstico completo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Revise regras (conflitos, duplicadas)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Compare mês atual vs anterior</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Ajuste orçamentos e metas</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Perguntas Frequentes</h2>
            <p className="text-muted-foreground">
              Respostas para as dúvidas mais comuns.
            </p>
          </div>
          <FAQAccordion items={faqItems} />
        </section>

        {/* Footer */}
        <div className="pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Ainda tem dúvidas? Execute o <Link href="/admin/diagnostics" className="text-primary hover:underline">Diagnóstico</Link> ou revise suas <Link href="/settings/rules" className="text-primary hover:underline">Regras</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
