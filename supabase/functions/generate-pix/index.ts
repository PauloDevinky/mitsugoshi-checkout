import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const body = await req.json()
    console.log("=== GENERATE PIX START ===")
    console.log("Payload recebido:", JSON.stringify(body))

    const { amount, description, customer, item, utm, apiKey } = body

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
      utm: utm || ""
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
      throw new Error(`API retornou resposta vazia. Status: ${response.status}. Verifique se a chave API está correta.`)
    }

    // Parse JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      throw new Error(`Resposta inválida da API: ${responseText.substring(0, 100)}`)
    }

    console.log("Resposta parsed:", JSON.stringify(data))

    // Verificar erro da API
    if (data.error) {
      throw new Error(data.error)
    }

    // Verificar se não é 2xx
    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}: ${data.message || data.error || response.statusText}`)
    }

    // Sucesso - garantir que temos pixCode
    const pixCode = data.pixCode || data.pix_code || data.code || data.qrcode || data.copiaECola
    
    if (!pixCode) {
      console.error("Resposta sem pixCode:", data)
      throw new Error("API não retornou código PIX")
    }

    console.log("=== PIX GERADO COM SUCESSO ===")
    console.log("pixCode (primeiros 50 chars):", pixCode.substring(0, 50) + "...")
    console.log("transactionId:", data.transactionId)

    return new Response(JSON.stringify({
      pixCode: pixCode,
      transactionId: data.transactionId,
      status: data.status || "PENDING"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
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
