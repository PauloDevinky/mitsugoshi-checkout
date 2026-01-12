import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()
    console.log("=== DUTTYFY WEBHOOK RECEIVED ===")
    console.log("Payload:", JSON.stringify(payload))

    // Tenta identificar o ID da transação e o status
    // Adapte estes campos conforme a documentação real do Duttyfy
    const transactionId = payload.transactionId || payload.id || payload.transaction_id
    const status = payload.status || payload.paymentStatus
    
    // Mapeamento de status do Duttyfy para o nosso sistema
    let newStatus = 'pending'
    if (status === 'PAID' || status === 'paid' || status === 'approved' || status === 'COMPLETED') {
      newStatus = 'approved'
    } else if (status === 'FAILED' || status === 'failed' || status === 'rejected') {
      newStatus = 'rejected'
    }

    if (!transactionId) {
      throw new Error("ID da transação não encontrado no payload")
    }

    console.log(`Atualizando transação ${transactionId} para ${newStatus}`)

    // 1. Atualizar transação no nosso banco
    // Assumindo que o transactionId do Duttyfy é o mesmo ID da nossa tabela 'transactions' 
    // OU que salvamos o ID externo em algum lugar. 
    // Por enquanto, vamos tentar buscar pelo ID direto (se for UUID) ou por um campo externo se existisse.
    // Como na criação não salvamos o ID externo (ainda), vamos assumir que o Duttyfy manda de volta o nosso ID no campo 'externalReference' ou 'metadata'.
    
    // Tentar encontrar a transação
    // Se o ID for UUID válido, tenta buscar direto.
    // Caso contrário, tenta buscar por algum metadado.
    
    const { data: transaction, error: fetchError } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('id', transactionId) // Tenta match direto primeiro
      .maybeSingle()

    if (fetchError || !transaction) {
       console.log("Transação não encontrada pelo ID direto. Tentando verificar se é um ID externo (futuro).")
       // Aqui implementaríamos busca por ID externo se tivéssemos essa coluna
       throw new Error(`Transação ${transactionId} não encontrada no sistema.`)
    }

    // Atualiza o status
    const { error: updateError } = await supabaseClient
      .from('transactions')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId)

    if (updateError) {
      throw updateError
    }

    // 2. Disparar Webhook de Venda Aprovada (Notificar cliente/CRM)
    // Se a venda foi aprovada, chamamos nosso próprio dispatcher para avisar sistemas externos
    if (newStatus === 'approved') {
       // Buscar configurações de webhook do usuário (opcional, se houver tabela para isso)
       // Por enquanto, apenas logamos que o evento ocorreu
       console.log("Venda aprovada! Disparando ações pós-venda...")
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("Erro no processamento do webhook:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
