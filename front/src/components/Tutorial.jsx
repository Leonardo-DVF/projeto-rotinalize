import React, { useState, useEffect, useRef } from 'react';

const tutorialSteps = [
  {
    id: 1,
    message: "Bem-vindo ao Rotinalize! Aqui você pode gerenciar seus hábitos e listas de tarefas. Vamos começar com o painel To-dos.",
    target: ".columns > .panel:nth-child(1)", // To-dos panel
    position: "bottom",
  },
  {
    id: 2,
    message: "No painel To-dos, você cria hábitos isolados. Clique no botão '+' para adicionar seu primeiro hábito!",
    target: ".columns > .panel:nth-child(1) .plus-btn",
    position: "right",
  },
  {
    id: 3,
    message: "Aqui está o painel de Listas, onde você organiza hábitos em grupos. É útil para projetos maiores.",
    target: ".columns > .panel:nth-child(2)", // Lists panel
    position: "bottom",
  },
  {
    id: 4,
    message: "Clique no '+' para criar uma nova lista de tarefas e adicionar hábitos a ela.",
    target: ".columns > .panel:nth-child(2) .plus-btn",
    position: "right",
  },
  {
    id: 5,
    message: "O painel da IA ajuda você a planejar estudos ou gerar ideias. Converse com ela para dicas personalizadas!",
    target: ".columns > .panel:nth-child(3)", // AI panel
    position: "left",
  },
  {
    id: 6,
    message: "Use a barra de busca no topo para encontrar hábitos ou listas rapidamente. Você também pode ordenar os itens.",
    target: "header .search-container",
    position: "bottom",
  },
  {
    id: 7,
    message: "Pronto! Agora você sabe o básico. Explore o site e crie seus primeiros hábitos. Você pode desabilitar este tutorial nas configurações.",
    target: null,
    position: "center",
  },
];

export default function Tutorial({ onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [show, setShow] = useState(true);
  const bubbleRef = useRef(null);

  useEffect(() => {
    // Mark tutorial as shown on first completion
    if (currentStep === tutorialSteps.length - 1) {
      localStorage.setItem('tutorialShown', 'true');
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
    localStorage.setItem('tutorialShown', 'true');
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
