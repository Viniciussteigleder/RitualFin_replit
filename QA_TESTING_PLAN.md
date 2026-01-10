# Plano de Testes Sistemático - RitualFin

Este documento descreve a metodologia de testes para garantir a integridade dos dados, a precisão da classificação e a excelência da interface do usuário (UI/UX) no RitualFin.

## 1. O que está sendo testado?

### A. Integridade de Dados e Classificação
- **Consistência de Enums**: Garantir que as categorias usadas no código correspondam exatamente ao `category1Enum` do banco de dados (ex: "Mercados" ao invés de "Mercado").
- **Hierarquia de Taxonomia**: Validar se a estrutura de 3 níveis (`Category1` -> `Category2` -> `Category3`) é aplicada corretamente pelas regras de IA.
- **Regras de Sistema**: Verificar se as regras fixas (Mercados, Interno) estão sendo aplicadas prioritariamente.

### B. Funcionalidades do Analytics
- **Drill-down**: Capacidade de navegar de categorias gerais para subcategorias e transações individuais.
- **Filtros**: Precisão dos filtros de data, conta, tipo de transação e status.
- **Cálculos**: Verificação de totais, porcentagens e contagens de transações.

### C. Gestão de Regras e Transações
- **Criação de Regras**: Fluxo de criar uma regra a partir de uma transação e sua aplicação imediata.
- **Edição em Massa**: Atualização de múltiplas transações simultaneamente.

---

## 2. Como estamos testando? (Metodologia)

### A. Testes de Banco de Dados (Scripts de Backend)
Ao invés de clicar em cada tela, usamos scripts `tsx` que consultam o banco diretamente para verificar inconsistências.
- **Localização**: `/scripts/*.ts`
- **Exemplos**:
    - `check-all-categories.ts`: Lista todas as categorias presentes no banco.
    - `verify-taxonomy.ts`: Checa se existem transações com Category1 mas sem Category2/3.
    - `reapply-rules.ts`: Simula a aplicação de regras em massa.

### B. Testes de API (Verificação de Resposta)
Intercepção de chamadas de Server Actions para garantir que o dado enviado ao frontend é o esperado, antes dele ser transformado pela UI.

### C. Testes de UI Automatizados (Browser Agent)
Uso de agentes de automação para navegar nos fluxos críticos, tirar screenshots e validar elementos visuais sem intervenção humana constante.

---

## 3. Resultados Esperados

| Funcionalidade | Resultado Esperado |
| :--- | :--- |
| **Categorização** | Transações de supermarkert devem ser classificadas como `Mercados` (Plural). |
| **Hierarquia** | Ao clicar em `Mercados`, o próximo nível deve ser obrigatoriamente `Alimentação`. |
| **Nível 3** | O terceiro nível deve detalhar especificamente o tipo (ex: `Supermercado`). |
| **Analytics** | O gráfico de donut deve somar corretamente o valor absoluto das despesas. |

---

## 4. Abordagens Alternativas (Testes de Escala)

Para evitar o "clica-clica" manual, seguiremos estas alternativas sistemáticas:

### 1. **Unit Testing de Regras (Classification Runner)**
Criar uma "suíte de teste de classificação" onde passamos uma lista de descrições fictícias e verificamos se o `engine.ts` retorna a categoria correta sem precisar de um banco de dados real.

### 2. **Database Linting**
Um script que roda antes do deploy e alerta se houver qualquer valor na coluna `category1` que não pertença ao Enum oficial.

### 3. **Visual Regression Testing**
Tirar screenshots de telas "golden" (perfeitas) e comparar com o estado atual após mudanças no CSS para detectar bugs visuais automaticamente.

### 4. **API Integration Tests**
Testar as Server Actions (`getAnalyticsData`, `confirmTransaction`) com inputs variados e validar o schema do JSON de retorno.

---

## 5. Status Atual de Teste (Caso "Mercados")

- [x] **Script Verification**: Confirmado que o banco contém "Mercados" (Plural).
- [x] **Backend Fix**: Regras de sistema em `engine.ts` atualizadas.
- [x] **UI Sync**: CATEGORIES lists atualizadas em todos os componentes.
- [x] **Data Migration**: 289 transações corrigidas via script `reapply-mercados-rule.ts`.
- [ ] **Final Drill-down Check**: Validar visualmente se a expansão *Mercados -> Alimentação -> Supermercado* está fluida.
