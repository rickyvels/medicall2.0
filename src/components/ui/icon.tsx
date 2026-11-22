import {
  Activity, Brain, Droplets, Flame, Footprints, Moon, Pill, ShieldCheck, Sparkles, Stethoscope, Thermometer, Users, Wind,
  type LucideIcon, type LucideProps,
} from 'lucide-react'

const map: Record<string, LucideIcon> = {
  Activity, Brain, Droplets, Flame, Footprints, Moon, Pill, ShieldCheck, Sparkles, Stethoscope, Thermometer, Users, Wind,
}

/** Resuelve iconos por nombre (datos del backend) sin importar toda la librería. */
export function DynamicIcon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = map[name] ?? Stethoscope
  return <Cmp aria-hidden {...props} />
}
