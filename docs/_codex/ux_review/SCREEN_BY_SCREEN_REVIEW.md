# Screen by Screen Review (Revised)

## Login / Entry

### a) Screen purpose
"Como entro com seguranca e sem friccao?"

### b) O que funciona bem
- Hierarquia clara e CTA principal visivel.

### c) Friccoes e problemas
- Google login e cadastro sao placeholders; geram expectativa falsa.
- Sem feedback de erro de login.

### d) Propostas
- Exibir "modo demo" explicitamente.
- Adicionar mensagem de erro de autenticacao.
- Marcar links como "em breve" se nao funcionam.

### e) Estados ausentes
- Erro de login.
- Bloqueio de clique repetido no Google login.

---

## Dashboard

### a) Screen purpose
"Quanto posso gastar agora e o que ainda vai cair?"

### b) O que funciona bem
- KPIs e insights com leitura rapida.
- Merchant icons em transacoes recentes.

### c) Friccoes e problemas
- "Disponivel real" ainda nao tem breakdown visivel (renda/gasto/compromissos).

### d) Propostas
- Manter "Disponivel real" como KPI principal e expor breakdown em tooltip.

### e) Estados ausentes
- Sem dados (primeiro uso) com CTA para Uploads.

---

## Calendario (Mes + Semana)

### a) Screen purpose
"Onde estao meus gastos e compromissos no tempo?"

### b) O que funciona bem
- Detail panel contextual com resumo dia/semana.
- Filtros de projetado/realizado no calendario.

### c) Friccoes e problemas
- Semana nao mostra 4 semanas do mes (PRD).

### d) Propostas
- Manter legenda visual e adicionar totais separados por semana.
- Semana com 4 blocos e totais por semana.

### e) Estados ausentes
- Dia vazio (sem transacoes e eventos).

---

## Event Detail (Calendario)

### a) Screen purpose
"Qual o impacto e historico deste compromisso?"

### b) O que funciona bem
- Resumo do evento e proximo vencimento.

### c) Friccoes e problemas
- Sem link entre evento e transacoes reais.

### d) Propostas
- "Vincular transacao" ou "Marcar como pago".

---

## Upload (CSV + Imagens)

### a) Screen purpose
"Importar dados e entender o resultado."

### b) O que funciona bem
- Dropzone clara, KPIs e CTA para Confirmacao.
- Formato detectado e preview dos erros direto no card.

### c) Friccoes e problemas
- Progress bar e fake.
- Upload de imagens (prometido) nao existe.

### d) Propostas
- Melhorar progress com progresso real ou remover.
- Adicionar tab "CSV" e "Imagens" quando houver upload de imagem.

---

## Confirmacao / Fila de Classificacao

### a) Screen purpose
"Resolver pendencias rapido e ensinar o sistema."

### b) O que funciona bem
- Confianca em buckets e CTA de bulk confirm.

### c) Friccoes e problemas
- Agrupamento por merchant ainda nao cria regra com 1 clique.
- Explicacao de sugestao nao aparece no fluxo de bulk confirm.

### d) Propostas
- Adicionar opcao "Criar regra" no grupo.
- Levar "Por que?" para o modo agrupado (dentro do card).

---

## Transacoes (Lista + Detalhes)

### a) Screen purpose
"Ledger completo, confiavel e editavel."

### b) O que funciona bem
- Filtros, export, badges de conta e merchant icons.
- Paginação por página (50 itens) para performance.

### c) Friccoes e problemas
- Nenhuma fricção crítica após paginação.

### d) Propostas
- Virtualização opcional acima de 5k.

---

## Transaction Detail Modal

### a) Screen purpose
"Explicar e ajustar com confianca."

### b) O que funciona bem
- Edicao completa e manualOverride.

### c) Friccoes e problemas
- Nao mostra regra/keyword/confidencia.

### d) Propostas
- Bloco "Motivo da categoria".

---

## Regras

### a) Screen purpose
"Governar automacao sem medo."

### b) O que funciona bem
- CRUD direto e reaplicar regras.
- Guia rapido de N1/N2/N3 no formulario.

### c) Friccoes e problemas
- Preview de impacto ainda é parcial (pendentes).

### d) Propostas
- Simulador de descricao.
- Preview "X transacoes mudariam" com contagem real.
- Aba "Sugestoes IA" dentro de Regras (done).

---

## Categories Management (Shell)

### a) Screen purpose
"Controlar taxonomia N1-N3."

### b) O que falta
- Backend de CRUD e impactos em regras/transacoes.

---

## Orcamento Mensal

### a) Screen purpose
"Definir limites por categoria para o mes."

### b) O que funciona bem
- Progress por categoria e atualizacao inline.

### c) Friccoes e problemas
- Sem copiar mes anterior.
- Sem sugestoes baseadas em historico.

### d) Propostas
- Botao "Copiar mes anterior".
- Sugestao automatica (media 3 meses).

---

## Metas

### a) Screen purpose
"Definir objetivos estrategicos."

### b) O que funciona bem
- Progresso por categoria.

### c) Friccoes e problemas
- Confusao com Orcamento.

### d) Propostas
- Copy ja clarificada, mas falta explicacao comparativa (quando usar cada).
- CTA inicial agora aponta para renda estimada.

---

## Contas

### a) Screen purpose
"Ver contas/cartoes, saldos e recencia."

### b) O que funciona bem
- Saldo agora calculado por transacoes; limite e posicao liquida aparecem.
- Timestamp "Atualizado" deixa a recencia clara.

### c) Friccoes e problemas
- Origem do saldo ainda nao diferencia manual vs calculado.

### d) Propostas
- Mostrar origem do saldo (calculado vs manual) e ultimo update.

---

## AI Assistant (Chat)

### a) Screen purpose
"Perguntar sobre dados com contexto."

### b) O que existe
- Botao flutuante e modal.

### c) Friccoes e problemas
- Contexto aparece, mas IA ainda nao usa dados reais.
- Historico apenas local (sem persistencia).

### d) Propostas
- Badge "Contexto atual".

---

## AI Keywords

### a) Screen purpose
"Criar regras em lote."

### b) O que funciona bem
- Analise por confianca.

### c) Friccoes e problemas
- Sem preview de impacto antes de aplicar.
- Muito separado de Regras.

### d) Propostas
- Preview "X transacoes mudariam".
- Mover para aba de Regras (done).

---

## Notificacoes

### a) Screen purpose
"Alertar sobre uploads, limites, rituais."

### b) O que funciona bem
- UI completa com filtros e mark-as-read.

### c) Friccoes e problemas
- Sem gatilhos automaticos (uploads, rituais, metas).

### d) Propostas
- Definir eventos geradores e templates por tipo.

---

## Rituais

### a) Screen purpose
"Conduzir revisao guiada e acordos."

### b) O que funciona bem
- Stepper e estrutura.

### c) Friccoes e problemas
- Historico agora existe, falta relacionar com metas/orcamentos.

### d) Propostas
- Timeline de acordos e CTA de ajuste (done).

---

## Settings

### a) Screen purpose
"Preferencias e confianca do sistema."

### b) O que funciona bem
- Auto-confirm e threshold existem.

### c) Friccoes e problemas
- Muitos toggles sao placeholders.

### d) Propostas
- Separar "Funcional" vs "Em breve".
