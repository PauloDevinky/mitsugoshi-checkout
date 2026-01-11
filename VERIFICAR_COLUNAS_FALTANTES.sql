-- ============================================
-- VERIFICAR QUAIS COLUNAS ESTÃO FALTANDO
-- ============================================
-- Execute este script PRIMEIRO para ver quais colunas estão faltando
-- ============================================

-- Lista de todas as colunas que o checkout builder precisa
WITH required_columns AS (
  SELECT unnest(ARRAY[
    'customFooterImage',
    'logoWidth',
    'showReviews',
    'checkout_security_badges_type',
    'checkout_security_badges_custom_url',
    'checkout_order_bump_headline',
    'checkout_order_bump_color',
    'checkout_urgency_bar_bg_color',
    'checkout_show_timer_countdown',
    'checkout_social_proof_max'
  ]) AS column_name
),
existing_columns AS (
  SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'products'
    AND column_name IN (
      SELECT column_name FROM required_columns
    )
)
SELECT 
  rc.column_name AS "Coluna Necessária",
  CASE 
    WHEN ec.column_name IS NOT NULL THEN '✅ EXISTE'
    ELSE '❌ FALTANDO'
  END AS "Status"
FROM required_columns rc
LEFT JOIN existing_columns ec ON rc.column_name = ec.column_name
ORDER BY 
  CASE WHEN ec.column_name IS NULL THEN 0 ELSE 1 END,
  rc.column_name;

-- ============================================
-- Se você viu colunas com "❌ FALTANDO", 
-- execute o script COMPLETE_FIX_CHECKOUT_COLUMNS.sql
-- ============================================
