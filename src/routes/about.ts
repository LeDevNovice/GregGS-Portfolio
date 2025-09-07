import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const About = lazy(() => import('../pages/About'))

export const Route = createFileRoute('/about')({
  component: About
})