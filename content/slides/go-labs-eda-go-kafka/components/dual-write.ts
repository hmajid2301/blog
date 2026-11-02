import type { Diagram } from './diagram-previews.ts'

export function dualWrite(step: number): Diagram {
  const reverse = step >= 3
  const saved = step >= 1 && !reverse
  const missingEvent = step === 2
  return {
    title: 'Two independent calls: either order can leave one write missing', width: 1100, height: 300,
    nodes: [
      { id: 'db', label: 'Collections DB', detail: reverse ? 'write failed' : saved ? 'state saved' : undefined, x: 10, y: 80, w: 250, h: 130, shape: 'database', tone: reverse ? 'red' : saved ? 'green' : 'muted' },
      { id: 'service', label: 'Collections', x: 440, y: 100, w: 220, h: 90, tone: 'teal' },
      { id: 'kafka', label: 'collections topic', detail: reverse ? 'event published' : missingEvent ? 'publish failed' : undefined, x: 840, y: 80, w: 250, h: 130, shape: 'queue', tone: reverse ? 'green' : missingEvent ? 'red' : 'muted' },
    ],
    edges: [
      { from: 'service', to: 'db', label: reverse ? '2. save fails' : '1. save', tone: reverse ? 'red' : saved ? 'green' : 'muted', active: step === 1 || reverse, fromPort: 'left', toPort: 'right', labelAt: [350, 115] },
      { from: 'service', to: 'kafka', label: reverse ? '1. publish' : missingEvent ? '2. publish fails' : '2. publish', tone: reverse ? 'green' : missingEvent ? 'red' : 'muted', active: missingEvent || reverse, fromPort: 'right', toPort: 'left', labelAt: [750, 115] },
    ],
  }
}
