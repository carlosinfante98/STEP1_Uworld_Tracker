export type Mode = 'tutor' | 'timed'

export interface Block {
  id: string
  date: string // YYYY-MM-DD, local
  name: string
  system: string
  subject: string
  mode: Mode
  total: number
  correct: number
  omitted: number
  minutes: number | null
  reviewed: boolean
  notes: string
  createdAt: number
}

export type BlockInput = Omit<Block, 'id' | 'createdAt'>

export interface Task {
  id: string
  text: string
  done: boolean
  createdAt: number
}

export interface Assessment {
  id: string
  name: string
  date: string
  score: number
  note: string
  createdAt: number
}

export interface Settings {
  examDate: string // YYYY-MM-DD or ''
  totalQuestions: number // 0 = not set yet
  goalPct: number
  fallbackPct: number
}

export const DEFAULT_SETTINGS: Settings = {
  examDate: '',
  totalQuestions: 0,
  goalPct: 70,
  fallbackPct: 50,
}
