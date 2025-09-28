import React from 'react'
import ReactDOM from 'react-dom/client'

// Componente mínimo de teste
function TestApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2c5aa0' }}>🎓 Sistema Horizonte do Saber</h1>
      <div style={{
        background: '#d4edda',
        padding: '15px',
        border: '1px solid #c3e6cb',
        borderRadius: '5px',
        margin: '20px 0'
      }}>
        <h2>✅ React está funcionando!</h2>
        <p>Este é um teste mínimo do React sem dependências complexas.</p>
        <p><strong>Data/Hora:</strong> {new Date().toLocaleString('pt-BR')}</p>
        <p><strong>Versão React:</strong> {React.version}</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Próximos passos:</h3>
        <ul>
          <li>Verificar carregamento de dependências</li>
          <li>Testar React Router</li>
          <li>Verificar React Query</li>
          <li>Checar contextos e providers</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', background: '#f8f9fa', borderRadius: '5px' }}>
        <small>
          Para voltar ao sistema original, renomeie main.tsx.backup para main.tsx
        </small>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>,
)