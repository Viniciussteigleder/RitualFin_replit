-- =====================================================
-- RitualFin Taxonomy Seed (109 categories N1-N2-N3)
-- =====================================================
-- Generated from docs/Feedback_user/RitualFin-categorias-alias.xlsx
-- Run after: 001_complete_reset_and_schema.sql
-- =====================================================

-- Get demo user ID (create if not exists)
DO $$
DECLARE
  demo_user_id VARCHAR;
BEGIN
  SELECT id INTO demo_user_id FROM users WHERE username = 'demo';

  IF demo_user_id IS NULL THEN
    INSERT INTO users (username, password)
    VALUES ('demo', 'demo')
    RETURNING id INTO demo_user_id;
  END IF;

  -- Store in temp for use in subsequent statements
  CREATE TEMP TABLE IF NOT EXISTS temp_vars (
    var_name TEXT PRIMARY KEY,
    var_value TEXT
  );
  DELETE FROM temp_vars WHERE var_name = 'demo_user_id';
  INSERT INTO temp_vars (var_name, var_value) VALUES ('demo_user_id', demo_user_id);
END $$;


-- =====================================================
-- Level 1 Categories (Nivel_1_PT)
-- =====================================================

INSERT INTO taxonomy_level_1 (user_id, nivel_1_pt)
SELECT var_value, 'Alimentação'
FROM temp_vars WHERE var_name = 'demo_user_id'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_1 (user_id, nivel_1_pt)
SELECT var_value, 'Assinaturas'
FROM temp_vars WHERE var_name = 'demo_user_id'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_1 (user_id, nivel_1_pt)
SELECT var_value, 'Compras'
FROM temp_vars WHERE var_name = 'demo_user_id'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_1 (user_id, nivel_1_pt)
SELECT var_value, 'Doações'
FROM temp_vars WHERE var_name = 'demo_user_id'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_1 (user_id, nivel_1_pt)
SELECT var_value, 'Educação'
FROM temp_vars WHERE var_name = 'demo_user_id'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_1 (user_id, nivel_1_pt)
SELECT var_value, 'Esportes'
FROM temp_vars WHERE var_name = 'demo_user_id'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_1 (user_id, nivel_1_pt)
SELECT var_value, 'Finanças'
FROM temp_vars WHERE var_name = 'demo_user_id'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_1 (user_id, nivel_1_pt)
SELECT var_value, 'Férias'
FROM temp_vars WHERE var_name = 'demo_user_id'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_1 (user_id, nivel_1_pt)
SELECT var_value, 'Interno'
FROM temp_vars WHERE var_name = 'demo_user_id'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_1 (user_id, nivel_1_pt)
SELECT var_value, 'Lazer'
FROM temp_vars WHERE var_name = 'demo_user_id'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_1 (user_id, nivel_1_pt)
SELECT var_value, 'Mobilidade'
FROM temp_vars WHERE var_name = 'demo_user_id'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_1 (user_id, nivel_1_pt)
SELECT var_value, 'Moradia'
FROM temp_vars WHERE var_name = 'demo_user_id'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_1 (user_id, nivel_1_pt)
SELECT var_value, 'Pets'
FROM temp_vars WHERE var_name = 'demo_user_id'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_1 (user_id, nivel_1_pt)
SELECT var_value, 'Saúde'
FROM temp_vars WHERE var_name = 'demo_user_id'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_1 (user_id, nivel_1_pt)
SELECT var_value, 'Telefone'
FROM temp_vars WHERE var_name = 'demo_user_id'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_1 (user_id, nivel_1_pt)
SELECT var_value, 'Trabalho'
FROM temp_vars WHERE var_name = 'demo_user_id'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_1 (user_id, nivel_1_pt)
SELECT var_value, 'Transferências'
FROM temp_vars WHERE var_name = 'demo_user_id'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_1 (user_id, nivel_1_pt)
SELECT var_value, 'Vendas'
FROM temp_vars WHERE var_name = 'demo_user_id'
ON CONFLICT DO NOTHING;


-- =====================================================
-- Level 2 Categories (Nivel_2_PT)
-- =====================================================

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Bebidas',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Alimentação'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Padaria/Café',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Alimentação'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Restaurantes',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Alimentação'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Supermercado',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Alimentação'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Trabalho',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Alimentação'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'AI',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Assinaturas'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Apple',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Assinaturas'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Audio livro',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Assinaturas'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Google',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Assinaturas'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'MKT digital',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Assinaturas'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Streaming',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Assinaturas'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Casa',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Compras'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Higiene',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Compras'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Online',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Compras'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Presentes',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Compras'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Roupas',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Compras'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'BOG Mitglied',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Doações'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Escola',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Educação'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Kindergeld',
  'Sim',
  'Fixo',
  'Receita'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Educação'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Livros',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Educação'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Online',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Educação'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Clubes',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Esportes'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Esportes',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Esportes'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Tênis',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Esportes'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Cartões',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Finanças'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Financiamento',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Finanças'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Juros Conta negativa',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Finanças'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Saque',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Finanças'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Taxas e juros',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Finanças'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Férias Cassius',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Férias'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Férias Londres',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Férias'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Cartões',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Interno'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Eventos',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Lazer'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Jogos online',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Lazer'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Oktoberfest',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Lazer'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Presentes e festas',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Lazer'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Carro',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Mobilidade'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Transporte',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Mobilidade'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Esting',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Moradia'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Karlsruhe',
  'Sim',
  'Fixo',
  'Receita'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Moradia'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Olching',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Moradia'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Compras',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Pets'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Veterinário',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Pets'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Cabelereiro',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Saúde'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Cuidados pessoais',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Saúde'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Dentista/Ortodontia',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Saúde'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Farmácia',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Saúde'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Gastos gerais',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Saúde'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Laboratório',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Saúde'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Logopädie',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Saúde'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Médico',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Saúde'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Seguros',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Saúde'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Óculos Apollo',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Saúde'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Celular',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Telefone'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Bosch Viagem',
  'Não',
  'Variável',
  'Receita'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Trabalho'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Salário',
  'Não',
  'Variável',
  'Receita'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Trabalho'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Transferências para Brasil',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Transferências'
ON CONFLICT DO NOTHING;

INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  'Vendas online',
  'Não',
  'Variável',
  'Receita'
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = 'Vendas'
ON CONFLICT DO NOTHING;


-- =====================================================
-- Level 3 Categories (Leaves) + Rules
-- =====================================================

-- Leaf: Alimentação > Bebidas > Bebidas
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Bebidas',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Alimentação'
  AND tl2.nivel_2_pt = 'Bebidas'
ON CONFLICT DO NOTHING;

-- Leaf: Alimentação > Padaria/Café > Padaria/Café
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Padaria/Café',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Alimentação'
  AND tl2.nivel_2_pt = 'Padaria/Café'
ON CONFLICT DO NOTHING;

-- Rule for: Padaria/Café
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Padaria/Café - Auto',
  tl.leaf_id,
  'Backstube; baeckerei; Ihle; *Baeckerei Wuen; Rischarts Backhau; UZR*Backzeit AKD GmbH; Backzeit; UZR*Backzeit AKD GmbH; Backzeit; UZR*Backzeit AKD GmbH; Backzeit; UZR*Backzeit AKD GmbH; Backzeit; UZR*Backzeit AKD GmbH; Backzeit; UZR*Backzeit AKD GmbH; Backzeit; UZR*Backzeit AKD GmbH; Backzeit; UZR*Backzeit AKD GmbH; Backzeit; WUENSCHE BERGKIRCHEN',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Alimentação'
  AND tl2.nivel_2_pt = 'Padaria/Café'
  AND tl.nivel_3_pt = 'Padaria/Café'
ON CONFLICT DO NOTHING;

-- Leaf: Alimentação > Restaurantes > Restaurante
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Restaurante',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Alimentação'
  AND tl2.nivel_2_pt = 'Restaurantes'
ON CONFLICT DO NOTHING;

-- Rule for: Restaurante
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Restaurante - Auto',
  tl.leaf_id,
  'McDonalds; Pablo Emilio Burger; PIZZA HUT; Ristorante Da Umberto; Eiscafe Dolomiti; Belmondo; Hans im Tal; HEINRITZI GMBH & CO.; BOTECO BRAZILIAN RESTAU NUERNBERG; ABACCOS STEAKHOUSE; DING TEA MUENCHEN; I LOVE LEO GMBH&CO; Weintreff Zom Hasatanz; RESTAURANT; KatNi Asia',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Alimentação'
  AND tl2.nivel_2_pt = 'Restaurantes'
  AND tl.nivel_3_pt = 'Restaurante'
ON CONFLICT DO NOTHING;

-- Leaf: Alimentação > Supermercado > ALDI
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'ALDI',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Alimentação'
  AND tl2.nivel_2_pt = 'Supermercado'
ON CONFLICT DO NOTHING;

-- Rule for: ALDI
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'ALDI - Auto',
  tl.leaf_id,
  'ALDI',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Alimentação'
  AND tl2.nivel_2_pt = 'Supermercado'
  AND tl.nivel_3_pt = 'ALDI'
ON CONFLICT DO NOTHING;

-- Leaf: Alimentação > Supermercado > EDEKA
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'EDEKA',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Alimentação'
  AND tl2.nivel_2_pt = 'Supermercado'
ON CONFLICT DO NOTHING;

-- Rule for: EDEKA
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'EDEKA - Auto',
  tl.leaf_id,
  'EDEKA',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Alimentação'
  AND tl2.nivel_2_pt = 'Supermercado'
  AND tl.nivel_3_pt = 'EDEKA'
ON CONFLICT DO NOTHING;

-- Leaf: Alimentação > Supermercado > LIDL
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'LIDL',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Alimentação'
  AND tl2.nivel_2_pt = 'Supermercado'
ON CONFLICT DO NOTHING;

-- Rule for: LIDL
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'LIDL - Auto',
  tl.leaf_id,
  'LIDL',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Alimentação'
  AND tl2.nivel_2_pt = 'Supermercado'
  AND tl.nivel_3_pt = 'LIDL'
ON CONFLICT DO NOTHING;

-- Leaf: Alimentação > Supermercado > NETTO
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'NETTO',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Alimentação'
  AND tl2.nivel_2_pt = 'Supermercado'
ON CONFLICT DO NOTHING;

-- Rule for: NETTO
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'NETTO - Auto',
  tl.leaf_id,
  'NETTO',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Alimentação'
  AND tl2.nivel_2_pt = 'Supermercado'
  AND tl.nivel_3_pt = 'NETTO'
ON CONFLICT DO NOTHING;

-- Leaf: Alimentação > Supermercado > Outros mercados
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Outros mercados',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Alimentação'
  AND tl2.nivel_2_pt = 'Supermercado'
ON CONFLICT DO NOTHING;

-- Rule for: Outros mercados
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Outros mercados - Auto',
  tl.leaf_id,
  'MADE IN PORTUGAL//MUENCHEN/DE; Norma; Asia Markt',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Alimentação'
  AND tl2.nivel_2_pt = 'Supermercado'
  AND tl.nivel_3_pt = 'Outros mercados'
ON CONFLICT DO NOTHING;

-- Leaf: Alimentação > Supermercado > REWE
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'REWE',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Alimentação'
  AND tl2.nivel_2_pt = 'Supermercado'
ON CONFLICT DO NOTHING;

-- Rule for: REWE
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'REWE - Auto',
  tl.leaf_id,
  'REWE',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Alimentação'
  AND tl2.nivel_2_pt = 'Supermercado'
  AND tl.nivel_3_pt = 'REWE'
ON CONFLICT DO NOTHING;

-- Leaf: Alimentação > Trabalho > Almoço Bosch
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Almoço Bosch',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Alimentação'
  AND tl2.nivel_2_pt = 'Trabalho'
ON CONFLICT DO NOTHING;

-- Rule for: Almoço Bosch
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Almoço Bosch - Auto',
  tl.leaf_id,
  'FRUCHTWERK E.K.',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Alimentação'
  AND tl2.nivel_2_pt = 'Trabalho'
  AND tl.nivel_3_pt = 'Almoço Bosch'
ON CONFLICT DO NOTHING;

-- Leaf: Assinaturas > AI > ChatGPT
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'ChatGPT',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Assinaturas'
  AND tl2.nivel_2_pt = 'AI'
ON CONFLICT DO NOTHING;

-- Rule for: ChatGPT
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'ChatGPT - Auto',
  tl.leaf_id,
  'OPENAI *CHATGPT SUBSCR',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Assinaturas'
  AND tl2.nivel_2_pt = 'AI'
  AND tl.nivel_3_pt = 'ChatGPT'
ON CONFLICT DO NOTHING;

-- Leaf: Assinaturas > AI > Claude.ai
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Claude.ai',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Assinaturas'
  AND tl2.nivel_2_pt = 'AI'
ON CONFLICT DO NOTHING;

-- Rule for: Claude.ai
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Claude.ai - Auto',
  tl.leaf_id,
  'Claude',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Assinaturas'
  AND tl2.nivel_2_pt = 'AI'
  AND tl.nivel_3_pt = 'Claude.ai'
ON CONFLICT DO NOTHING;

-- Leaf: Assinaturas > AI > ElevenLabs
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'ElevenLabs',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Assinaturas'
  AND tl2.nivel_2_pt = 'AI'
ON CONFLICT DO NOTHING;

-- Rule for: ElevenLabs
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'ElevenLabs - Auto',
  tl.leaf_id,
  'ElevenLabs',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Assinaturas'
  AND tl2.nivel_2_pt = 'AI'
  AND tl.nivel_3_pt = 'ElevenLabs'
ON CONFLICT DO NOTHING;

-- Leaf: Assinaturas > AI > Replit
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Replit',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Assinaturas'
  AND tl2.nivel_2_pt = 'AI'
ON CONFLICT DO NOTHING;

-- Rule for: Replit
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Replit - Auto',
  tl.leaf_id,
  'Replit',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Assinaturas'
  AND tl2.nivel_2_pt = 'AI'
  AND tl.nivel_3_pt = 'Replit'
ON CONFLICT DO NOTHING;

-- Leaf: Assinaturas > Apple > Apple iCloud/App Store
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Apple iCloud/App Store',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Assinaturas'
  AND tl2.nivel_2_pt = 'Apple'
ON CONFLICT DO NOTHING;

-- Rule for: Apple iCloud/App Store
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Apple iCloud/App Store - Auto',
  tl.leaf_id,
  'APPLE.COM/BILL',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Assinaturas'
  AND tl2.nivel_2_pt = 'Apple'
  AND tl.nivel_3_pt = 'Apple iCloud/App Store'
ON CONFLICT DO NOTHING;

-- Leaf: Assinaturas > Audio livro > Audiable
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Audiable',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Assinaturas'
  AND tl2.nivel_2_pt = 'Audio livro'
ON CONFLICT DO NOTHING;

-- Rule for: Audiable
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Audiable - Auto',
  tl.leaf_id,
  'AUDIBLE GMBH',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Assinaturas'
  AND tl2.nivel_2_pt = 'Audio livro'
  AND tl.nivel_3_pt = 'Audiable'
ON CONFLICT DO NOTHING;

-- Leaf: Assinaturas > Google > Google One
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Google One',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Assinaturas'
  AND tl2.nivel_2_pt = 'Google'
ON CONFLICT DO NOTHING;

-- Rule for: Google One
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Google One - Auto',
  tl.leaf_id,
  'GOOGLE*GOOGLE ONE -- -9.99; GOOGLE*GOOGLE ONE ; GOOGLE*GOOGLE ONE',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Assinaturas'
  AND tl2.nivel_2_pt = 'Google'
  AND tl.nivel_3_pt = 'Google One'
ON CONFLICT DO NOTHING;

-- Leaf: Assinaturas > MKT digital > Active Campaign
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Active Campaign',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Assinaturas'
  AND tl2.nivel_2_pt = 'MKT digital'
ON CONFLICT DO NOTHING;

-- Rule for: Active Campaign
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Active Campaign - Auto',
  tl.leaf_id,
  'EBN *ACTIVECAMP -- -9.92; ACTIVECAMP',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Assinaturas'
  AND tl2.nivel_2_pt = 'MKT digital'
  AND tl.nivel_3_pt = 'Active Campaign'
ON CONFLICT DO NOTHING;

-- Leaf: Assinaturas > Streaming > Disney+
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Disney+',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Assinaturas'
  AND tl2.nivel_2_pt = 'Streaming'
ON CONFLICT DO NOTHING;

-- Rule for: Disney+
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Disney+ - Auto',
  tl.leaf_id,
  'Disney',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Assinaturas'
  AND tl2.nivel_2_pt = 'Streaming'
  AND tl.nivel_3_pt = 'Disney+'
ON CONFLICT DO NOTHING;

-- Leaf: Assinaturas > Streaming > Netflix
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Netflix',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Assinaturas'
  AND tl2.nivel_2_pt = 'Streaming'
ON CONFLICT DO NOTHING;

-- Rule for: Netflix
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Netflix - Auto',
  tl.leaf_id,
  'NETFLIX',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Assinaturas'
  AND tl2.nivel_2_pt = 'Streaming'
  AND tl.nivel_3_pt = 'Netflix'
ON CONFLICT DO NOTHING;

-- Leaf: Assinaturas > Streaming > Paramount Plus
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Paramount Plus',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Assinaturas'
  AND tl2.nivel_2_pt = 'Streaming'
ON CONFLICT DO NOTHING;

-- Rule for: Paramount Plus
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Paramount Plus - Auto',
  tl.leaf_id,
  'PARAMOUNT+',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Assinaturas'
  AND tl2.nivel_2_pt = 'Streaming'
  AND tl.nivel_3_pt = 'Paramount Plus'
ON CONFLICT DO NOTHING;

-- Leaf: Assinaturas > Streaming > YouTube Premium
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'YouTube Premium',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Assinaturas'
  AND tl2.nivel_2_pt = 'Streaming'
ON CONFLICT DO NOTHING;

-- Leaf: Compras > Casa > Decoração
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Decoração',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Compras'
  AND tl2.nivel_2_pt = 'Casa'
ON CONFLICT DO NOTHING;

-- Rule for: Decoração
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Decoração - Auto',
  tl.leaf_id,
  'JYSK SE',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Compras'
  AND tl2.nivel_2_pt = 'Casa'
  AND tl.nivel_3_pt = 'Decoração'
ON CONFLICT DO NOTHING;

-- Leaf: Compras > Casa > Eletrodomésticos
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Eletrodomésticos',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Compras'
  AND tl2.nivel_2_pt = 'Casa'
ON CONFLICT DO NOTHING;

-- Rule for: Eletrodomésticos
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Eletrodomésticos - Auto',
  tl.leaf_id,
  'Saturn; Mediamarkt',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Compras'
  AND tl2.nivel_2_pt = 'Casa'
  AND tl.nivel_3_pt = 'Eletrodomésticos'
ON CONFLICT DO NOTHING;

-- Leaf: Compras > Casa > Móveis
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Móveis',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Compras'
  AND tl2.nivel_2_pt = 'Casa'
ON CONFLICT DO NOTHING;

-- Rule for: Móveis
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Móveis - Auto',
  tl.leaf_id,
  'ikea; MOEMAX',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Compras'
  AND tl2.nivel_2_pt = 'Casa'
  AND tl.nivel_3_pt = 'Móveis'
ON CONFLICT DO NOTHING;

-- Leaf: Compras > Casa > TEDI
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'TEDI',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Compras'
  AND tl2.nivel_2_pt = 'Casa'
ON CONFLICT DO NOTHING;

-- Rule for: TEDI
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'TEDI - Auto',
  tl.leaf_id,
  'TEDI',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Compras'
  AND tl2.nivel_2_pt = 'Casa'
  AND tl.nivel_3_pt = 'TEDI'
ON CONFLICT DO NOTHING;

-- Leaf: Compras > Higiene > DM
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'DM',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Compras'
  AND tl2.nivel_2_pt = 'Higiene'
ON CONFLICT DO NOTHING;

-- Rule for: DM
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'DM - Auto',
  tl.leaf_id,
  'DM Drogerie; DM-DROGERIE MARKT',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Compras'
  AND tl2.nivel_2_pt = 'Higiene'
  AND tl.nivel_3_pt = 'DM'
ON CONFLICT DO NOTHING;

-- Leaf: Compras > Higiene > Müller
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Müller',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Compras'
  AND tl2.nivel_2_pt = 'Higiene'
ON CONFLICT DO NOTHING;

-- Rule for: Müller
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Müller - Auto',
  tl.leaf_id,
  'MUELLER MH HANDELS GMB; MUeLLER OLCHING 1-1 E; MUELLER 1500',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Compras'
  AND tl2.nivel_2_pt = 'Higiene'
  AND tl.nivel_3_pt = 'Müller'
ON CONFLICT DO NOTHING;

-- Leaf: Compras > Higiene > Rossmann
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Rossmann',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Compras'
  AND tl2.nivel_2_pt = 'Higiene'
ON CONFLICT DO NOTHING;

-- Rule for: Rossmann
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Rossmann - Auto',
  tl.leaf_id,
  'rossmann',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Compras'
  AND tl2.nivel_2_pt = 'Higiene'
  AND tl.nivel_3_pt = 'Rossmann'
ON CONFLICT DO NOTHING;

-- Leaf: Compras > Online > Amazon
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Amazon',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Compras'
  AND tl2.nivel_2_pt = 'Online'
ON CONFLICT DO NOTHING;

-- Rule for: Amazon
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Amazon - Auto',
  tl.leaf_id,
  'AMAZON; AMZN; AMZ*;',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Compras'
  AND tl2.nivel_2_pt = 'Online'
  AND tl.nivel_3_pt = 'Amazon'
ON CONFLICT DO NOTHING;

-- Leaf: Compras > Online > PayPal compras
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'PayPal compras',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Compras'
  AND tl2.nivel_2_pt = 'Online'
ON CONFLICT DO NOTHING;

-- Leaf: Compras > Online > Temu
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Temu',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Compras'
  AND tl2.nivel_2_pt = 'Online'
ON CONFLICT DO NOTHING;

-- Rule for: Temu
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Temu - Auto',
  tl.leaf_id,
  'TEMU.COM DUBLIN 2; TEMU.COM',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Compras'
  AND tl2.nivel_2_pt = 'Online'
  AND tl.nivel_3_pt = 'Temu'
ON CONFLICT DO NOTHING;

-- Leaf: Compras > Presentes > Geral
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Geral',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Compras'
  AND tl2.nivel_2_pt = 'Presentes'
ON CONFLICT DO NOTHING;

-- Leaf: Compras > Roupas > Roupas geral
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Roupas geral',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Compras'
  AND tl2.nivel_2_pt = 'Roupas'
ON CONFLICT DO NOTHING;

-- Rule for: Roupas geral
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Roupas geral - Auto',
  tl.leaf_id,
  'ZALANDO; DECATHLON; ABOUT YOU; HM.COM HAMBURG; DEICHMANN SE 1129 GROEBENZELL; Zara; H&M; ABOUT YOU; DECATHLON Deutschland',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Compras'
  AND tl2.nivel_2_pt = 'Roupas'
  AND tl.nivel_3_pt = 'Roupas geral'
ON CONFLICT DO NOTHING;

-- Leaf: Doações > BOG Mitglied > BOG Mitglied
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'BOG Mitglied',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Doações'
  AND tl2.nivel_2_pt = 'BOG Mitglied'
ON CONFLICT DO NOTHING;

-- Rule for: BOG Mitglied
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'BOG Mitglied - Auto',
  tl.leaf_id,
  'Mitgliedsbeitrag 2024 f r Erica und Vinicius Steiglede; Bruederlichkeit ohne Grenzen e.V.--Mitgliedsbeitrag 2025; Bruederlichkeit ohne Grenzen e.V. -- Mitgliedsbeitrag; PAYPAL *BRUEDERLICH 4029357733',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Doações'
  AND tl2.nivel_2_pt = 'BOG Mitglied'
  AND tl.nivel_3_pt = 'BOG Mitglied'
ON CONFLICT DO NOTHING;

-- Leaf: Educação > Escola > Gymnasium Olching
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Gymnasium Olching',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Educação'
  AND tl2.nivel_2_pt = 'Escola'
ON CONFLICT DO NOTHING;

-- Rule for: Gymnasium Olching
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Gymnasium Olching - Auto',
  tl.leaf_id,
  'Gymnasium Olching',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Educação'
  AND tl2.nivel_2_pt = 'Escola'
  AND tl.nivel_3_pt = 'Gymnasium Olching'
ON CONFLICT DO NOTHING;

-- Leaf: Educação > Kindergeld > Kindergeld
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Kindergeld',
  'Sim',
  'Fixo',
  'Receita'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Educação'
  AND tl2.nivel_2_pt = 'Kindergeld'
ON CONFLICT DO NOTHING;

-- Rule for: Kindergeld
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Kindergeld - Auto',
  tl.leaf_id,
  'Arbeit - Familien kasse; Bundesagentur',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Educação'
  AND tl2.nivel_2_pt = 'Kindergeld'
  AND tl.nivel_3_pt = 'Kindergeld'
ON CONFLICT DO NOTHING;

-- Leaf: Educação > Livros > Livros
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Livros',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Educação'
  AND tl2.nivel_2_pt = 'Livros'
ON CONFLICT DO NOTHING;

-- Rule for: Livros
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Livros - Auto',
  tl.leaf_id,
  'DANKE DER BUCHLADEN',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Educação'
  AND tl2.nivel_2_pt = 'Livros'
  AND tl.nivel_3_pt = 'Livros'
ON CONFLICT DO NOTHING;

-- Leaf: Educação > Online > Online Schülerhilfe
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Online Schülerhilfe',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Educação'
  AND tl2.nivel_2_pt = 'Online'
ON CONFLICT DO NOTHING;

-- Rule for: Online Schülerhilfe
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Online Schülerhilfe - Auto',
  tl.leaf_id,
  'SCHULHILFEV',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Educação'
  AND tl2.nivel_2_pt = 'Online'
  AND tl.nivel_3_pt = 'Online Schülerhilfe'
ON CONFLICT DO NOTHING;

-- Leaf: Esportes > Clubes > Floorball - ...
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Floorball - ...',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Esportes'
  AND tl2.nivel_2_pt = 'Clubes'
ON CONFLICT DO NOTHING;

-- Leaf: Esportes > Clubes > Natação
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Natação',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Esportes'
  AND tl2.nivel_2_pt = 'Clubes'
ON CONFLICT DO NOTHING;

-- Rule for: Natação
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Natação - Auto',
  tl.leaf_id,
  'SV Fuerstenfeldbrucker Wasserratten e.V.; Schwimmverein',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Esportes'
  AND tl2.nivel_2_pt = 'Clubes'
  AND tl.nivel_3_pt = 'Natação'
ON CONFLICT DO NOTHING;

-- Leaf: Esportes > Clubes > Tennis Verein
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Tennis Verein',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Esportes'
  AND tl2.nivel_2_pt = 'Clubes'
ON CONFLICT DO NOTHING;

-- Rule for: Tennis Verein
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Tennis Verein - Auto',
  tl.leaf_id,
  'Tennisclub Edelweiss Groebenzell e.V.',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Esportes'
  AND tl2.nivel_2_pt = 'Clubes'
  AND tl.nivel_3_pt = 'Tennis Verein'
ON CONFLICT DO NOTHING;

-- Leaf: Esportes > Esportes > BJJ
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'BJJ',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Esportes'
  AND tl2.nivel_2_pt = 'Esportes'
ON CONFLICT DO NOTHING;

-- Rule for: BJJ
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'BJJ - Auto',
  tl.leaf_id,
  'BJJ Ausbildung Dachau; BJJ EVENT',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Esportes'
  AND tl2.nivel_2_pt = 'Esportes'
  AND tl.nivel_3_pt = 'BJJ'
ON CONFLICT DO NOTHING;

-- Leaf: Esportes > Esportes > CleverFit Fitness
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'CleverFit Fitness',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Esportes'
  AND tl2.nivel_2_pt = 'Esportes'
ON CONFLICT DO NOTHING;

-- Rule for: CleverFit Fitness
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'CleverFit Fitness - Auto',
  tl.leaf_id,
  'OLC--0157-0000631 OLC-2637639; OLC-2637639; OLC--0157-0000373 OLC-2428106 RED LABEL; OLC-2428106 RED LABEL; OLC--0156-0000276 OLC-2637461 RED LABEL; OLC-2637461 RED LABEL',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Esportes'
  AND tl2.nivel_2_pt = 'Esportes'
  AND tl.nivel_3_pt = 'CleverFit Fitness'
ON CONFLICT DO NOTHING;

-- Leaf: Esportes > Tênis > Tennis Kids
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Tennis Kids',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Esportes'
  AND tl2.nivel_2_pt = 'Tênis'
ON CONFLICT DO NOTHING;

-- Rule for: Tennis Kids
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Tennis Kids - Auto',
  tl.leaf_id,
  'Georgi Kranchev; Tanja Mayr',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Esportes'
  AND tl2.nivel_2_pt = 'Tênis'
  AND tl.nivel_3_pt = 'Tennis Kids'
ON CONFLICT DO NOTHING;

-- Leaf: Férias > Férias Cassius > Férias Vista Cassius
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Férias Vista Cassius',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Férias'
  AND tl2.nivel_2_pt = 'Férias Cassius'
ON CONFLICT DO NOTHING;

-- Rule for: Férias Vista Cassius
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Férias Vista Cassius - Auto',
  tl.leaf_id,
  'Wolfsschlucht Pruem mbH',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Férias'
  AND tl2.nivel_2_pt = 'Férias Cassius'
  AND tl.nivel_3_pt = 'Férias Vista Cassius'
ON CONFLICT DO NOTHING;

-- Leaf: Férias > Férias Londres > Férias Londres
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Férias Londres',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Férias'
  AND tl2.nivel_2_pt = 'Férias Londres'
ON CONFLICT DO NOTHING;

-- Rule for: Férias Londres
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Férias Londres - Auto',
  tl.leaf_id,
  'THISTLEMARBLE LONDON; Flugstrecke:Von: MEMMINGEN Nach: LONDON;ENGLAND UK Fluglinie:; WARNER BROS WARNER BROS UNITED KINGDOM',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Férias'
  AND tl2.nivel_2_pt = 'Férias Londres'
  AND tl.nivel_3_pt = 'Férias Londres'
ON CONFLICT DO NOTHING;

-- Leaf: Finanças > Cartões > Juros Amex
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Juros Amex',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Finanças'
  AND tl2.nivel_2_pt = 'Cartões'
ON CONFLICT DO NOTHING;

-- Rule for: Juros Amex
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Juros Amex - Auto',
  tl.leaf_id,
  'ZINSBELASTUNG',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Finanças'
  AND tl2.nivel_2_pt = 'Cartões'
  AND tl.nivel_3_pt = 'Juros Amex'
ON CONFLICT DO NOTHING;

-- Leaf: Finanças > Cartões > Juros M&M
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Juros M&M',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Finanças'
  AND tl2.nivel_2_pt = 'Cartões'
ON CONFLICT DO NOTHING;

-- Rule for: Juros M&M
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Juros M&M - Auto',
  tl.leaf_id,
  '1,95% für Währungsumrechn',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Finanças'
  AND tl2.nivel_2_pt = 'Cartões'
  AND tl.nivel_3_pt = 'Juros M&M'
ON CONFLICT DO NOTHING;

-- Leaf: Finanças > Cartões > Miles & More Mensalidade
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Miles & More Mensalidade',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Finanças'
  AND tl2.nivel_2_pt = 'Cartões'
ON CONFLICT DO NOTHING;

-- Rule for: Miles & More Mensalidade
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Miles & More Mensalidade - Auto',
  tl.leaf_id,
  'monatlicher Kartenpreis',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Finanças'
  AND tl2.nivel_2_pt = 'Cartões'
  AND tl.nivel_3_pt = 'Miles & More Mensalidade'
ON CONFLICT DO NOTHING;

-- Leaf: Finanças > Financiamento > Apollo Optik parcelado
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Apollo Optik parcelado',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Finanças'
  AND tl2.nivel_2_pt = 'Financiamento'
ON CONFLICT DO NOTHING;

-- Rule for: Apollo Optik parcelado
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Apollo Optik parcelado - Auto',
  tl.leaf_id,
  'CC28K3RBB78RKBG6; Apollo-Optik Holding GmbH ? Co. KG DP25-00125921; Apollo-Optik Holding GmbH ? Co. KG; DE52100190001000027873',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Finanças'
  AND tl2.nivel_2_pt = 'Financiamento'
  AND tl.nivel_3_pt = 'Apollo Optik parcelado'
ON CONFLICT DO NOTHING;

-- Leaf: Finanças > Financiamento > Diba Financiamento
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Diba Financiamento',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Finanças'
  AND tl2.nivel_2_pt = 'Financiamento'
ON CONFLICT DO NOTHING;

-- Rule for: Diba Financiamento
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Diba Financiamento - Auto',
  tl.leaf_id,
  'ING-DIBA AG 5328937129',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Finanças'
  AND tl2.nivel_2_pt = 'Financiamento'
  AND tl.nivel_3_pt = 'Diba Financiamento'
ON CONFLICT DO NOTHING;

-- Leaf: Finanças > Financiamento > Diba Rahmenkredit
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Diba Rahmenkredit',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Finanças'
  AND tl2.nivel_2_pt = 'Financiamento'
ON CONFLICT DO NOTHING;

-- Rule for: Diba Rahmenkredit
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Diba Rahmenkredit - Auto',
  tl.leaf_id,
  'Rahmenkredit komplett abbezaht; DE12500105175705720690; Rahmenkredit; 5705720690.KKRATKR.01.002.142920',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Finanças'
  AND tl2.nivel_2_pt = 'Financiamento'
  AND tl.nivel_3_pt = 'Diba Rahmenkredit'
ON CONFLICT DO NOTHING;

-- Leaf: Finanças > Financiamento > Empréstimo Targobank
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Empréstimo Targobank',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Finanças'
  AND tl2.nivel_2_pt = 'Financiamento'
ON CONFLICT DO NOTHING;

-- Rule for: Empréstimo Targobank
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Empréstimo Targobank - Auto',
  tl.leaf_id,
  '00007285400453 VINICIUS STEIGLEDER VIELEN DANK IHRE TARGOBANK',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Finanças'
  AND tl2.nivel_2_pt = 'Financiamento'
  AND tl.nivel_3_pt = 'Empréstimo Targobank'
ON CONFLICT DO NOTHING;

-- Leaf: Finanças > Juros Conta negativa > Juros Sparkasse
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Juros Sparkasse',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Finanças'
  AND tl2.nivel_2_pt = 'Juros Conta negativa'
ON CONFLICT DO NOTHING;

-- Rule for: Juros Sparkasse
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Juros Sparkasse - Auto',
  tl.leaf_id,
  'ABSCHLUSS -- 0000000000 -- Sparkasse',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Finanças'
  AND tl2.nivel_2_pt = 'Juros Conta negativa'
  AND tl.nivel_3_pt = 'Juros Sparkasse'
ON CONFLICT DO NOTHING;

-- Leaf: Finanças > Saque > Saque
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Saque',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Finanças'
  AND tl2.nivel_2_pt = 'Saque'
ON CONFLICT DO NOTHING;

-- Rule for: Saque
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Saque - Auto',
  tl.leaf_id,
  'BARGELDAUSZAHLUNG -- DE66700530709000481409; GELDAUTOMAT; BARGELDAUSZAHLUNG',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Finanças'
  AND tl2.nivel_2_pt = 'Saque'
  AND tl.nivel_3_pt = 'Saque'
ON CONFLICT DO NOTHING;

-- Leaf: Finanças > Taxas e juros > Juros/câmbio
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Juros/câmbio',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Finanças'
  AND tl2.nivel_2_pt = 'Taxas e juros'
ON CONFLICT DO NOTHING;

-- Rule for: Juros/câmbio
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Juros/câmbio - Auto',
  tl.leaf_id,
  '1,95% für Währungsumrechn',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Finanças'
  AND tl2.nivel_2_pt = 'Taxas e juros'
  AND tl.nivel_3_pt = 'Juros/câmbio'
ON CONFLICT DO NOTHING;

-- Leaf: Finanças > Taxas e juros > Taxas Sparkasse
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Taxas Sparkasse',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Finanças'
  AND tl2.nivel_2_pt = 'Taxas e juros'
ON CONFLICT DO NOTHING;

-- Rule for: Taxas Sparkasse
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Taxas Sparkasse - Auto',
  tl.leaf_id,
  'ENTGELTABSCHLUSS',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Finanças'
  AND tl2.nivel_2_pt = 'Taxas e juros'
  AND tl.nivel_3_pt = 'Taxas Sparkasse'
ON CONFLICT DO NOTHING;

-- Leaf: Interno > Cartões > Amex fatura/pagamento
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Amex fatura/pagamento',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Interno'
  AND tl2.nivel_2_pt = 'Cartões'
ON CONFLICT DO NOTHING;

-- Rule for: Amex fatura/pagamento
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Amex fatura/pagamento - Auto',
  tl.leaf_id,
  'pagamento Amex; AMERICAN EXPRESS; Amex - RETOURNIERTE LASTSCHRIFT; Amex - ZAHLUNG ERHALTEN. BESTEN DANK.',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Interno'
  AND tl2.nivel_2_pt = 'Cartões'
  AND tl.nivel_3_pt = 'Amex fatura/pagamento'
ON CONFLICT DO NOTHING;

-- Leaf: Interno > Cartões > Miles & More fatura/pagamento
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Miles & More fatura/pagamento',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Interno'
  AND tl2.nivel_2_pt = 'Cartões'
ON CONFLICT DO NOTHING;

-- Rule for: Miles & More fatura/pagamento
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Miles & More fatura/pagamento - Auto',
  tl.leaf_id,
  'pagamento M&M; DEUTSCHE KREDITBANK AKTIENGESELLSCHAFT',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Interno'
  AND tl2.nivel_2_pt = 'Cartões'
  AND tl.nivel_3_pt = 'Miles & More fatura/pagamento'
ON CONFLICT DO NOTHING;

-- Leaf: Interno > Cartões > Sparkasse pagamento
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Sparkasse pagamento',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Interno'
  AND tl2.nivel_2_pt = 'Cartões'
ON CONFLICT DO NOTHING;

-- Rule for: Sparkasse pagamento
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Sparkasse pagamento - Auto',
  tl.leaf_id,
  'pagamento Sparkasse; pagamento cartao de credito Amex;',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Interno'
  AND tl2.nivel_2_pt = 'Cartões'
  AND tl.nivel_3_pt = 'Sparkasse pagamento'
ON CONFLICT DO NOTHING;

-- Leaf: Lazer > Eventos > Ingressos
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Ingressos',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Lazer'
  AND tl2.nivel_2_pt = 'Eventos'
ON CONFLICT DO NOTHING;

-- Leaf: Lazer > Eventos > Lazer geral
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Lazer geral',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Lazer'
  AND tl2.nivel_2_pt = 'Eventos'
ON CONFLICT DO NOTHING;

-- Leaf: Lazer > Jogos online > Jogos - David
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Jogos - David',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Lazer'
  AND tl2.nivel_2_pt = 'Jogos online'
ON CONFLICT DO NOTHING;

-- Rule for: Jogos - David
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Jogos - David - Auto',
  tl.leaf_id,
  'ROBLOX.COM 18888582569 SAN MATEO',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Lazer'
  AND tl2.nivel_2_pt = 'Jogos online'
  AND tl.nivel_3_pt = 'Jogos - David'
ON CONFLICT DO NOTHING;

-- Leaf: Lazer > Oktoberfest > Oktoberfest
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Oktoberfest',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Lazer'
  AND tl2.nivel_2_pt = 'Oktoberfest'
ON CONFLICT DO NOTHING;

-- Rule for: Oktoberfest
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Oktoberfest - Auto',
  tl.leaf_id,
  'Oktoberfest',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Lazer'
  AND tl2.nivel_2_pt = 'Oktoberfest'
  AND tl.nivel_3_pt = 'Oktoberfest'
ON CONFLICT DO NOTHING;

-- Leaf: Lazer > Presentes e festas > Festa de Aniver David
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Festa de Aniver David',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Lazer'
  AND tl2.nivel_2_pt = 'Presentes e festas'
ON CONFLICT DO NOTHING;

-- Rule for: Festa de Aniver David
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Festa de Aniver David - Auto',
  tl.leaf_id,
  'UZR*FunZone',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Lazer'
  AND tl2.nivel_2_pt = 'Presentes e festas'
  AND tl.nivel_3_pt = 'Festa de Aniver David'
ON CONFLICT DO NOTHING;

-- Leaf: Mobilidade > Carro > Combustível
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Combustível',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Mobilidade'
  AND tl2.nivel_2_pt = 'Carro'
ON CONFLICT DO NOTHING;

-- Rule for: Combustível
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Combustível - Auto',
  tl.leaf_id,
  'Tankstelle; ALLGUTH',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Mobilidade'
  AND tl2.nivel_2_pt = 'Carro'
  AND tl.nivel_3_pt = 'Combustível'
ON CONFLICT DO NOTHING;

-- Leaf: Mobilidade > Carro > Estacionamento
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Estacionamento',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Mobilidade'
  AND tl2.nivel_2_pt = 'Carro'
ON CONFLICT DO NOTHING;

-- Rule for: Estacionamento
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Estacionamento - Auto',
  tl.leaf_id,
  'Parkhaus; HandyParken Muenchen; Parkgaragen; PBW PG KRIEGSBERGSTR.; Parkgarage; PARKEN OLYMPIA',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Mobilidade'
  AND tl2.nivel_2_pt = 'Carro'
  AND tl.nivel_3_pt = 'Estacionamento'
ON CONFLICT DO NOTHING;

-- Leaf: Mobilidade > Carro > Multas/Infrações
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Multas/Infrações',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Mobilidade'
  AND tl2.nivel_2_pt = 'Carro'
ON CONFLICT DO NOTHING;

-- Rule for: Multas/Infrações
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Multas/Infrações - Auto',
  tl.leaf_id,
  'Stadt Mannheim',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Mobilidade'
  AND tl2.nivel_2_pt = 'Carro'
  AND tl.nivel_3_pt = 'Multas/Infrações'
ON CONFLICT DO NOTHING;

-- Leaf: Mobilidade > Carro > Seguro
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Seguro',
  'Não',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Mobilidade'
  AND tl2.nivel_2_pt = 'Carro'
ON CONFLICT DO NOTHING;

-- Rule for: Seguro
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Seguro - Auto',
  tl.leaf_id,
  'Kfz-Versicherung Nr 870711522 fuerIhr Fahrzeug mit dem Kennzeichen FFB FA 317; KFZ0047667216',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Mobilidade'
  AND tl2.nivel_2_pt = 'Carro'
  AND tl.nivel_3_pt = 'Seguro'
ON CONFLICT DO NOTHING;

-- Leaf: Mobilidade > Transporte > MVV / Bus / Trem
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'MVV / Bus / Trem',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Mobilidade'
  AND tl2.nivel_2_pt = 'Transporte'
ON CONFLICT DO NOTHING;

-- Rule for: MVV / Bus / Trem
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'MVV / Bus / Trem - Auto',
  tl.leaf_id,
  'MVV TICKETSHOP LOGPAY VOI DE',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Mobilidade'
  AND tl2.nivel_2_pt = 'Transporte'
  AND tl.nivel_3_pt = 'MVV / Bus / Trem'
ON CONFLICT DO NOTHING;

-- Leaf: Moradia > Esting > Financiamento
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Financiamento',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Esting'
ON CONFLICT DO NOTHING;

-- Rule for: Financiamento
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Financiamento - Auto',
  tl.leaf_id,
  '7060327031D660501010022518260 DARLEHENSABSCHLUSS IBAN DE20701694600020137367; R + V LEBENSVERSICHERUNG AKTIENGESELLSCHAFT',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Esting'
  AND tl.nivel_3_pt = 'Financiamento'
ON CONFLICT DO NOTHING;

-- Leaf: Moradia > Esting > Haus Esting - NK Grundstück
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Haus Esting - NK Grundstück',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Esting'
ON CONFLICT DO NOTHING;

-- Rule for: Haus Esting - NK Grundstück
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Haus Esting - NK Grundstück - Auto',
  tl.leaf_id,
  'Haushaltsstelle:06001/10000/Steigleder; AGF Immobilien und Services GmbH',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Esting'
  AND tl.nivel_3_pt = 'Haus Esting - NK Grundstück'
ON CONFLICT DO NOTHING;

-- Leaf: Moradia > Esting > Manutenção
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Manutenção',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Esting'
ON CONFLICT DO NOTHING;

-- Leaf: Moradia > Esting > Materiais e obras
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Materiais e obras',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Esting'
ON CONFLICT DO NOTHING;

-- Leaf: Moradia > Esting > Serviços
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Serviços',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Esting'
ON CONFLICT DO NOTHING;

-- Leaf: Moradia > Esting > Utilidades
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Utilidades',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Esting'
ON CONFLICT DO NOTHING;

-- Leaf: Moradia > Karlsruhe > Aluguel recebido
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Aluguel recebido',
  'Sim',
  'Fixo',
  'Receita'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Karlsruhe'
ON CONFLICT DO NOTHING;

-- Rule for: Aluguel recebido
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Aluguel recebido - Auto',
  tl.leaf_id,
  'Miete incl. Nebenkosten',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Karlsruhe'
  AND tl.nivel_3_pt = 'Aluguel recebido'
ON CONFLICT DO NOTHING;

-- Leaf: Moradia > Karlsruhe > Aquecimento/Fernwärme
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Aquecimento/Fernwärme',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Karlsruhe'
ON CONFLICT DO NOTHING;

-- Rule for: Aquecimento/Fernwärme
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Aquecimento/Fernwärme - Auto',
  tl.leaf_id,
  'Vertragsnr 250014203; V 2004774510-BEL400000778120-VK250014203',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Karlsruhe'
  AND tl.nivel_3_pt = 'Aquecimento/Fernwärme'
ON CONFLICT DO NOTHING;

-- Leaf: Moradia > Karlsruhe > Energia/Água
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Energia/Água',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Karlsruhe'
ON CONFLICT DO NOTHING;

-- Rule for: Energia/Água
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Energia/Água - Auto',
  tl.leaf_id,
  'Vertragskonto 210672822',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Karlsruhe'
  AND tl.nivel_3_pt = 'Energia/Água'
ON CONFLICT DO NOTHING;

-- Leaf: Moradia > Karlsruhe > Financiamento
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Financiamento',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Karlsruhe'
ON CONFLICT DO NOTHING;

-- Rule for: Financiamento
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Financiamento - Auto',
  tl.leaf_id,
  '31440560102023; 31432225842024; AZ 7545532023; AZ 7545532014',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Karlsruhe'
  AND tl.nivel_3_pt = 'Financiamento'
ON CONFLICT DO NOTHING;

-- Leaf: Moradia > Karlsruhe > Impostos e taxas
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Impostos e taxas',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Karlsruhe'
ON CONFLICT DO NOTHING;

-- Rule for: Impostos e taxas
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Impostos e taxas - Auto',
  tl.leaf_id,
  '501004496409/Grundsteuer B 2025; 501004496409/Grundsteuer',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Karlsruhe'
  AND tl.nivel_3_pt = 'Impostos e taxas'
ON CONFLICT DO NOTHING;

-- Leaf: Moradia > Karlsruhe > Nebenkosten/WEG/Hausverwaltung
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Nebenkosten/WEG/Hausverwaltung',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Karlsruhe'
ON CONFLICT DO NOTHING;

-- Rule for: Nebenkosten/WEG/Hausverwaltung
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Nebenkosten/WEG/Hausverwaltung - Auto',
  tl.leaf_id,
  'WEG loswohnen II; loswohnen II , Karlsruhe -- HG Vorauszahlung 302-1-1; WEG Loswohnen 2; DE74660501010022518260; WEG',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Karlsruhe'
  AND tl.nivel_3_pt = 'Nebenkosten/WEG/Hausverwaltung'
ON CONFLICT DO NOTHING;

-- Leaf: Moradia > Olching > Aluguel incl. NK
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Aluguel incl. NK',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Olching'
ON CONFLICT DO NOTHING;

-- Rule for: Aluguel incl. NK
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Aluguel incl. NK - Auto',
  tl.leaf_id,
  'Schroeder -- Monatsmiete -- DAUERAUFTRAG; Schroeder; Schroeder -- Monatsmiete -- DAUERAUFTRAG',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Olching'
  AND tl.nivel_3_pt = 'Aluguel incl. NK'
ON CONFLICT DO NOTHING;

-- Leaf: Moradia > Olching > Energia
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Energia',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Olching'
ON CONFLICT DO NOTHING;

-- Rule for: Energia
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Energia - Auto',
  tl.leaf_id,
  'S/836678520540/602712118857; LichtBlick SE -- Abschlag (Strom); VATTENFALL EUROPE SALES; LichtBlick SE',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Olching'
  AND tl.nivel_3_pt = 'Energia'
ON CONFLICT DO NOTHING;

-- Leaf: Moradia > Olching > Internet/TV/Telefone
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Internet/TV/Telefone',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Olching'
ON CONFLICT DO NOTHING;

-- Rule for: Internet/TV/Telefone
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Internet/TV/Telefone - Auto',
  tl.leaf_id,
  '933951689.0',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Olching'
  AND tl.nivel_3_pt = 'Internet/TV/Telefone'
ON CONFLICT DO NOTHING;

-- Leaf: Moradia > Olching > Manutenção / Baumarkt
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Manutenção / Baumarkt',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Olching'
ON CONFLICT DO NOTHING;

-- Rule for: Manutenção / Baumarkt
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Manutenção / Baumarkt - Auto',
  tl.leaf_id,
  'DANKE BZO OLCHING GMBH',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Moradia'
  AND tl2.nivel_2_pt = 'Olching'
  AND tl.nivel_3_pt = 'Manutenção / Baumarkt'
ON CONFLICT DO NOTHING;

-- Leaf: Pets > Compras > Alimentação e acessórios
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Alimentação e acessórios',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Pets'
  AND tl2.nivel_2_pt = 'Compras'
ON CONFLICT DO NOTHING;

-- Rule for: Alimentação e acessórios
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Alimentação e acessórios - Auto',
  tl.leaf_id,
  'www.futalis.de; Fressnapf',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Pets'
  AND tl2.nivel_2_pt = 'Compras'
  AND tl.nivel_3_pt = 'Alimentação e acessórios'
ON CONFLICT DO NOTHING;

-- Leaf: Pets > Veterinário > Veterinário
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Veterinário',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Pets'
  AND tl2.nivel_2_pt = 'Veterinário'
ON CONFLICT DO NOTHING;

-- Leaf: Saúde > Cabelereiro > Cabelereiro
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Cabelereiro',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Saúde'
  AND tl2.nivel_2_pt = 'Cabelereiro'
ON CONFLICT DO NOTHING;

-- Leaf: Saúde > Cuidados pessoais > Limpeza de pele
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Limpeza de pele',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Saúde'
  AND tl2.nivel_2_pt = 'Cuidados pessoais'
ON CONFLICT DO NOTHING;

-- Rule for: Limpeza de pele
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Limpeza de pele - Auto',
  tl.leaf_id,
  'natalia.fertsc',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Saúde'
  AND tl2.nivel_2_pt = 'Cuidados pessoais'
  AND tl.nivel_3_pt = 'Limpeza de pele'
ON CONFLICT DO NOTHING;

-- Leaf: Saúde > Cuidados pessoais > Produtos de estética
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Produtos de estética',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Saúde'
  AND tl2.nivel_2_pt = 'Cuidados pessoais'
ON CONFLICT DO NOTHING;

-- Rule for: Produtos de estética
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Produtos de estética - Auto',
  tl.leaf_id,
  'Silvia Griebl; L''OCCITANE DÜSSELDORF;',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Saúde'
  AND tl2.nivel_2_pt = 'Cuidados pessoais'
  AND tl.nivel_3_pt = 'Produtos de estética'
ON CONFLICT DO NOTHING;

-- Leaf: Saúde > Dentista/Ortodontia > Dentista/Ortodontia
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Dentista/Ortodontia',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Saúde'
  AND tl2.nivel_2_pt = 'Dentista/Ortodontia'
ON CONFLICT DO NOTHING;

-- Rule for: Dentista/Ortodontia
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Dentista/Ortodontia - Auto',
  tl.leaf_id,
  'Gemeinschaftspraxis fuer Kinderzahnheilkunde; Zahnarztpraxis',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Saúde'
  AND tl2.nivel_2_pt = 'Dentista/Ortodontia'
  AND tl.nivel_3_pt = 'Dentista/Ortodontia'
ON CONFLICT DO NOTHING;

-- Leaf: Saúde > Farmácia > Farmácia
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Farmácia',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Saúde'
  AND tl2.nivel_2_pt = 'Farmácia'
ON CONFLICT DO NOTHING;

-- Rule for: Farmácia
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Farmácia - Auto',
  tl.leaf_id,
  'Apotheke',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Saúde'
  AND tl2.nivel_2_pt = 'Farmácia'
  AND tl.nivel_3_pt = 'Farmácia'
ON CONFLICT DO NOTHING;

-- Leaf: Saúde > Gastos gerais > Palmilha
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Palmilha',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Saúde'
  AND tl2.nivel_2_pt = 'Gastos gerais'
ON CONFLICT DO NOTHING;

-- Rule for: Palmilha
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Palmilha - Auto',
  tl.leaf_id,
  'AGM MUELLER GMBH',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Saúde'
  AND tl2.nivel_2_pt = 'Gastos gerais'
  AND tl.nivel_3_pt = 'Palmilha'
ON CONFLICT DO NOTHING;

-- Leaf: Saúde > Laboratório > Laboratório
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Laboratório',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Saúde'
  AND tl2.nivel_2_pt = 'Laboratório'
ON CONFLICT DO NOTHING;

-- Rule for: Laboratório
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Laboratório - Auto',
  tl.leaf_id,
  'Labor Augsburg MVZ',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Saúde'
  AND tl2.nivel_2_pt = 'Laboratório'
  AND tl.nivel_3_pt = 'Laboratório'
ON CONFLICT DO NOTHING;

-- Leaf: Saúde > Logopädie > Logo David
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Logo David',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Saúde'
  AND tl2.nivel_2_pt = 'Logopädie'
ON CONFLICT DO NOTHING;

-- Rule for: Logo David
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Logo David - Auto',
  tl.leaf_id,
  'Marion Schanz',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Saúde'
  AND tl2.nivel_2_pt = 'Logopädie'
  AND tl.nivel_3_pt = 'Logo David'
ON CONFLICT DO NOTHING;

-- Leaf: Saúde > Médico > Médico
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Médico',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Saúde'
  AND tl2.nivel_2_pt = 'Médico'
ON CONFLICT DO NOTHING;

-- Rule for: Médico
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Médico - Auto',
  tl.leaf_id,
  'PVS bayern GmbH; Gemeinschaftspraxis Dres. Huber Neu//MARKT SCHWABEN/DE; Hautarztpraxis Dr Poppe',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Saúde'
  AND tl2.nivel_2_pt = 'Médico'
  AND tl.nivel_3_pt = 'Médico'
ON CONFLICT DO NOTHING;

-- Leaf: Saúde > Óculos Apollo > Óculos David
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Óculos David',
  'Sim',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Saúde'
  AND tl2.nivel_2_pt = 'Óculos Apollo'
ON CONFLICT DO NOTHING;

-- Rule for: Óculos David
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Óculos David - Auto',
  tl.leaf_id,
  'APOLLO OPTIK -- -40 -- Processed; ; OLCHING -- APOLLO-OPTIK',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Saúde'
  AND tl2.nivel_2_pt = 'Óculos Apollo'
  AND tl.nivel_3_pt = 'Óculos David'
ON CONFLICT DO NOTHING;

-- Leaf: Saúde > Seguros > AOK Seguro Vinao
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'AOK Seguro Vinao',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Saúde'
  AND tl2.nivel_2_pt = 'Seguros'
ON CONFLICT DO NOTHING;

-- Rule for: AOK Seguro Vinao
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'AOK Seguro Vinao - Auto',
  tl.leaf_id,
  'OB-D400492027',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Saúde'
  AND tl2.nivel_2_pt = 'Seguros'
  AND tl.nivel_3_pt = 'AOK Seguro Vinao'
ON CONFLICT DO NOTHING;

-- Leaf: Saúde > Seguros > DEVK
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'DEVK',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Saúde'
  AND tl2.nivel_2_pt = 'Seguros'
ON CONFLICT DO NOTHING;

-- Rule for: DEVK
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'DEVK - Auto',
  tl.leaf_id,
  'Z00013153275 Leben; Haushaltglas; Hausrat; Haftpflicht; Rechtsschutz ; 622026799196; DEVK Riehlerstrasse 190 Koeln; DE87370605900000402702; DEVK Lebensversicherungsverein',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Saúde'
  AND tl2.nivel_2_pt = 'Seguros'
  AND tl.nivel_3_pt = 'DEVK'
ON CONFLICT DO NOTHING;

-- Leaf: Telefone > Celular > Celular Family
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Celular Family',
  'Sim',
  'Fixo',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Telefone'
  AND tl2.nivel_2_pt = 'Celular'
ON CONFLICT DO NOTHING;

-- Rule for: Celular Family
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Celular Family - Auto',
  tl.leaf_id,
  'Kd-Nr.: 6074738889',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Telefone'
  AND tl2.nivel_2_pt = 'Celular'
  AND tl.nivel_3_pt = 'Celular Family'
ON CONFLICT DO NOTHING;

-- Leaf: Trabalho > Bosch Viagem > Reembolso Bosch
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Reembolso Bosch',
  'Não',
  'Variável',
  'Receita'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Trabalho'
  AND tl2.nivel_2_pt = 'Bosch Viagem'
ON CONFLICT DO NOTHING;

-- Rule for: Reembolso Bosch
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Reembolso Bosch - Auto',
  tl.leaf_id,
  'Bosch GmbHTvl Exp',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Trabalho'
  AND tl2.nivel_2_pt = 'Bosch Viagem'
  AND tl.nivel_3_pt = 'Reembolso Bosch'
ON CONFLICT DO NOTHING;

-- Leaf: Trabalho > Bosch Viagem > Team-Event
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Team-Event',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Trabalho'
  AND tl2.nivel_2_pt = 'Bosch Viagem'
ON CONFLICT DO NOTHING;

-- Rule for: Team-Event
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Team-Event - Auto',
  tl.leaf_id,
  'Banca Prealpi Sanbiagio Credito Cooperativo',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Trabalho'
  AND tl2.nivel_2_pt = 'Bosch Viagem'
  AND tl.nivel_3_pt = 'Team-Event'
ON CONFLICT DO NOTHING;

-- Leaf: Trabalho > Salário > Salário Erica
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Salário Erica',
  'Não',
  'Variável',
  'Receita'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Trabalho'
  AND tl2.nivel_2_pt = 'Salário'
ON CONFLICT DO NOTHING;

-- Rule for: Salário Erica
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Salário Erica - Auto',
  tl.leaf_id,
  'Emylie Maria Bernardes Pereira; Rogerio Behr; Ricardo Nuber; David Brandao Da Silva; Fernanda Mendonca Finato; Emylie Maria Bernardes Pereira; Leonardo Morassi Capitanio',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Trabalho'
  AND tl2.nivel_2_pt = 'Salário'
  AND tl.nivel_3_pt = 'Salário Erica'
ON CONFLICT DO NOTHING;

-- Leaf: Trabalho > Salário > Salário Vinicius
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Salário Vinicius',
  'Sim',
  'Fixo',
  'Receita'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Trabalho'
  AND tl2.nivel_2_pt = 'Salário'
ON CONFLICT DO NOTHING;

-- Rule for: Salário Vinicius
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Salário Vinicius - Auto',
  tl.leaf_id,
  'Entgelt 71336818',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Trabalho'
  AND tl2.nivel_2_pt = 'Salário'
  AND tl.nivel_3_pt = 'Salário Vinicius'
ON CONFLICT DO NOTHING;

-- Leaf: Transferências > Transferências para Brasil > Transferências Wise/TransferWise
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Transferências Wise/TransferWise',
  'Não',
  'Variável',
  'Despesa'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Transferências'
  AND tl2.nivel_2_pt = 'Transferências para Brasil'
ON CONFLICT DO NOTHING;

-- Rule for: Transferências Wise/TransferWise
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Transferências Wise/TransferWise - Auto',
  tl.leaf_id,
  'TransferWise; wise',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Transferências'
  AND tl2.nivel_2_pt = 'Transferências para Brasil'
  AND tl.nivel_3_pt = 'Transferências Wise/TransferWise'
ON CONFLICT DO NOTHING;

-- Leaf: Vendas > Vendas online > Vendas Vinted/Mangopay
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  'Vendas Vinted/Mangopay',
  'Não',
  'Variável',
  'Receita'
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Vendas'
  AND tl2.nivel_2_pt = 'Vendas online'
ON CONFLICT DO NOTHING;

-- Rule for: Vendas Vinted/Mangopay
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  'Vendas Vinted/Mangopay - Auto',
  tl.leaf_id,
  'Mangopay; Kleinanzeigen',
  NULL,
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = 'Vendas'
  AND tl2.nivel_2_pt = 'Vendas online'
  AND tl.nivel_3_pt = 'Vendas Vinted/Mangopay'
ON CONFLICT DO NOTHING;


-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT
  'Level 1 Count' as metric,
  COUNT(*) as count
FROM taxonomy_level_1
WHERE user_id = (SELECT var_value FROM temp_vars WHERE var_name = 'demo_user_id')
UNION ALL
SELECT
  'Level 2 Count',
  COUNT(*)
FROM taxonomy_level_2
WHERE user_id = (SELECT var_value FROM temp_vars WHERE var_name = 'demo_user_id')
UNION ALL
SELECT
  'Level 3 (Leaf) Count',
  COUNT(*)
FROM taxonomy_leaf
WHERE user_id = (SELECT var_value FROM temp_vars WHERE var_name = 'demo_user_id')
UNION ALL
SELECT
  'Rules Count',
  COUNT(*)
FROM rules
WHERE user_id = (SELECT var_value FROM temp_vars WHERE var_name = 'demo_user_id');
