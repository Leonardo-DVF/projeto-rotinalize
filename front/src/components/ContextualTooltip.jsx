import React, { useState, useRef, useEffect } from 'react';

export default function ContextualTooltip({ children, content, position = 'bottom', show, message, onConfirm, onClose }) {
  if (show) {
    // Modal mode for Home and Todos pages
    return (
      <>
        <div className="tutorial-overlay" onClick={onClose}>
          <div className="tutorial-backdrop"></div>
          <div
            className="tutorial-bubble"
            style={{
              position: 'fixed',
              zIndex: 1001,
              maxWidth: '400px',
              textAlign: 'center',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p>{message}</p>
            <div style={{ marginTop: '20px' }}>
            <button onClick={() => { onClose(); setTimeout(onConfirm, 0); }} style={{ marginRight: '10px', padding: '5px 10px' }}>Entendi</button>
              <button onClick={onClose} style={{ padding: '5px 10px' }}>Fechar</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Tooltip mode for CalendarPage
  const [showTooltip, setShowTooltip] = useState(false);
  const triggerRef = useRef(null);
  const bubbleRef = useRef(null);

  const handleClick = () => {
    setShowTooltip(!showTooltip);
  };

  const handleClickOutside = (event) => {
    if (triggerRef.current && !triggerRef.current.contains(event.target) &&
        bubbleRef.current && !bubbleRef.current.contains(event.target)) {
      setShowTooltip(false);
    }
  };

  useEffect(() => {
    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTooltip]);

  useEffect(() => {
    if (showTooltip && bubbleRef.current && triggerRef.current) {
      const bubble = bubbleRef.current;
      let top, left;

      // Center the tooltip in the viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const bubbleRect = bubble.getBoundingClientRect();

      top = (viewportHeight - bubbleRect.height) / 2;
      left = (viewportWidth - bubbleRect.width) / 2;

      // Ensure within viewport
      if (left < 10) left = 10;
      if (left + bubbleRect.width > viewportWidth - 10) left = viewportWidth - bubbleRect.width - 10;
      if (top < 10) top = 10;
      if (top + bubbleRect.height > viewportHeight - 10) top = viewportHeight - bubbleRect.height - 10;

      bubble.style.top = `${top}px`;
      bubble.style.left = `${left}px`;
    }
  }, [showTooltip]);

  return (
    <>
      <div
        ref={triggerRef}
        onClick={handleClick}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>
      {showTooltip && (
        <>
          <div className="tutorial-overlay" onClick={() => setShowTooltip(false)}>
            <div className="tutorial-backdrop"></div>
            <div
              ref={bubbleRef}
              className="tutorial-bubble"
              style={{
                position: 'fixed',
                zIndex: 1001,
                maxWidth: '400px',
                textAlign: 'center',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <p>{content}</p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
