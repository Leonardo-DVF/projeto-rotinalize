import React from 'react'

export default function TodoCard({title, desc, priority='Baixa', img=false}){
  return (
    <div className="card todo">
      <div className="row">
        {img && <div className="thumb" />}
        <div>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
            <span>✅</span>
            <strong>{title}</strong>
          </div>
          <div className="small" style={{maxWidth:420}}>{desc}</div>
          <div className="meta">
            <span className={priority==='Alta'?'badge danger': priority==='Baixa'?'badge low':'badge'}>Prioridade: {priority}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
