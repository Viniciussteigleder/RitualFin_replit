-- =====================================================
-- RitualFin Merchant Aliases Seed (1000 merchants)
-- =====================================================
-- Generated from docs/Feedback_user/RitualFin-categorias-alias.xlsx
-- Run after: 002_seed_taxonomy.sql
-- =====================================================

-- Get demo user ID
DO $$
BEGIN
  CREATE TEMP TABLE IF NOT EXISTS temp_vars (
    var_name TEXT PRIMARY KEY,
    var_value TEXT
  );
  DELETE FROM temp_vars WHERE var_name = 'demo_user_id';
  INSERT INTO temp_vars (var_name, var_value)
  SELECT 'demo_user_id', id FROM users WHERE username = 'demo' LIMIT 1;
END $$;

-- =====================================================
-- Merchant Aliases
-- =====================================================

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'C&A',
  'C&A; C & A Mode GmbH & Co.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/C%26A_Logo.svg/330px-C%26A_Logo.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Decathlon',
  'DECATHLON',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Decathlon_Logo.svg/330px-Decathlon_Logo.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'About You',
  'ABOUT YOU;',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/About_You_Logo.svg/330px-About_You_Logo.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Zara',
  'Zara',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Zara_Logo.svg/330px-Zara_Logo.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Deichmann',
  'Deichmann',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Deichmann_logo.svg/960px-Deichmann_logo.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Amazon',
  'AMAZON; AMZN; AMZ*;',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/330px-Amazon_logo.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Lidl',
  'Lidl',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Lidl-Logo.svg/330px-Lidl-Logo.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Rewe',
  'REWE',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Logo_REWE.svg/960px-Logo_REWE.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Aldi',
  'ALDI',
  'https://1000logos.net/wp-content/uploads/2017/12/Aldi-Logo-1982.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Edeka',
  'EDEKA',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Edeka_Logo_Aktuell.svg/330px-Edeka_Logo_Aktuell.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Netto',
  'NETTO',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Netto_Marken-Discount_2018_logo.svg/250px-Netto_Marken-Discount_2018_logo.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Ihle',
  'Ihle',
  'https://neo-koenigsbrunn.de/wp-content/uploads/2024/03/IHLE_Aussenlogo_2021_quer_Fleache_pos_4C.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Wünsche',
  'WUENSCHE',
  'https://scontent-muc2-1.xx.fbcdn.net/v/t39.30808-1/305963108_455942006560089_3919871944130796939_n.jpg?stp=dst-jpg_s480x480_tt6&_nc_cat=106&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=M0I4E5j8TS0Q7kNvwGegXxy&_nc_oc=Adkv2yS721H5M-9i0OU0eVbvXXVYOC481DT6vpWW4amnWL5TN6An2k6aYvCqzOnHpM4hUNWO9IG3jzIWkmszNfcW&_nc_zt=24&_nc_ht=scontent-muc2-1.xx&_nc_gid=bI4T5wyIBsaOEq33OwlTSg&oh=00_Afr0sdH8DkV4p53q_AlZ5ZJfD_gpWSH2clpP8E7DjYXkWg&oe=695C73A9'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Claude AI',
  'Claude',
  'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/claude-ai-icon.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Temu',
  'Temu',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Temu_logo.svg/250px-Temu_logo.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'PayPal',
  'PayPal',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/PayPal_logo.svg/330px-PayPal_logo.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Tedi',
  'TEDI',
  'https://media.tourdata.at/file/original/0e6fb4dd357de7f20c2be4e32d6664f4.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'DM',
  'DM',
  'https://upload.wikimedia.org/wikipedia/commons/5/50/Dm_Logo.svg'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Rossmann',
  'Rossmann',
  'https://k3-heilbronn.de/wp-content/uploads/2022/05/logo_1_rossmann.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Müller',
  'Müller',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Logo_Drogerie_Mueller.svg/320px-Logo_Drogerie_Mueller.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Apple',
  'Apple iCloud/App Store',
  'https://logo.com/image-cdn/images/kts928pd/production/4429bc095f6ddb190c0457f215d2d625959aae87-1600x900.png?w=1920&q=72&fm=webp'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Google',
  'Google One',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Netflix',
  'Netflix',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/330px-Netflix_2015_logo.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Disney+',
  'Disney',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Disney%2B_logo.svg/330px-Disney%2B_logo.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'YouTube',
  'YouTube Premium',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/YouTube_Logo_2017.svg/330px-YouTube_Logo_2017.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'ChatGPT',
  'ChatGPT',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/OpenAI_Logo.svg/330px-OpenAI_Logo.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Paramount+',
  'PARAMOUNT',
  NULL
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Active Campaign',
  'ACTIVECAMP',
  'https://portermetrics.com/wp-content/uploads/2023/07/Logo-Active-Campaign.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Blau Handy',
  'Kd-Nr.: 6074738889',
  'https://assets.tariffuxx.de/media/blau.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Futalis',
  'www.futalis.de',
  NULL
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Fressnapf',
  'Fressnapf',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Fressnapf_Logo_2023.svg/330px-Fressnapf_Logo_2023.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'CleverFit Fitness',
  'OLC--0157-0000631 OLC-2637639; OLC-2637639; OLC--0157-0000373 OLC-2428106 RED LABEL; OLC-2428106 RED LABEL; OLC--0156-0000276 OLC-2637461 RED LABEL; OLC-2637461 RED LABEL',
  'https://onecdn.io/cdn-cgi/image/width=1200,height=600,fit=contain/media/4478e8e9-a6b4-4895-96dd-ae97a21b831d/lg'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Seguro',
  'Kfz-Versicherung Nr 870711522 fuerIhr Fahrzeug mit dem Kennzeichen FFB FA 317; KFZ0047667216',
  NULL
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Estacionamento',
  'Parkhaus; HandyParken Muenchen; Parkgaragen; PBW PG KRIEGSBERGSTR.; Parkgarage; PARKEN OLYMPIA',
  NULL
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Multas/Infrações',
  'Stadt Mannheim',
  NULL
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'MVV / Bus / Trem',
  'MVV TICKETSHOP LOGPAY VOI DE',
  NULL
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Médico',
  'PVS bayern GmbH; Gemeinschaftspraxis Dres. Huber Neu//MARKT SCHWABEN/DE; Hautarztpraxis Dr Poppe',
  NULL
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Dentista/Ortodontia',
  'Gemeinschaftspraxis fuer Kinderzahnheilkunde; Zahnarztpraxis',
  NULL
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Farmácia',
  'Apotheke',
  NULL
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'AOK',
  'OB-D400492027',
  'https://upload.wikimedia.org/wikipedia/commons/a/a8/AOK-2021.svg'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'DEVK',
  'Z00013153275 Leben; Haushaltglas; Hausrat; Haftpflicht; Rechtsschutz ; 622026799196; DEVK Riehlerstrasse 190 Koeln; DE87370605900000402702; DEVK Lebensversicherungsverein',
  'https://upload.wikimedia.org/wikipedia/de/thumb/9/92/DEVK_201x_logo.svg/330px-DEVK_201x_logo.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Gymnasium Olching',
  'Gymnasium Olching',
  NULL
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Kindergeld',
  'Arbeit - Familien kasse; Bundesagentur',
  'https://upload.wikimedia.org/wikipedia/de/thumb/7/7c/Bundesagentur_f%C3%BCr_Arbeit_logo.svg/2048px-Bundesagentur_f%C3%BCr_Arbeit_logo.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Wise',
  'TransferWise',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Wise_Logo_512x124.svg/330px-Wise_Logo_512x124.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Amex fatura',
  'pagamento Amex; AMERICAN EXPRESS; Amex - RETOURNIERTE LASTSCHRIFT; Amex - ZAHLUNG ERHALTEN. BESTEN DANK.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/2052px-American_Express_logo_%282018%29.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Miles & More fatura',
  'pagamento M&M; DEUTSCHE KREDITBANK AKTIENGESELLSCHAFT',
  'https://upload.wikimedia.org/wikipedia/de/thumb/3/39/Miles_%26_More_Logo.svg/512px-Miles_%26_More_Logo.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Saque',
  'BARGELDAUSZAHLUNG -- DE66700530709000481409; GELDAUTOMAT; BARGELDAUSZAHLUNG',
  'https://upload.wikimedia.org/wikipedia/commons/4/4e/Logo-_Sparkassen-App_%E2%80%93_die_mobile_Filiale.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Miles & More Mensalidade',
  'monatlicher Kartenpreis',
  'https://upload.wikimedia.org/wikipedia/de/thumb/3/39/Miles_%26_More_Logo.svg/512px-Miles_%26_More_Logo.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Apollo',
  'CC28K3RBB78RKBG6; Apollo-Optik Holding GmbH ? Co. KG DP25-00125921; Apollo-Optik Holding GmbH ? Co. KG; DE52100190001000027873',
  NULL
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Bosch salário Vinicius',
  'Entgelt 71336818',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Bosch-logo.svg/250px-Bosch-logo.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Salário Erica',
  'Emylie Maria Bernardes Pereira; Rogerio Behr; Ricardo Nuber; David Brandao Da Silva; Fernanda Mendonca Finato; Emylie Maria Bernardes Pereira; Leonardo Morassi Capitanio',
  NULL
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Kleinanzeigen',
  'Kleinanzeigen',
  NULL
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'BOG Mitglied',
  'Mitgliedsbeitrag 2024 f r Erica und Vinicius Steiglede; Bruederlichkeit ohne Grenzen e.V.--Mitgliedsbeitrag 2025; Bruederlichkeit ohne Grenzen e.V. -- Mitgliedsbeitrag; PAYPAL *BRUEDERLICH 4029357733',
  NULL
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Diba Financiamento',
  'ING-DIBA AG 5328937129',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsn3G2ZyO4U8WB-CIA3zKE3rgB8rYSdmJx_ft6KQCgVA&s'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Diba Rahmenkredit',
  'Rahmenkredit komplett abbezaht; DE12500105175705720690; Rahmenkredit; 5705720690.KKRATKR.01.002.142920',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsn3G2ZyO4U8WB-CIA3zKE3rgB8rYSdmJx_ft6KQCgVA&s'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Saturn',
  'Saturn',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Saturn-Logo.svg/330px-Saturn-Logo.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Mediamarkt',
  'Mediamarkt',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/MediaMarkt_logo.svg/330px-MediaMarkt_logo.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Ikea',
  'Ikea',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Ikea-logo.svg/330px-Ikea-logo.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Schülerhilfe',
  'SCHULHILFEV',
  'https://upload.wikimedia.org/wikipedia/de/thumb/d/dc/Sch%C3%BClerhilfe-Logo.svg/2560px-Sch%C3%BClerhilfe-Logo.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'ROBLOX',
  'ROBLOX',
  'https://images.seeklogo.com/logo-png/36/1/roblox-logo-png_seeklogo-365972.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'AOK Seguro Vinao',
  'OB-D400492027',
  'https://upload.wikimedia.org/wikipedia/commons/a/a8/AOK-2021.svg'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Reembolso Bosch',
  'Bosch GmbHTvl Exp',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Bosch-logo.svg/250px-Bosch-logo.svg.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Stadtwerk Karlsruhe - Fernwärme',
  'Vertragsnr 250014203; V 2004774510-BEL400000778120-VK250014203',
  'https://www.stadtwerke-karlsruhe.de/wLayout/wGlobal/layout/images/logo.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();

INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_logo_internet)
SELECT
  var_value,
  'Stadtwerk Karlsruhe - Wasser',
  'Vertragskonto 210672822',
  'https://www.stadtwerke-karlsruhe.de/wLayout/wGlobal/layout/images/logo.png'
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_logo_internet = EXCLUDED.url_logo_internet,
  updated_at = NOW();


-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT
  'Aliases Count' as metric,
  COUNT(*) as count
FROM alias_assets
WHERE user_id = (SELECT var_value FROM temp_vars WHERE var_name = 'demo_user_id');

-- Expected: 64 aliases
