import React, { useState } from 'react'
import Header from '../components/Header.jsx'
import Sidebar from '../components/Sidebar.jsx'

export default function Help() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: "O que é e como funciona a IA da IAlize?",
      answer: "A IA da IAlize é uma assistente virtual que pode ajudar você com:\n\n• Planejamento de estudos\n• Resumos\n• Gerar exercícios para reforçar seus estudos\n\nPara conversar com a IA, você precisa estar logado no sistema. Utilize o chat para interagir com a IAlize e receber ajuda personalizada."
    },
    {
      question: "Como adicionar uma nova tarefa?",
      answer: "Clique em ➕ na seção 'minhas tarefas', preencha os dados e confirme."
    },
    {
      question: "Como criar uma tarefa isolada simples?",
      answer: "Na aba 'Tarefas isoladas', clique em ➕, insira a descrição e salve."
    },
    {
      question: "Qual a diferença entre uma tarefa e uma tarefa isolada?",
      answer: "Tarefas são hábitos com datas e repetições. Tarefas isoladas são tarefas rápidas, sem recorrência."
    },
    {
      question: "Como funciona o sistema de lembretes e notificações?",
      answer: "Você pode configurar lembretes para receber alertas no dia definido."
    },
    {
      question: "Como editar uma tarefa que já foi criada?",
      answer: "Clique na tarefa desejada e selecione 'Editar'."
    },
    {
      question: "Existe uma forma de ver estatísticas de produtividade?",
      answer: "Sim! O app exibe gráficos de progresso e estatísticas na seção de produtividade."
    },
    {
      question: "Minhas tarefas ficam salvas mesmo trocando de celular?",
      answer: "Sim, suas tarefas ficam salvas no banco de dados, basta fazer login novamente."
    },
    {
      question: "O app funciona Off-line?",
      answer: "Você pode acessar as tarefas salvas no dispositivo. Sincronizações só ocorrem quando online."
    },
    {
      question: "Como visualizar as atividades de outros dias?",
      answer: "Use o calendário para navegar entre os dias e visualizar tarefas passadas e futuras."
    },
    {
      question: "Como criar tarefas de forma eficiente?",
      answer: "Na seção 'Minhas tarefas', clique em ➕ para adicionar uma nova tarefa, insira o título, descrição e defina a prioridade (Alta, Baixa, etc.)."
    },
    {
      question: "O que significam os diferentes níveis de prioridade nas tarefas?",
      answer: "As tarefas podem possuir níveis de prioridade que aparecem como etiquetas coloridas: 'Alta' indica urgência, 'Baixa' indica menor prioridade e outras são padrão."
    },
    {
      question: "Como as tarefas são exibidas visualmente?",
      answer: "As tarefas são exibidas em cartões que mostram título, descrição e prioridade para fácil visualização e organização."
    },
    {
      question: "Como gerenciar flashcards?",
      answer: "Você pode gerenciar seus flashcards dentro de baralhos, adicionando, editando ou excluindo cartões conforme desejar."
    },
    {
      question: "Como funciona o modo de estudo de flashcards?",
      answer: "Utilize o modo de estudo para revisar seus cartões de forma interativa, respondendo e revisando perguntas e respostas."
    },
    {
      question: "Existe um tutorial para flashcards?",
      answer: "Sim, um tutorial está disponível para ajudar a entender como usar os flashcards de forma eficiente."
    },
    {
      question: "Como criar e editar listas?",
      answer: "Use a função de criar lista para adicionar um novo hábito (lista), definindo nome e descrição. Você pode editar essas informações a qualquer momento."
    },
    {
      question: "O que acontece se eu não inserir um nome para a lista?",
      answer: "O nome da lista é obrigatório. Se não for preenchido, o sistema exibirá um erro e impedirá o salvamento até que seja corrigido."
    },
    {
      question: "Como funciona o calendário?",
      answer: "O calendário exibe seus hábitos e tarefas organizados por dia. Cores indicam o tipo de dia: verde claro para hoje, verde médio para hábitos recorrentes, amarelo para hábitos pontuais e gradiente para dias mistos."
    },
    {
      question: "Como posso interagir com o calendário?",
      answer: "Clique em um dia para ver detalhes das tarefas e hábitos. Use os botões para navegar entre os meses."
    },
    {
      question: "Quais são as regras para hábitos recorrentes no calendário?",
      answer: "Eles aparecem a partir da data de criação e seguem os dias da semana selecionados para repetição."
    }
  ]

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="app">
      <Sidebar />
      <Header />
      <main className="main">
        <h2>Ajuda ❓</h2>

        <div className="faq-container">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <div className="faq-question" onClick={() => toggle(index)}>
                {faq.question}
                <span>{openIndex === index ? "▲" : "▶"}</span>
              </div>
              {openIndex === index && (
                <div className="faq-answer">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
