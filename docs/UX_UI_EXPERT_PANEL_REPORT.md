# Relatório Painel de Especialistas UX/UI (Top 6) - RitualFin V3

**Data:** 14 de Janeiro de 2026
**Contexto:** Transformação do RitualFin de "App de Controle" para "Sistema Operacional de Rituais Financeiros".

---

## 👥 O Painel de Especialistas

1.  **Sir Jony Ive:** Estética, Materialidade, Obsessão pelo Detalhe. ("Does it feel inevitable?")
2.  **Luke Wroblewski:** Mobile First, Inputs Naturais, Visualização de Dados. ("Obvious always wins.")
3.  **Steve Krug:** Usabilidade Radical, Carga Cognitiva Zero. ("Don't make me think.")
4.  **Don Norman:** Design Emocional, Modelos Mentais, Psicologia. ("Attractive things work better.")
5.  **Jakob Nielsen:** Heurísticas de Usabilidade, Prevenção de Erros. ("Recognize rather than recall.")
6.  **Brad Frost:** Atomic Design, Escalabilidade de Código, Performance. ("Do more with less.")

---

## 🚨 Descoberta de Engenharia (Brad Frost)
**Bloqueio Crítico Identificado:**
A tela de transações (`/transactions`) sofre um crash: `TypeError: SAMPLE_QUESTIONS is not iterable`.
*   **Causa:** O arquivo `src/lib/actions/ai-chat.ts` começa com `"use server"`. Isso transforma *todas* as exportações em Server Actions (funções assíncronas). Você está tentando exportar uma constante array (`SAMPLE_QUESTIONS`) de um arquivo server-only para um componente Client (`AIAnalystChat`). O bundler do Next.js não consegue serializar o array diretamente para o cliente dessa forma.
*   **Solução Imediata:** Mover `SAMPLE_QUESTIONS` para um arquivo separado (ex: `src/lib/constants/ai-prompts.ts`) que não tenha a diretiva `"use server"`.

---

## 1. Avaliação de Funcionalidades Atuais

### A. Lista de Transações (`TransactionList`)
*   **Jony Ive:** "É uma planilha glorificada. Falta alma. Os logotipos das marcas (`aliasMap`) são um bom começo, mas o espaçamento é muito denso. Quando vejo uma transação, quero ver a *história* dela, não a linha do banco de dados."
*   **Luke Wroblewski:** "No mobile, a densidade é perigosa. O botão 'Filtros' esconde opções cruciais. Deveríamos usar 'Filter Chips' horizontais que deslizam (scroll) no topo, como no Google Photos."
*   **Jakob Nielsen:** "Violão da Heurística #4 (Consistência). Os ícones de categoria têm cores de fundo, mas os logos de marca têm fundo branco/transparente com borda. Isso cria ruído visual (scannability reduzida)."

### B. Chat Analista IA (`AIAnalystChat`)
*   **Don Norman:** "A persona é 'Profissional mas amigável' (visto no `SYSTEM_PROMPT`), o que é bom. Mas a interação inicial é fria. Clicar em um botão pequeno para abrir um Sheet lateral parece 'suporte técnico'. A IA deveria ser onipresente, ou uma companheira constante."
*   **Steve Krug:** "Por que tenho que clicar em 'Perguntar'? Se o sistema sabe que gastei 30% mais em Uber este mês, ele deveria me dizer isso *antes* de eu perguntar."

### C. Filtros e Busca
*   **Brad Frost:** "O componente `TransactionList` tem 548 linhas. É um monólito. A lógica de filtragem (`filtered`, `sortedTransactions`) está misturada com a UI. Difícil de manter e testar."
*   **Steve Krug:** "O botão 'Re-Run Rules' é assustador. O que acontece se eu clicar? Vai estragar o que já fiz? Falta feedback prévio ('Isso afetará 12 transações')."

---

## 2. Proposta de Novas Funcionalidades (Conceitos)

### ✨ Feature 1: "The Daily Brief" (O Briefing Diário)
*   **Proponente:** Jony Ive & Luke Wroblewski
*   **Conceito:** Ao abrir o app, não mostre um Dashboard estático. Mostre um "Story" (estilo Instagram) do dia anterior.
    *   "Ontem você gastou R$ 120."
    *   "Sua maior compra foi: Supermercado Zaffari."
    *   "Você está 5% abaixo da meta. Ótimo trabalho."
*   **Por que:** Transforma o controle financeiro de "tarefa chata" em "ritual de consumo de conteúdo".

### 🧠 Feature 2: "Smart Categorization Feed" (Inbox Zero)
*   **Proponente:** Steve Krug & Don Norman
*   **Conceito:** Substituir a "Tabela de Transações Pendentes" por um cartão único, focado, estilo Tinder.
    *   Mostra UMA transação grande no centro.
    *   IA sugere: "Isso parece 'Alimentação'. Confirma?"
    *   Botão Gigante "Sim" (Verde) e "Editar" (Cinza).
*   **Por que:** Reduz a carga cognitiva de olhar uma lista de 50 itens. Gamifica a categorização.

### 🛡️ Feature 3: "Natural Language Rules" (Regras Humanas)
*   **Proponente:** Jakob Nielsen
*   **Conceito:** Em vez de formulários complexos (Se `desc` contains `x` then `y`), permitir que o usuário escreva:
    *   "Sempre que eu for no 'Starbucks', coloque como 'Café/Lazer'."
*   **Implementação:** A IA traduz isso para a regra de banco de dados (`leaf_id`, `keywords`).

---

## 3. Instruções Detalhadas de Implementação (SW Implementation)

### Passo 1: Correção do Crash (Engenharia)
Refatore a arquitetura de constantes da IA para separar dados estáticos de ações de servidor.

**Arquivo:** `src/lib/constants/ai-prompts.ts` (Novo Arquivo)
```typescript
export const SAMPLE_QUESTIONS = [
  // ... mover o array gigante para cá ...
  "Quanto gastei este mês?",
  // ...
];
```

**Arquivo:** `src/lib/actions/ai-chat.ts`
```typescript
"use server";
// Remover export const SAMPLE_QUESTIONS...
// Manter apenas as funções async
```

**Arquivo:** `src/components/transactions/AIAnalystChat.tsx`
```typescript
// Atualizar import
import { SAMPLE_QUESTIONS } from "@/lib/constants/ai-prompts";
import { sendChatMessage } from "@/lib/actions/ai-chat";
```

### Passo 2: Componentização Atômica (Brad Frost)
Quebre o `TransactionList` em organismos menores.
1.  `src/components/transactions/TransactionRow.tsx`: Componente puro que recebe `transaction` e renderiza a linha (Desktop/Mobile).
2.  `src/components/transactions/TransactionFilters.tsx`: Só a barra de busca e filtros.
3.  `src/components/transactions/TransactionGroup.tsx`: Renderiza o cabeçalho de data e a lista de Rows daquele dia.

### Passo 3: Implementar "Smart Feed" Card (Don Norman)
Crie um novo componente para a Dashboard para categorização rápida.

**Arquivo:** `src/components/dashboard/QuickReviewCard.tsx`
```tsx
import { motion, AnimatePresence } from "framer-motion";

export function QuickReviewCard({ transaction, onConfirm, onSkip }) {
  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden relative aspect-[4/5]">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent" />
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center text-3xl">
          {/* Logo ou Ícone da Categoria Sugerida */}
          🍔
        </div>
        
        <div>
          <h3 className="text-xl font-bold font-display">{transaction.description}</h3>
          <p className="text-3xl font-black text-emerald-600 mt-2">
            {formatCurrency(transaction.amount)}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            A IA sugere: <span className="font-bold text-foreground">Alimentação</span>
          </p>
        </div>

        <div className="flex gap-4 w-full mt-4">
          <Button variant="outline" className="flex-1 h-14 rounded-xl" onClick={onSkip}>
            Editar
          </Button>
          <Button className="flex-1 h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg" onClick={onConfirm}>
            Sim
          </Button>
        </div>
      </div>
    </Card>
  )
}
```

### Passo 4: Polimento Visual (Jony Ive)
No `TransactionRow.tsx` (antigo grid), remover bordas verticais. Usar apenas espaço em branco.
*   **Avatar:** Aumentar para `w-12 h-12` (48px).
*   **Fonte:** Usar `font-medium` para o nome do estabelecimento, `text-foreground`.
*   **Data:** Mover para baixo do nome, menor e cinza (`text-muted-foreground`).
*   **Hover:** Em vez de mudar a cor de fundo cinza, aplicar uma leve elevação: `hover:shadow-md hover:scale-[1.005] hover:bg-white dark:hover:bg-zinc-900 border-transparent hover:border-zinc-100`.

---
*Este plano de implementação foca primeiro na estabilidade (crash), depois na arquitetura (atomic design) e finalmente na experiência emocional (smart feed).*
