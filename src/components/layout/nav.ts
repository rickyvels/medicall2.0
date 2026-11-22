import { BriefcaseMedical, Building2, CalendarPlus, Heart, Home, Stethoscope, User, UsersRound, Wallet, type LucideIcon } from 'lucide-react'

export interface NavItem { to: string; label: string; icon: LucideIcon; end?: boolean }

export const mainNav: NavItem[] = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/consultas', label: 'Consultas', icon: Stethoscope },
  { to: '/bienestar', label: 'Bienestar', icon: Heart },
  { to: '/wallet', label: 'Wallet', icon: Wallet },
  { to: '/perfil', label: 'Perfil', icon: User },
]

export const secondaryNav: NavItem[] = [
  { to: '/medicos', label: 'Médicos', icon: UsersRound },
  { to: '/agendar', label: 'Agendar teleconsulta', icon: CalendarPlus },
  { to: '/clinicas', label: 'Clínicas', icon: Building2 },
  { to: '/pro', label: 'Soy profesional', icon: BriefcaseMedical },
]
