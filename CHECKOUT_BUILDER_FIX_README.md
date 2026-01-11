# 🔧 Correção: Colunas Faltantes no Checkout Builder

## Problema
Ao tentar salvar alterações no checkout builder, ocorre o erro:
```
Erro ao salvar: Could not find the 'customFooterImage' column of 'products' in the schema cache
```

## Causa
As seguintes colunas não existem na tabela `products` do banco de dados:

1. ✅ `customFooterImage` - Imagem customizada do rodapé
2. ✅ `logoWidth` - Largura do logo em pixels
3. ✅ `showReviews` - Toggle para mostrar avaliações
4. ✅ `checkout_security_badges_type` - Tipo de selos (default/custom)
5. ✅ `checkout_security_badges_custom_url` - URL da imagem customizada dos selos
6. ✅ `checkout_order_bump_headline` - Título do order bump
7. ✅ `checkout_order_bump_color` - Cor do order bump
8. ✅ `checkout_urgency_bar_bg_color` - Cor da barra de urgência
9. ✅ `checkout_show_timer_countdown` - Mostrar contagem regressiva
10. ✅ `checkout_social_proof_max` - Máximo de pessoas na prova social

## Solução

### Passo 1: Executar o Script SQL

1. Abra o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Copie e cole o conteúdo do arquivo `FIX_ALL_MISSING_COLUMNS.sql`
4. Execute o script
5. Verifique se todas as 10 colunas foram criadas (o script mostra uma query de verificação)

### Passo 2: Verificar

Após executar o script, tente salvar novamente no checkout builder. O erro não deve mais aparecer.

## Arquivos Criados

- ✅ `FIX_ALL_MISSING_COLUMNS.sql` - Script SQL completo para adicionar todas as colunas
- ✅ `FIX_ALL_CHECKOUT_COLUMNS.sql` - Script alternativo (mesmo conteúdo)
- ✅ `FIX_CUSTOM_FOOTER_IMAGE.sql` - Script apenas para a coluna customFooterImage
- ✅ `supabase/migrations/20260110130000_add_missing_checkout_columns.sql` - Migration para Supabase CLI

## Melhorias no Código

- ✅ Mensagem de erro melhorada que identifica qual coluna está faltando
- ✅ Tratamento de erros mais robusto no `handleSave`

## Nota

Se você usar Supabase CLI, pode aplicar a migration com:
```bash
supabase migration up
```

Mas a forma mais rápida é executar o script SQL diretamente no dashboard do Supabase.
