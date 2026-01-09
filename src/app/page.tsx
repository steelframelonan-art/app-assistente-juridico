"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Scale, MessageCircle, FileText, AlertCircle, CheckCircle2 } from "lucide-react"

type Step = "inicio" | "identificacao" | "reu" | "fatos" | "pedido" | "valor" | "minuta"

interface DadosUsuario {
  nome: string
  cpf: string
  reu: string
  tipoReu: "fisica" | "juridica" | ""
  fatos: string
  dataFatos: string
  tentativaAmigavel: string
  pedido: string
  valor: string
}

export default function AssistenteJuridico() {
  const [step, setStep] = useState<Step>("inicio")
  const [dados, setDados] = useState<DadosUsuario>({
    nome: "",
    cpf: "",
    reu: "",
    tipoReu: "",
    fatos: "",
    dataFatos: "",
    tentativaAmigavel: "",
    pedido: "",
    valor: ""
  })
  const [inputValue, setInputValue] = useState("")
  const [mensagens, setMensagens] = useState<Array<{tipo: "bot" | "user", texto: string}>>([])
  const [erro, setErro] = useState("")

  const salarioMinimo = 1412 // Valor de 2024
  const limiteValor = salarioMinimo * 40

  const adicionarMensagem = (tipo: "bot" | "user", texto: string) => {
    setMensagens(prev => [...prev, { tipo, texto }])
  }

  const iniciarAtendimento = () => {
    setStep("identificacao")
    adicionarMensagem("bot", "Olá! Sou seu assistente jurídico virtual. Vou te ajudar a organizar as informações para uma ação no Juizado Especial Cível.")
    adicionarMensagem("bot", "⚠️ Importante: Sou uma inteligência artificial e este documento é apenas um rascunho. Não substitui a orientação de um advogado.")
    setTimeout(() => {
      adicionarMensagem("bot", "Vamos começar! Qual é o seu nome completo?")
    }, 1000)
  }

  const validarCPF = (cpf: string): boolean => {
    const cpfLimpo = cpf.replace(/\D/g, "")
    return cpfLimpo.length === 11
  }

  const formatarCPF = (cpf: string): string => {
    const cpfLimpo = cpf.replace(/\D/g, "")
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  const formatarValor = (valor: string): string => {
    const numero = parseFloat(valor.replace(/\D/g, "")) / 100
    return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  const processarResposta = () => {
    if (!inputValue.trim()) {
      setErro("Por favor, digite uma resposta.")
      return
    }

    setErro("")
    adicionarMensagem("user", inputValue)

    switch (step) {
      case "identificacao":
        if (!dados.nome) {
          setDados({ ...dados, nome: inputValue })
          setInputValue("")
          setTimeout(() => {
            adicionarMensagem("bot", `Prazer, ${inputValue}! Agora preciso do seu CPF (apenas números).`)
          }, 500)
        } else {
          if (!validarCPF(inputValue)) {
            setErro("CPF inválido. Digite 11 números.")
            setInputValue("")
            return
          }
          setDados({ ...dados, cpf: formatarCPF(inputValue) })
          setInputValue("")
          setStep("reu")
          setTimeout(() => {
            adicionarMensagem("bot", "Perfeito! Agora me diga: contra quem é a ação? É uma empresa ou uma pessoa física?")
            adicionarMensagem("bot", "Digite 'empresa' ou 'pessoa'.")
          }, 500)
        }
        break

      case "reu":
        if (!dados.tipoReu) {
          const tipo = inputValue.toLowerCase()
          if (tipo.includes("empresa") || tipo.includes("juridica")) {
            setDados({ ...dados, tipoReu: "juridica" })
            setInputValue("")
            setTimeout(() => {
              adicionarMensagem("bot", "Entendi, é uma empresa. Qual o nome completo da empresa?")
            }, 500)
          } else if (tipo.includes("pessoa") || tipo.includes("fisica")) {
            setDados({ ...dados, tipoReu: "fisica" })
            setInputValue("")
            setTimeout(() => {
              adicionarMensagem("bot", "Entendi, é uma pessoa física. Qual o nome completo dela?")
            }, 500)
          } else {
            setErro("Por favor, digite 'empresa' ou 'pessoa'.")
            setInputValue("")
          }
        } else {
          setDados({ ...dados, reu: inputValue })
          setInputValue("")
          setStep("fatos")
          setTimeout(() => {
            adicionarMensagem("bot", "Ótimo! Agora vamos aos fatos. Descreva o que aconteceu. Conte o problema com detalhes.")
          }, 500)
        }
        break

      case "fatos":
        if (!dados.fatos) {
          setDados({ ...dados, fatos: inputValue })
          setInputValue("")
          setTimeout(() => {
            adicionarMensagem("bot", "Quando isso aconteceu? (exemplo: janeiro de 2024, dia 15/03/2024)")
          }, 500)
        } else if (!dados.dataFatos) {
          setDados({ ...dados, dataFatos: inputValue })
          setInputValue("")
          setTimeout(() => {
            adicionarMensagem("bot", "Você tentou resolver isso de forma amigável antes? Como foi?")
          }, 500)
        } else {
          setDados({ ...dados, tentativaAmigavel: inputValue })
          setInputValue("")
          setStep("pedido")
          setTimeout(() => {
            adicionarMensagem("bot", "Entendi. Agora me diga: o que você quer que aconteça? (exemplo: receber o dinheiro de volta, cancelar o contrato, receber indenização por danos morais, receber o produto)")
          }, 500)
        }
        break

      case "pedido":
        setDados({ ...dados, pedido: inputValue })
        setInputValue("")
        setStep("valor")
        setTimeout(() => {
          adicionarMensagem("bot", "Última pergunta: qual o valor total do seu prejuízo? (em reais)")
        }, 500)
        break

      case "valor":
        const valorNumerico = parseFloat(inputValue.replace(/\D/g, "")) / 100
        
        if (isNaN(valorNumerico) || valorNumerico <= 0) {
          setErro("Por favor, digite um valor válido.")
          setInputValue("")
          return
        }

        if (valorNumerico > limiteValor) {
          adicionarMensagem("bot", `⚠️ ATENÇÃO: O valor informado (${formatarValor(inputValue)}) ultrapassa 40 salários mínimos (${formatarValor(String(limiteValor * 100))}).`)
          setTimeout(() => {
            adicionarMensagem("bot", "Neste caso, você PRECISA de um advogado para entrar com a ação. Procure a Defensoria Pública ou um advogado particular.")
          }, 1000)
        }

        setDados({ ...dados, valor: formatarValor(inputValue) })
        setInputValue("")
        setStep("minuta")
        
        setTimeout(() => {
          adicionarMensagem("bot", "Pronto! Coletei todas as informações. Vou gerar sua minuta de reclamação agora...")
        }, 500)
        break
    }
  }

  const gerarMinuta = () => {
    return `
═══════════════════════════════════════════════════
        MINUTA DE RECLAMAÇÃO PRÉVIA
        JUIZADO ESPECIAL CÍVEL
═══════════════════════════════════════════════════

RECLAMANTE: ${dados.nome}
CPF: ${dados.cpf}

RECLAMADO: ${dados.reu}
${dados.tipoReu === "juridica" ? "(Pessoa Jurídica)" : "(Pessoa Física)"}

═══════════════════════════════════════════════════
DOS FATOS
═══════════════════════════════════════════════════

${dados.fatos}

Data dos fatos: ${dados.dataFatos}

Tentativa de resolução amigável:
${dados.tentativaAmigavel}

═══════════════════════════════════════════════════
DOS PEDIDOS
═══════════════════════════════════════════════════

Diante dos fatos narrados, requer:

${dados.pedido}

═══════════════════════════════════════════════════
VALOR DA CAUSA
═══════════════════════════════════════════════════

${dados.valor}

═══════════════════════════════════════════════════

Nestes termos, pede deferimento.

Local e Data: _________________, ___/___/______

_________________________________
${dados.nome}
CPF: ${dados.cpf}

═══════════════════════════════════════════════════
⚠️ Este é um documento preliminar gerado por IA.
   Leve-o ao Juizado Especial Cível para atermação.
═══════════════════════════════════════════════════
    `
  }

  const copiarMinuta = () => {
    navigator.clipboard.writeText(gerarMinuta())
    alert("Minuta copiada para a área de transferência!")
  }

  const baixarMinuta = () => {
    const elemento = document.createElement("a")
    const arquivo = new Blob([gerarMinuta()], { type: "text/plain" })
    elemento.href = URL.createObjectURL(arquivo)
    elemento.download = `minuta_${dados.nome.replace(/\s/g, "_")}.txt`
    documento.body.appendChild(elemento)
    elemento.click()
    documento.body.removeChild(elemento)
  }

  const reiniciar = () => {
    setStep("inicio")
    setDados({
      nome: "",
      cpf: "",
      reu: "",
      tipoReu: "",
      fatos: "",
      dataFatos: "",
      tentativaAmigavel: "",
      pedido: "",
      valor: ""
    })
    setInputValue("")
    setMensagens([])
    setErro("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Scale className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Assistente Jurídico
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Juizados Especiais Cíveis - Pequenas Causas
          </p>
        </div>

        {/* Tela Inicial */}
        {step === "inicio" && (
          <Card className="shadow-2xl border-2 border-blue-100 dark:border-blue-900">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Bem-vindo!</CardTitle>
              <CardDescription className="text-base">
                Vou te ajudar a organizar as informações para sua ação no Juizado Especial Cível
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <AlertDescription className="text-sm">
                  <strong>O que são Juizados Especiais Cíveis?</strong>
                  <br />
                  São tribunais para resolver problemas mais simples, como:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Problemas com compras e serviços</li>
                    <li>Cobranças indevidas</li>
                    <li>Danos materiais e morais</li>
                    <li>Contratos (até 40 salários mínimos)</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <AlertDescription className="text-sm">
                  <strong>Casos que NÃO atendemos:</strong>
                  <br />
                  Questões criminais, trabalhistas ou de família devem ser levadas à Defensoria Pública.
                </AlertDescription>
              </Alert>

              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-lg text-white">
                <h3 className="font-bold text-lg mb-2">Como funciona?</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Vou fazer algumas perguntas sobre seu caso</li>
                  <li>Você responde com calma, uma de cada vez</li>
                  <li>No final, gero um documento organizado</li>
                  <li>Você leva esse documento ao Juizado para atermação</li>
                </ol>
              </div>

              <Button 
                onClick={iniciarAtendimento}
                className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Começar Atendimento
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Chat de Atendimento */}
        {step !== "inicio" && step !== "minuta" && (
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                Atendimento em Andamento
              </CardTitle>
              <CardDescription>
                Responda com calma. Uma pergunta por vez.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Área de Mensagens */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto space-y-3">
                {mensagens.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.tipo === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.tipo === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.texto}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input de Resposta */}
              <div className="space-y-2">
                {erro && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{erro}</AlertDescription>
                  </Alert>
                )}
                
                {step === "fatos" && !dados.fatos ? (
                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Digite sua resposta aqui..."
                    className="min-h-32"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.ctrlKey) {
                        processarResposta()
                      }
                    }}
                  />
                ) : (
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Digite sua resposta aqui..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        processarResposta()
                      }
                    }}
                  />
                )}
                
                <Button 
                  onClick={processarResposta}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Enviar Resposta
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Minuta Final */}
        {step === "minuta" && (
          <Card className="shadow-2xl border-2 border-green-200 dark:border-green-800">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle2 className="w-6 h-6" />
                Minuta Gerada com Sucesso!
              </CardTitle>
              <CardDescription>
                Seu documento está pronto. Você pode copiar ou baixar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription>
                  <strong>Próximos passos:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                    <li>Copie ou baixe este documento</li>
                    <li>Vá ao Juizado Especial Cível da sua cidade</li>
                    <li>Apresente este rascunho para atermação</li>
                    <li>Leve documentos que comprovem os fatos (notas, prints, contratos)</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                <pre className="text-xs whitespace-pre-wrap font-mono overflow-x-auto">
                  {gerarMinuta()}
                </pre>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={copiarMinuta}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Copiar Minuta
                </Button>
                <Button 
                  onClick={reiniciar}
                  variant="outline"
                  className="flex-1"
                >
                  Nova Consulta
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>⚖️ Este é um assistente virtual. O documento gerado é apenas um rascunho.</p>
          <p>Não substitui orientação jurídica profissional.</p>
        </div>
      </div>
    </div>
  )
}
