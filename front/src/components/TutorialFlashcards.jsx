import React, { useState, useEffect, useRef } from 'react';

const tutorialSteps = [
  {
    id: 1,
    message: "Bem-vindo aos Cartões de Memorização! Aqui você pode criar baralhos de cartões para estudar e memorizar conteúdos. Vamos começar com a lista de baralhos.",
    target: ".container h1", // Título da página
    position: "bottom",
  },
  {
    id: 2,
    message: "Clique em 'Criar Novo Baralho' para começar. Você pode criar baralhos organizados por assunto ou tema.",
    target: ".add-flashcard-con button", // Botão Criar Novo Baralho
    position: "bottom",
  },
  {
    id: 3,
    message: "Cada baralho mostra o título e descrição. Clique em 'Ver Cartões' para acessar os cartões dentro do baralho.",
    target: ".deck-card", // Primeiro card de baralho (se existir)
    position: "bottom",
  },
  {
    id: 4,
    message: "Dentro de um baralho, você vê a lista de cartões. Clique em 'Adicionar Cartão' para criar novos cartões de estudo.",
    target: ".add-flashcard-con button", // Botão Adicionar Cartão (na página de lista de cartões)
    position: "bottom",
  },
  {
    id: 5,
    message: "Cada cartão tem uma pergunta (frente) e uma resposta (verso). Clique em 'Mostrar/Ocultar' para revelar a resposta.",
    target: ".card", // Primeiro cartão (se existir)
    position: "bottom",
  },
  {
    id: 6,
    message: "Use os botões de editar e excluir para gerenciar seus cartões. Pratique regularmente para melhorar a memorização!",
    target: ".buttons-con", // Botões de ação do cartão
    position: "bottom",
  },
  {
    id: 7,
    message: "Pronto! Agora você sabe como usar os cartões de memorização. Crie seus primeiros baralhos e cartões para começar a estudar.",
    target: null,
    position: "center",
  },
];

export default function TutorialFlashcards({ onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [show, setShow] = useState(true);
  const bubbleRef = useRef(null);

  useEffect(() => {
    // Mark tutorial as shown on first completion
    if (currentStep === tutorialSteps.length - 1) {
      localStorage.setItem('tutorialFlashcardsShown', 'true');
    }
  }, [currentStep]);

  useEffect(() => {
    const step = tutorialSteps[currentStep];
    if (step.target && bubbleRef.current) {
      const targetElement = document.querySelector(step.target);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const bubble = bubbleRef.current;
        const bubbleRect = bubble.getBoundingClientRect();
        let top, left;

        switch (step.position) {
          case 'bottom':
            top = rect.bottom + 10;
            left = rect.left + rect.width / 2 - bubbleRect.width / 2;
            break;
          case 'top':
            top = rect.top - bubbleRect.height - 10;
            left = rect.left + rect.width / 2 - bubbleRect.width / 2;
            break;
          case 'left':
            top = rect.top + rect.height / 2 - bubbleRect.height / 2;
            left = rect.left - bubbleRect.width - 10;
            break;
          case 'right':
            top = rect.top + rect.height / 2 - bubbleRect.height / 2;
            left = rect.right + 10;
            break;
          default:
            top = rect.top + rect.height / 2 - bubbleRect.height / 2;
            left = rect.left + rect.width / 2 - bubbleRect.width / 2;
        }

        // Ensure bubble stays within viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        if (left < 10) left = 10;
        if (left + bubbleRect.width > viewportWidth - 10) left = viewportWidth - bubbleRect.width - 10;
        if (top < 10) top = 10;
        if (top + bubbleRect.height > viewportHeight - 10) top = viewportHeight - bubbleRect.height - 10;

        bubble.style.top = `${top}px`;
        bubble.style.left = `${left}px`;
      }
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShow(false);
      onClose();
    }
  };

  const handleSkip = () => {
    setShow(false);
    localStorage.setItem('tutorialFlashcardsShown', 'true');
    onClose();
  };

  if (!show) return null;

  const step = tutorialSteps[currentStep];

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-backdrop" onClick={handleSkip}></div>
      <div
        ref={bubbleRef}
        className={`tutorial-bubble ${step.position}`}
        style={step.target ? { position: 'fixed' } : { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <p>{step.message}</p>
        <div className="tutorial-buttons">
          <button onClick={handleSkip}>Pular Tutorial</button>
          <button onClick={handleNext}>
            {currentStep === tutorialSteps.length - 1 ? 'Finalizar' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  );
}
