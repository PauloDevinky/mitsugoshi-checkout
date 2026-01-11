# 🔧 Solução Completa: Erro ao Salvar no Checkout Builder

## ❌ Problema
Ao tentar salvar alterações no checkout builder, aparece o erro:
```
Erro ao salvar: Could not find the 'customFooterImage' column of 'products' in the schema cache
```

## 🔍 Causa
As seguintes **10 colunas** não existem na tabela `products` do banco de dados:

1. `customFooterImage` - Imagem customizada do rodapé
2. `logoWidth` - Largura do logo em pixels  
3. `showReviews` - Toggle para mostrar avaliações
4. `checkout_security_badges_type` - Tipo de selos (default/custom)
5. `checkout_security_badges_custom_url` - URL da imagem customizada dos selos
6. `checkout_order_bump_headline` - Título do order bump
7. `checkout_order_bump_color` - Cor do order bump
8. `checkout_urgency_bar_bg_color` - Cor da barra de urgência
9. `checkout_show_timer_countdown` - Mostrar contagem regressiva
10. `checkout_social_proof_max` - Máximo de pessoas na prova social

## ✅ Solução Passo a Passo

### Passo 1: Verificar quais colunas estão faltando (Opcional)

1. Abra o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Execute o script `VERIFICAR_COLUNAS_FALTANTES.sql`
4. Isso mostrará quais colunas estão faltando

### Passo 2: Adicionar todas as colunas faltantes

1. No **Supabase SQL Editor**, execute o script `COMPLETE_FIX_CHECKOUT_COLUMNS.sql`
2. O script irá:
   - Adicionar todas as 10 colunas faltantes
   - Criar a constraint necessária
   - Mostrar uma verificação de quais colunas foram criadas

### Passo 3: Verificar se funcionou

1. Após executar o script, você deve ver 10 linhas na query de verificação
2. Todas devem mostrar `✅ NOVA COLUNA` ou `✅ JÁ EXISTIA`
3. Se alguma coluna não aparecer, execute o script novamente

### Passo 4: Testar no Checkout Builder

1. Volte para o checkout builder
2. Faça uma alteração qualquer (ex: mudar a cor primária)
3. Clique em "Salvar"
4. O erro não deve mais aparecer! ✅

## 📋 Checklist de Colunas

Após executar o script, todas estas colunas devem existir:

- ✅ `customFooterImage` (TEXT, nullable)
- ✅ `logoWidth` (INTEGER, default 120)
- ✅ `showReviews` (BOOLEAN, default true)
- ✅ `checkout_security_badges_type` (TEXT, default 'default')
- ✅ `checkout_security_badges_custom_url` (TEXT, nullable)
- ✅ `checkout_order_bump_headline` (TEXT, default 'Leve também...')
- ✅ `checkout_order_bump_color` (TEXT, nullable)
- ✅ `checkout_urgency_bar_bg_color` (TEXT, nullable)
- ✅ `checkout_show_timer_countdown` (BOOLEAN, default true)
- ✅ `checkout_social_proof_max` (INTEGER, default 50)

## 🛠️ Arquivos Criados

- `COMPLETE_FIX_CHECKOUT_COLUMNS.sql` - **USE ESTE** - Script completo e definitivo
- `VERIFICAR_COLUNAS_FALTANTES.sql` - Script para verificar o que está faltando
- `FIX_ALL_MISSING_COLUMNS.sql` - Script alternativo
- `FIX_ALL_CHECKOUT_COLUMNS.sql` - Script alternativo

## ⚠️ Importante

- Execute o script **UMA VEZ** no Supabase SQL Editor
- O script usa `ADD COLUMN IF NOT EXISTS`, então é seguro executar múltiplas vezes
- Se ainda der erro após executar, verifique se você está conectado ao banco correto
- Certifique-se de que está executando no banco de **produção** (não local)

## 🔄 Se Ainda Não Funcionar

1. Verifique se você executou o script no banco correto
2. Verifique se todas as 10 colunas foram criadas (use o script de verificação)
3. Limpe o cache do navegador e tente novamente
4. Verifique os logs do Supabase para ver se há outros erros

## 📝 Nota Técnica

O erro ocorre porque o Supabase valida o schema antes de executar queries. Se uma coluna não existe no schema cache, a query falha antes mesmo de tentar executar. Por isso, todas as colunas precisam existir no banco de dados antes de serem usadas.
