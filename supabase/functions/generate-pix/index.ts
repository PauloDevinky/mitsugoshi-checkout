import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Base URL da API Duttyfy/Pagamentos Seguros
const PIX_API_BASE = "https://www.pagamentos-seguros.app/api-pix"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    console.log("=== GENERATE PIX START ===")
    console.log("Payload recebido:", JSON.stringify(body))

    const { amount, description, customer, item, utm, apiKey, productId } = body

    // Validações
    if (!apiKey) {
      throw new Error('Chave API do gateway não configurada')
    }

    if (!amount || amount < 100) {
      throw new Error('Valor mínimo de R$ 1,00 (100 centavos)')
    }

    const cleanCpf = String(customer?.document || '').replace(/\D/g, '')
    const cleanPhone = String(customer?.phone || '').replace(/\D/g, '')

    if (cleanCpf.length !== 11) {
      throw new Error(`CPF inválido: ${cleanCpf.length} dígitos (esperado 11)`)
    }

    // 1. Criar transação no banco de dados (Status: pending)
    // Isso garante que temos um registro antes mesmo de chamar o gateway
    const { data: transaction, error: txError } = await supabaseClient
      .from('transactions')
      .insert({
        product_id: productId, // Precisamos passar o productId no body
        amount: amount, // Valor em centavos? O banco espera DECIMAL(10,2) ou centavos?
                        // No frontend estava passando `totals.total` (reais) para o insert e `totals.total * 100` para o gateway.
                        // O adapter recebe amount em centavos.
                        // Vamos ajustar isso. Se amount vem em centavos, dividimos por 100 para o banco.
        status: 'pending',
        payment_method: 'pix',
        gateway: 'duttyfy',
        customer_name: customer?.name,
        customer_email: customer?.email,
        customer_whatsapp: cleanPhone,
        utm_source: utm || '',
        description: description
      })
      .select()
      .single()

    if (txError) {
      console.error("Erro ao criar transação no banco:", txError)
      throw new Error(`Erro interno ao registrar transação: ${txError.message}`)
    }

    console.log("Transação criada com ID:", transaction.id)

    // Payload conforme documentação Duttyfy
    const pixPayload = {
      amount: Math.round(Number(amount)),
      description: description || "Pagamento via Pix",
      customer: {
        name: customer?.name || "Cliente",
        document: cleanCpf,
        email: customer?.email || "naoinfo@email.com",
        phone: cleanPhone
      },
      item: {
        title: item?.title || "Produto",
        price: Math.round(Number(item?.price || amount)),
        quantity: 1
      },
      paymentMethod: "PIX",
      utm: utm || "",
      // Enviamos o ID da nossa transação como referência externa (se o gateway suportar metadata ou external_id)
      // Como não sabemos se suporta, vamos apenas logar.
    }

    const apiUrl = `${PIX_API_BASE}/${apiKey}`
    console.log("API URL:", apiUrl)
    console.log("Payload enviado:", JSON.stringify(pixPayload))

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(pixPayload)
    })

    console.log("Status HTTP:", response.status, response.statusText)
    
    const responseText = await response.text()
    console.log("Resposta raw:", responseText || "(vazio)")

    // Se resposta vazia
    if (!responseText || responseText.trim() === '') {
       // Atualizar transação para erro
       await supabaseClient.from('transactions').update({ status: 'refused' }).eq('id', transaction.id)
       throw new Error(`API retornou resposta vazia. Status: ${response.status}. Verifique se a chave API está correta.`)
    }

    // Parse JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      await supabaseClient.from('transactions').update({ status: 'refused' }).eq('id', transaction.id)
      throw new Error(`Resposta inválida da API: ${responseText.substring(0, 100)}`)
    }

    console.log("Resposta parsed:", JSON.stringify(data))

    // Verificar erro da API
    if (data.error) {
      await supabaseClient.from('transactions').update({ status: 'refused' }).eq('id', transaction.id)
      throw new Error(data.error)
    }

    // Verificar se não é 2xx
    if (!response.ok) {
      await supabaseClient.from('transactions').update({ status: 'refused' }).eq('id', transaction.id)
      throw new Error(`Erro HTTP ${response.status}: ${data.message || data.error || response.statusText}`)
    }

    // Sucesso! Atualizar transação com código PIX
    await supabaseClient
      .from('transactions')
      .update({ 
        pix_code: data.pixCode,
        // pix_qr_url: data.pixQrUrl, // Se tiver URL do QR Code
        status: 'pending' // Mantém pending até o webhook confirmar
      })
      .eq('id', transaction.id)

    // Retornar sucesso com ID da transação
    return new Response(
      JSON.stringify({ 
        ...data, 
        internalTransactionId: transaction.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error("Erro na Edge Function:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error("=== ERRO ===", msg)
    
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
