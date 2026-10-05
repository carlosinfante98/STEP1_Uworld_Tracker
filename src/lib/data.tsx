import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import { DEFAULT_SETTINGS, type Assessment, type Block, type BlockInput, type Settings, type Task } from './types'

export interface DataApi {
  mode: 'cloud' | 'local'
  ready: boolean
  settings: Settings
  blocks: Block[]
  tasks: Task[]
  assessments: Assessment[]
  saveSettings: (s: Settings) => Promise<void>
  addBlock: (b: BlockInput) => Promise<void>
  updateBlock: (id: string, patch: Partial<BlockInput>) => Promise<void>
  deleteBlock: (id: string) => Promise<void>
  addTask: (text: string) => Promise<void>
  toggleTask: (id: string, done: boolean) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  addAssessment: (a: Omit<Assessment, 'id' | 'createdAt'>) => Promise<void>
  deleteAssessment: (id: string) => Promise<void>
}

const Ctx = createContext<DataApi | null>(null)
export function useData(): DataApi {
  const v = useContext(Ctx)
  if (!v) throw new Error('useData outside provider')
  return v
}

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36))

/* ---------- Cloud: Firestore, scoped to users/{uid}/... ---------- */

export function CloudProvider({ uid, children }: { uid: string; children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loaded, setLoaded] = useState({ settings: false, blocks: false, tasks: false, assessments: false })

  useEffect(() => {
    if (!db) return
    const mark = (k: keyof typeof loaded) => setLoaded((l) => (l[k] ? l : { ...l, [k]: true }))
    const unsubs = [
      onSnapshot(doc(db, 'users', uid, 'meta', 'settings'), (snap) => {
        setSettings({ ...DEFAULT_SETTINGS, ...(snap.data() as Partial<Settings> | undefined) })
        mark('settings')
      }),
      onSnapshot(collection(db, 'users', uid, 'blocks'), (snap) => {
        setBlocks(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Block, 'id'>) })))
        mark('blocks')
      }),
      onSnapshot(collection(db, 'users', uid, 'tasks'), (snap) => {
        setTasks(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Task, 'id'>) })))
        mark('tasks')
      }),
      onSnapshot(collection(db, 'users', uid, 'assessments'), (snap) => {
        setAssessments(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Assessment, 'id'>) })))
        mark('assessments')
      }),
    ]
    return () => unsubs.forEach((u) => u())
  }, [uid])

  const api = useMemo<DataApi>(() => {
    const d = db!
    return {
      mode: 'cloud',
      ready: Object.values(loaded).every(Boolean),
      settings, blocks, tasks, assessments,
      saveSettings: (s) => setDoc(doc(d, 'users', uid, 'meta', 'settings'), s),
      addBlock: (b) => setDoc(doc(d, 'users', uid, 'blocks', newId()), { ...b, createdAt: Date.now() }),
      updateBlock: (id, patch) => updateDoc(doc(d, 'users', uid, 'blocks', id), patch),
      deleteBlock: (id) => deleteDoc(doc(d, 'users', uid, 'blocks', id)),
      addTask: (text) => setDoc(doc(d, 'users', uid, 'tasks', newId()), { text, done: false, createdAt: Date.now() }),
      toggleTask: (id, done) => updateDoc(doc(d, 'users', uid, 'tasks', id), { done }),
      deleteTask: (id) => deleteDoc(doc(d, 'users', uid, 'tasks', id)),
      addAssessment: (a) => setDoc(doc(d, 'users', uid, 'assessments', newId()), { ...a, createdAt: Date.now() }),
      deleteAssessment: (id) => deleteDoc(doc(d, 'users', uid, 'assessments', id)),
    }
  }, [uid, loaded, settings, blocks, tasks, assessments])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

/* ---------- Local: this browser only (used before Firebase is configured) ---------- */

interface LocalShape { settings: Settings; blocks: Block[]; tasks: Task[]; assessments: Assessment[] }
const LS_KEY = 's1t:data:v1'

function readLocal(): LocalShape {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const p = JSON.parse(raw) as Partial<LocalShape>
      return {
        settings: { ...DEFAULT_SETTINGS, ...p.settings },
        blocks: p.blocks ?? [],
        tasks: p.tasks ?? [],
        assessments: p.assessments ?? [],
      }
    }
  } catch { /* fall through to empty */ }
  return { settings: DEFAULT_SETTINGS, blocks: [], tasks: [], assessments: [] }
}

export function LocalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LocalShape>(readLocal)

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)) } catch { /* storage blocked */ }
  }, [state])

  const patch = useCallback((fn: (s: LocalShape) => LocalShape) => { setState(fn); return Promise.resolve() }, [])

  const api = useMemo<DataApi>(() => ({
    mode: 'local',
    ready: true,
    ...state,
    saveSettings: (settings) => patch((s) => ({ ...s, settings })),
    addBlock: (b) => patch((s) => ({ ...s, blocks: [...s.blocks, { ...b, id: newId(), createdAt: Date.now() }] })),
    updateBlock: (id, p) => patch((s) => ({ ...s, blocks: s.blocks.map((b) => (b.id === id ? { ...b, ...p } : b)) })),
    deleteBlock: (id) => patch((s) => ({ ...s, blocks: s.blocks.filter((b) => b.id !== id) })),
    addTask: (text) => patch((s) => ({ ...s, tasks: [...s.tasks, { id: newId(), text, done: false, createdAt: Date.now() }] })),
    toggleTask: (id, done) => patch((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, done } : t)) })),
    deleteTask: (id) => patch((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) })),
    addAssessment: (a) => patch((s) => ({ ...s, assessments: [...s.assessments, { ...a, id: newId(), createdAt: Date.now() }] })),
    deleteAssessment: (id) => patch((s) => ({ ...s, assessments: s.assessments.filter((a) => a.id !== id) })),
  }), [state, patch])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}
