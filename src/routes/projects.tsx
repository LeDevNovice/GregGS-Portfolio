import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/projects')({
  component: Projects
})

function Projects() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1>Mes Projets</h1>
      <p>Cette page est en cours de développement...</p>
      <a 
        href="/" 
        style={{
          marginTop: '1rem',
          color: '#792262',
          textDecoration: 'underline',
        }}
      >
        Retour à l'accueil
      </a>
    </div>
  )
}