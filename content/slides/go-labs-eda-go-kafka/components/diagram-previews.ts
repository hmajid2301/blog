import { orderedRetryState, partitionState, unorderedRetryState } from './demo-states.ts'

export type Tone = 'teal' | 'blue' | 'purple' | 'orange' | 'yellow' | 'green' | 'red' | 'pink' | 'muted'
export type Port = 'top' | 'bottom' | 'left' | 'right'
export interface DiagramNode {
  id: string; label: string; x: number; y: number; w: number; h: number; tone: Tone
  detail?: string; small?: boolean; enter?: boolean; markDetail?: number; hidden?: boolean; shape?: 'database' | 'queue'; motion?: boolean
  markBox?: [number, string]; crossAt?: number
  offset?: number; arrival?: { from: [number, number]; via: [number, number] }
}
export interface DiagramEdge {
  from: string; to: string; tone: Tone; label?: string; active?: boolean; dashed?: boolean; crash?: boolean
  fromPort?: Port; toPort?: Port; via?: [number, number][]; labelAt?: [number, number]
}
export interface Diagram {
  title: string; nodes: DiagramNode[]; edges: DiagramEdge[]; groups?: DiagramNode[]; height?: number; width?: number; caption?: string
}

export const palette: Record<Tone, [string, string]> = {
  teal: ['#74c7ec', 'rgba(148,226,213,.22)'],
  blue: ['#89b4fa', 'rgba(137,180,250,.22)'],
  purple: ['#b4befe', 'rgba(203,166,247,.22)'],
  orange: ['#fab387', 'rgba(250,179,135,.22)'],
  yellow: ['#f9e2af', 'rgba(249,226,175,.22)'],
  green: ['#a6e3a1', 'rgba(166,227,161,.22)'],
  red: ['#f38ba8', 'rgba(243,139,168,.22)'],
  pink: ['#f5c2e7', 'rgba(245,194,231,.22)'],
  muted: ['#7f849c', 'rgba(127,132,156,.16)'],
}

function n(id: string, label: string, x: number, y: number, tone: Tone, options: Partial<DiagramNode> = {}): DiagramNode {
  return { id, label, x, y, tone, w: 190, h: 90, ...options }
}
function e(from: string, to: string, options: Partial<DiagramEdge> = {}): DiagramEdge {
  return { from, to, tone: 'muted', ...options }
}
function g(id: string, label: string, x: number, y: number, w: number, h: number, tone: Tone): DiagramNode {
  return n(id, label, x, y, tone, { w, h })
}

const syncNodes = [
  n('customer', 'Customer', 0, 100, 'blue'),
  n('collections', 'Collections', 300, 100, 'teal'),
  n('disbursements', 'Disbursements', 600, 100, 'purple'),
  n('bank', 'Partner Bank', 900, 100, 'red'),
  n('notifications', 'Notifications', 600, 340, 'green'),
]

export const previews: Record<string, (step: number) => Diagram> = {
  'happy-path': step => ({
    title: 'Synchronous happy path', nodes: syncNodes,
    edges: [
      e('customer', 'collections', { label: 'charge', active: step >= 1 }),
      e('collections', 'disbursements', { label: 'payout', active: step >= 2 }),
      e('disbursements', 'bank', { label: 'bank payout', active: step >= 2 }),
      e('disbursements', 'notifications', { label: 'receipt', active: step >= 3 }),
    ],
  }),
  'slow-bank': step => ({
    title: 'A slow bank blocks synchronous callers', nodes: syncNodes,
    edges: [
      e('customer', 'collections', { label: 'charge', tone: step >= 2 ? 'orange' : 'muted', active: true }),
      e('collections', 'disbursements', { label: 'payout', tone: step >= 2 ? 'orange' : 'muted', active: true }),
      e('disbursements', 'bank', { label: 'bank payout', tone: step >= 1 ? 'red' : 'muted', active: true }),
      e('disbursements', 'notifications', { label: 'receipt', active: step === 0 }),
    ],
  }),
  'event-flow': step => ({
    title: 'Event-driven payment flow',
    nodes: [
      n('collections', 'Collections', 0, 40, 'teal'),
      n('collections-topic', step >= 1 ? 'collections\ntopic' : 'Event bus', 300, 40, 'orange'),
      n('disbursements', 'Disbursements', 600, 40, 'purple'),
      n('bank', 'Partner Bank', 900, 40, 'red'),
      n('disbursements-topic', step >= 3 ? 'disbursements\ntopic' : 'Event bus', 600, 350, 'orange'),
      n('notifications', 'Notifications', 900, 350, 'green'),
    ],
    edges: [
      e('collections', 'collections-topic', { label: 'collections.completed.v1', tone: 'teal', active: step >= 1, fromPort: 'bottom', toPort: 'bottom', via: [[95, 230], [395, 230]], labelAt: [245, 230] }),
      e('collections-topic', 'disbursements', { label: 'consumes', active: step >= 2 }),
      e('disbursements', 'bank', { label: 'payout', active: step >= 2 }),
      e('disbursements', 'disbursements-topic', { label: 'disbursements.completed.v1', tone: 'purple', active: step >= 3 }),
      e('disbursements-topic', 'notifications', { label: 'consumes', active: step >= 3 }),
    ],
  }),
  'worker-scaling': step => ({
    title: 'Worker scaling', height: 520,
    groups: [g('topic', 'Topic: collections', 20, 0, 350, 505, 'orange'), g('group', 'Consumer group: disbursements', 710, 0, 370, 505, 'purple')],
    nodes: [
      n('p0', 'Partition 0', 100, 65, 'teal', { h: 75 }),
      n('p1', 'Partition 1', 100, 180, 'blue', { h: 75 }),
      n('p2', 'Partition 2', 100, 295, 'purple', { h: 75 }),
      n('w1', 'Worker 1', 800, 65, 'purple', { h: 75 }),
      n('w2', step === 1 ? 'Worker 2 · new' : 'Worker 2', 800, 180, step === 1 ? 'orange' : 'purple', { h: 75, hidden: step < 1 }),
      n('w3', step === 2 ? 'Worker 3 · new' : 'Worker 3', 800, 295, step === 2 ? 'blue' : 'purple', { h: 75, hidden: step < 2 }),
      n('w4', 'Worker 4 · new', 800, 410, 'muted', { h: 75, detail: 'idle · no partition', hidden: step < 3 }),
    ],
    edges: [
      e('p0', 'w1', { label: 'assigned' }),
      e('p1', step >= 1 ? 'w2' : 'w1', { label: step === 1 ? 'reassigned' : 'assigned', tone: step === 1 ? 'orange' : 'muted', active: step === 1 }),
      e('p2', step >= 2 ? 'w3' : 'w1', { label: step === 2 ? 'reassigned' : 'assigned', tone: step === 2 ? 'blue' : 'muted', active: step === 2, labelAt: step === 1 ? [430, 269] : undefined }),
    ],
  }),
  'partition-log': step => {
    const phase = Math.max(0, Math.min(step, 5))
    const captions = [
      'Partition 1: offsets 0–1 are already in the active segment.',
      'New event: transfer-a · collections.completed.v1',
      'Broker append: offset 2 joins 000.log.',
      'Demo segment limit: close 000.log, open 001.log.',
      'Next event: transfer-n · collections.created.v1',
      'Offset 3 appends to 001.log; old records stay in 000.log.',
    ]
    return {
      title: 'One event → partition → log segment', height: 500, caption: captions[phase],
      groups: [
        g('partition', 'Broker 1 · Partition 1 · local log', 340, 75, 750, 420, 'orange'),
        g('segment-0', phase >= 3 ? '000.log · closed' : '000.log · active', 360, 130, 330, 350, 'teal'),
        { ...g('segment-1', '001.log · active', 720, 130, 350, 350, 'blue'), hidden: phase < 3 },
      ],
      nodes: [
        n('producer', 'Collections', 20, 100, 'teal', { w: 280, detail: 'producer · key chooses P1', small: true }),
        n('record-0', 'offset 0 · transfer-a', 385, 175, 'teal', { w: 280, h: 82, detail: 'collections.created.v1', small: true }),
        n('record-1', 'offset 1 · transfer-a', 385, 270, 'teal', { w: 280, h: 82, detail: 'collections.updated.v1', small: true }),
        n('record-2', phase < 2 ? 'transfer-a · incoming' : 'offset 2 · transfer-a', phase < 2 ? 20 : 385, phase < 2 ? 260 : 365, phase < 2 ? 'orange' : 'teal', { w: 280, h: 82, detail: 'collections.completed.v1', small: true, hidden: phase < 1, motion: true }),
        n('record-3', phase < 5 ? 'transfer-n · incoming' : 'offset 3 · transfer-n', phase < 5 ? 20 : 750, phase < 5 ? 260 : 175, phase < 5 ? 'orange' : 'blue', { w: 280, h: 82, detail: 'collections.created.v1', small: true, hidden: phase < 4, motion: true }),
      ],
      edges: phase === 1 || phase === 4
        ? [e('producer', phase === 1 ? 'record-2' : 'record-3', { active: true, tone: 'orange', fromPort: 'bottom', toPort: 'top' })]
        : phase === 2
          ? [e('producer', 'record-2', { active: true, tone: 'teal', fromPort: 'right', toPort: 'left', via: [[320, 145], [320, 406]] })]
          : phase === 5
            ? [e('producer', 'record-3', { active: true, tone: 'blue', fromPort: 'right', toPort: 'left', via: [[320, 145], [320, 120], [735, 120], [735, 216]] })]
            : [],
    }
  },
  'partition-storage': step => {
    const state = partitionState(step)
    const selected = state.current?.partition ?? 1
    const events = state.partitions[selected].events
    const rolled = events.length > 2
    const tones: Tone[] = ['teal', 'blue', 'purple']
    const tone = tones[selected]
    const partitionY = 100 + selected * 135
    const producer = n('producer', 'Producer · latest', 10, 215, 'teal', { w: 230, h: 110, small: true, detail: state.current ? `${state.current.type}\nkey = ${state.current.key}` : 'Ready for one event' })
    const partitions = state.partitions.map(partition => n(`partition-${partition.id}`, `Partition ${partition.id}`, 300, 100 + partition.id * 135,
      state.current?.partition === partition.id ? 'green' : 'muted',
      { w: 210, small: true, detail: `${state.current?.partition === partition.id ? 'selected · ' : ''}${partition.events.length} record${partition.events.length === 1 ? '' : 's'}` }))
    const selectedPartition = partitions[selected]
    const recordWidth = 195, recordHeight = 100
    const records = events.map(event => n(event.id, event.key,
      610 + (event.offset % 2) * 230, event.offset < 2 ? 180 : 355,
      event.id === state.current?.id ? 'green' : tone,
      { w: recordWidth, h: recordHeight, detail: event.type, small: true, offset: event.offset,
        arrival: event.id === state.current?.id ? {
          from: [producer.x + (producer.w - recordWidth) / 2, producer.y + (producer.h - recordHeight) / 2],
          via: [selectedPartition.x + (selectedPartition.w - recordWidth) / 2, selectedPartition.y + (selectedPartition.h - recordHeight) / 2],
        } : undefined },
    ))
    const latest = records.find(record => record.id === state.current?.id)
    return {
      title: 'Follow one event: key → partition → log', height: 500,
      caption: !state.current ? 'One event per click: its key routes it; the broker appends it.'
        : rolled ? `Partition ${selected} rolls to 001.log; 000.log keeps the older records.`
          : `${state.current.key} → Partition ${selected} → 000.log`,
      groups: [
        g('selected-log', `Partition ${selected} · enlarged local log`, 575, 85, 515, 410, tone),
        g('segment-0', rolled ? '000.log · closed' : '000.log · active', 595, 140, 475, 150, tone),
        { ...g('segment-1', '001.log · active', 595, 320, 475, 155, tone), hidden: !rolled },
      ],
      nodes: [producer, ...partitions, ...records],
      edges: latest ? [
        e('producer', `partition-${selected}`, { active: true, tone: 'green', fromPort: 'right', toPort: 'left', via: [[270, 270], [270, partitionY + 45]] }),
        e(`partition-${selected}`, latest.id, { active: true, tone: 'green', fromPort: 'right', toPort: 'left',
          via: latest.offset === 1 ? [[545, partitionY + 45], [545, 125], [825, 125], [825, latest.y + 50]] : [[545, partitionY + 45], [545, latest.y + 50]] }),
      ] : [],
    }
  },
  'ordered-retry': step => {
    const state = orderedRetryState(step)
    const keyTones: Record<string, Tone> = { 'transfer-a': 'blue', 'transfer-b': 'teal' }
    const slots = { partition: [40, 105, 0, 95], consumer: [480, 105, 0, 0], line: [290, 390, 185, 0], done: [900, 105, 0, 95] } as const
    const records = state.records.map(record => {
      const [x, y, dx, dy] = slots[record.where]
      const tone = record.where === 'consumer' ? 'red' : record.where === 'done' ? 'green' : keyTones[record.key]
      return n(record.id, record.key, x + record.position * dx, y + record.position * dy, tone, {
        w: 170, h: 85, small: true, offset: record.offset, motion: true,
        detail: record.where === 'consumer' ? `${record.type} · failed` : record.type,
      })
    })
    return {
      title: 'Redirect: one waiting line per key', height: 500, caption: `Redirect · ${state.caption}`,
      groups: [
        g('partition', 'Partition 1 · unread', 20, 60, 210, 430, 'orange'),
        g('consumer', 'Disbursements', 270, 60, 590, 150, 'purple'),
        g('redirect', 'disbursements.redirect · entry per event', 270, 222, 590, 100, 'yellow'),
        g('line', 'disbursements.retry.* · waiting events', 270, 335, 590, 155, 'yellow'),
        g('done', 'Handled', 880, 60, 210, 430, 'green'),
      ],
      nodes: [...records, ...state.redirect.map((entry, i) => n(`rd-${entry.offset}`, `${entry.tombstone ? '∅ ' : ''}${entry.type}`, 285 + i * 192, 262, entry.tombstone ? 'muted' : 'yellow', { w: 185, h: 56, small: true, motion: true, detail: entry.tombstone ? 'transfer-a · tombstone' : 'transfer-a' }))],
      edges: [],
    }
  },
  'unordered-retry': step => {
    const state = unorderedRetryState(step)
    const keyTones: Record<string, Tone> = { 'transfer-a': 'blue', 'transfer-b': 'teal', 'transfer-c': 'purple', 'transfer-d': 'pink' }
    const slots = { partition: [40, 105, 0, 95], consumer: [480, 105, 0, 0], line: [290, 390, 185, 0], done: [900, 105, 0, 95] } as const
    const records = state.records.map(record => {
      const [x, y, dx, dy] = slots[record.where]
      const tone = record.where === 'consumer' ? 'red' : record.where === 'done' ? 'green' : keyTones[record.key]
      return n(record.id, record.key, x + record.position * dx, y + record.position * dy, tone, {
        w: 170, h: 85, small: true, offset: record.offset, motion: true,
        detail: record.where === 'consumer' ? `${record.type} · failed` : record.type,
      })
    })
    return {
      title: 'Other transfers keep going', height: 500, caption: step === 0 ? 'Other transfers keep going' : `Retry · ${state.caption}`,
      groups: [
        g('partition', 'Partition 1 · unread', 20, 60, 210, 430, 'orange'),
        g('consumer', 'Disbursements', 270, 60, 590, 150, 'purple'),
        g('line', 'disbursements.retry.5m', 270, 335, 590, 155, 'yellow'),
        g('done', 'Handled', 880, 60, 210, 430, 'green'),
      ],
      nodes: records,
      edges: [],
    }
  },
  'redirect-compaction': step => {
    const s = Math.max(0, Math.min(step, 3))
    const records: [string, string, string, string?][] = [
      ['r1', 'transfer-a', 'ev 1 · waiting'],
      ['r2', 'transfer-b', 'ev 2 · waiting', '#74c7ec'],
      ['r3', 'transfer-c', 'ev 3 · waiting', '#f5c2e7'],
      ['r4', 'transfer-b', 'ev 2 · ∅', '#74c7ec'],
      ['r5', 'transfer-c', 'ev 3 · ∅', '#f5c2e7'],
    ]
    return {
      title: 'Why .redirect is compacted', height: 520,
      caption: [
        'Waiting → record · handled → tombstone',
        'Match each event to its tombstone',
        'Only transfer-a is still waiting',
        'Replay .redirect to rebuild waiting keys',
      ][s],
      groups: [g('log', '.redirect · compacted', 20, 80, 1060, 190, 'yellow')],
      nodes: [
        ...records.map(([id, key, detail, mark], i) => {
          const gone = s >= 2 && mark !== undefined
          return n(id, key, 50 + i * 205, 140, detail.includes('∅') || gone ? 'muted' : 'yellow', {
            w: 180, h: 90, detail: gone ? detail.split(' · ')[0] + ' · gone' : detail,
            markBox: mark ? [1, mark] : undefined, crossAt: mark ? 2 : undefined,
          })
        }),
        n('consumer', 'consumer', 20, 390, 'blue', { w: 240, h: 100, detail: 'parked: { transfer-a }', hidden: s < 3, enter: true }),
      ],
      edges: s >= 3 ? [e('r1', 'consumer', { label: 'rebuild', tone: 'blue', active: true, fromPort: 'bottom', toPort: 'top' })] : [],
    }
  },
  replication: () => ({
    title: 'Replicate the partition log', height: 510,
    nodes: [
      n('collections', 'Collections', 455, 0, 'teal'),
      n('leader', 'collections · P0', 455, 185, 'teal', { detail: 'Leader · Broker 1' }),
      n('follower2', 'collections · P0', 155, 390, 'blue', { detail: 'Follower · Broker 2' }),
      n('follower3', 'collections · P0', 755, 390, 'purple', { detail: 'Follower · Broker 3' }),
    ],
    edges: [e('collections', 'leader', { label: 'produce', tone: 'teal' }), e('leader', 'follower2', { label: 'replicate P0 log', tone: 'blue', active: true }), e('leader', 'follower3', { label: 'replicate P0 log', tone: 'purple', active: true })],
  }),
  'worker-failure': () => ({
    title: 'Worker failure pauses the group', height: 510,
    groups: [g('group', 'Consumer group: disbursements', 20, 330, 1060, 165, 'purple')],
    nodes: [
      n('collections', 'Collections', 455, 0, 'teal'),
      n('topic', 'collections topic', 455, 175, 'orange', { detail: 'backlog 📈' }),
      n('w1', 'Worker 1', 100, 385, 'red', { detail: 'down 💥' }),
      n('w2', 'Worker 2', 455, 385, 'muted', { detail: 'paused ⏸' }),
      n('w3', 'Worker 3', 810, 385, 'muted', { detail: 'paused ⏸' }),
    ],
    edges: [e('collections', 'topic', { label: 'produce', tone: 'teal' }), e('topic', 'w1', { tone: 'red', active: true }), e('topic', 'w2', { dashed: true }), e('topic', 'w3', { dashed: true })],
  }),
  rebalance: step => {
    const phase = Math.max(0, Math.min(step, 4))
    const captions = [
      'Initial ownership: Worker 1 has P0 + P2; Worker 2 has P1.',
      'Worker 3 joins. Sticky assignment keeps P0 and P1 where they are.',
      'Round 1: revoke only P2 from Worker 1.',
      'Round 1 complete: P2 is released. No worker owns it.',
      'Round 2: Worker 3 receives P2; P0 and P1 stay put.',
    ]
    return {
      // Adapted from kafka-improvements' cooperative-sticky worker/pause lanes.
      title: 'Cooperative-sticky: move only P2', height: 540, caption: captions[phase],
      groups: [
        g('worker-1', 'Worker 1', 20, 150, 320, 190, 'purple'),
        g('worker-2', 'Worker 2', 390, 150, 320, 190, 'purple'),
        { ...g('worker-3', phase < 4 ? 'Worker 3 · joining' : 'Worker 3', 760, 150, 320, 190, phase < 4 ? 'muted' : 'teal'), hidden: phase < 1 },
        g('handoff', phase === 3 ? 'Revoked: P2 · P0 and P1 keep consuming'
          : phase === 2 ? 'Revoking P2 · P0 and P1 keep consuming'
            : 'Only revoked partitions pause; the rest keep consuming', 20, 370, 1060, 165, phase === 3 ? 'orange' : 'muted'),
      ],
      nodes: [
        n('topic', 'collections', 425, 45, 'orange', { w: 250, h: 70 }),
        n('p0', 'P0', 45, 240, 'green', { w: 125, h: 75, detail: 'consuming', small: true, motion: true }),
        n('p1', 'P1', 415, 240, 'green', { w: 125, h: 75, detail: 'consuming', small: true, motion: true }),
        n('p2', 'P2', phase === 3 ? 487.5 : phase === 4 ? 785 : 190, phase === 3 ? 440 : 240, phase === 3 ? 'red' : phase === 2 ? 'orange' : 'green', { w: 125, h: 75, detail: phase === 3 ? 'unassigned' : phase === 2 ? 'revoking' : 'consuming', small: true, motion: true }),
      ],
      edges: ['p0', 'p1', ...(phase < 2 || phase === 4 ? ['p2'] : [])].map(id => e('topic', id, { tone: 'green', active: true, fromPort: 'bottom', toPort: 'top' })),
    }
  },
  'bank-crash': step => ({
    title: 'Bank paid. Offset not committed.',
    nodes: [n('bank', 'Bank payment', 180, 185, 'green', { w: 240, h: 110, detail: 'Succeeded ✓' }), n('offset', 'Offset commit', 680, 185, 'muted', { w: 240, h: 110, detail: step >= 1 ? 'Never reached' : 'Pending' })],
    edges: [e('bank', 'offset', { label: step >= 1 ? 'CRASH' : '', tone: step >= 1 ? 'red' : 'muted', crash: step >= 1 })],
  }),
  retry: step => ({
    title: 'Retry: publish before committing',
    nodes: [n('topic', 'collections\ntopic', 90, 200, 'orange'), n('consumer', 'Disbursements', 455, 200, 'purple'), n('retry', 'disbursements\n.retry.5m', 820, 200, 'yellow')],
    edges: [
      e('topic', 'consumer', { label: 'consume', tone: step === 1 ? 'red' : 'muted', active: step === 1 }),
      e('consumer', 'retry', { label: 'publish retry', tone: step === 2 ? 'yellow' : 'muted', active: step === 2 }),
      e('consumer', 'topic', { label: 'commit offset', tone: step === 3 ? 'green' : 'muted', active: step === 3, fromPort: 'bottom', toPort: 'bottom', via: [[550, 410], [185, 410]], labelAt: [367, 410] }),
      e('retry', 'consumer', { label: 'consume when due', tone: step === 4 ? 'yellow' : 'muted', active: step === 4, fromPort: 'top', toPort: 'top', via: [[915, 75], [550, 75]], labelAt: [732, 75] }),
    ],
  }),
  dlq: step => ({
    title: 'Exhausted retries go to the DLQ',
    nodes: [n('retry', 'disbursements\n.retry.5m', 90, 200, 'yellow'), n('consumer', 'Disbursements', 455, 200, 'purple'), n('dlq', 'disbursements\n.dlq', 820, 200, 'red')],
    edges: [
      e('retry', 'consumer', { label: 'consume retry', tone: step === 1 ? 'red' : 'muted', active: step === 1 }),
      e('consumer', 'dlq', { label: 'publish DLQ', tone: step === 2 ? 'red' : 'muted', active: step === 2 }),
      e('consumer', 'retry', { label: 'commit retry offset', tone: step === 3 ? 'green' : 'muted', active: step === 3, fromPort: 'bottom', toPort: 'bottom', via: [[550, 410], [185, 410]], labelAt: [367, 410] }),
    ],
  }),
  'dual-write': step => ({
    title: 'DB committed. Event publication failed.',
    nodes: [n('db', 'Collections DB', 90, 200, 'green', { detail: step >= 1 ? 'Committed' : 'Pending' }), n('collections', 'Collections', 455, 200, 'teal'), n('kafka', 'Kafka', 820, 200, step >= 2 ? 'red' : 'blue', { detail: step >= 2 ? 'event not published' : 'Pending', markDetail: 3 })],
    edges: [
      e('collections', 'db', { label: 'save state', tone: step === 1 ? 'green' : 'muted', active: step === 1, fromPort: 'top', toPort: 'top', via: [[550, 75], [185, 75]], labelAt: [367, 75] }),
      e('db', 'collections', { label: 'committed', tone: step === 1 ? 'green' : 'muted', active: step === 1, fromPort: 'bottom', toPort: 'bottom', via: [[185, 410], [550, 410]], labelAt: [367, 410] }),
      e('collections', 'kafka', { label: 'publish event', tone: step >= 2 ? 'red' : 'muted', active: step >= 2, fromPort: 'top', toPort: 'top', via: [[550, 75], [915, 75]], labelAt: [732, 75] }),
      e('kafka', 'collections', { label: 'failed', tone: step >= 2 ? 'red' : 'muted', active: step >= 2, fromPort: 'bottom', toPort: 'bottom', via: [[915, 410], [550, 410]], labelAt: [732, 410] }),
    ],
  }),
  outbox: step => ({
    title: 'Save state and the outbox event together',
    nodes: [n('collections', 'Collections', 0, 175, 'teal', { h: 130 }), n('db', 'Collections DB', 225, 175, 'green', { h: 130, detail: 'state + outbox event', markDetail: 2 }), n('publisher', 'Outbox\npublisher', 450, 175, 'muted', { h: 130 }), n('topic', 'collections\ntopic', 675, 175, 'orange', { h: 130 }), n('consumer', 'Disbursements', 900, 175, 'purple', { h: 130 })],
    edges: [e('collections', 'db', { active: step >= 1 }), e('db', 'publisher', { active: step >= 1 }), e('publisher', 'topic', { active: step >= 1 }), e('topic', 'consumer', { active: step >= 1 })],
    groups: [g('transaction', 'Same DB transaction', 0, 95, 420, 240, 'green')],
  }),
  'relay-shapes': step => ({
    title: 'Outbox relay: publish, then mark published',
    nodes: [
      n('db', 'Postgres\noutbox', 90, 180, 'green', { h: 130, shape: 'database' }),
      n('publisher', 'Outbox\npublisher', 455, 200, 'teal'),
      n('topic', 'collections\ntopic', 820, 180, 'orange', { h: 130, shape: 'queue', detail: 'Kafka' }),
    ],
    edges: [
      e('db', 'publisher', { label: 'read', tone: step >= 3 ? 'red' : 'teal', active: step === 1 || step >= 3 }),
      e('publisher', 'topic', { label: 'publish', tone: 'orange', active: step === 1 || step === 4 }),
      e('publisher', 'db', { label: 'mark published', tone: 'green', active: step === 2, fromPort: 'bottom', toPort: 'bottom', via: [[550, 410], [185, 410]], labelAt: [367, 410] }),
    ],
  }),
  cdc: step => ({
    title: 'CDC relays committed outbox rows',
    nodes: [n('outbox', 'Postgres\noutbox', 0, 200, 'yellow'), n('wal', 'Postgres WAL', 300, 200, 'yellow'), n('cdc', 'Debezium\nCDC', 600, 200, 'muted'), n('kafka', 'Kafka', 900, 200, 'blue')],
    edges: [e('outbox', 'wal', { label: 'logged', tone: 'green', active: step === 1 }), e('wal', 'cdc', { label: 'decode', tone: 'yellow', active: step === 2 }), e('cdc', 'kafka', { label: 'publish', tone: 'blue', active: step === 3 })],
  }),
  'comparison-sync': () => ({
    title: 'Same slow bank: synchronous callers wait',
    nodes: [n('customer', 'Customer', 0, 200, 'red', { detail: 'waiting' }), n('collections', 'Collections', 300, 200, 'red', { detail: 'waiting' }), n('disbursements', 'Disbursements', 600, 200, 'red', { detail: 'waiting' }), n('bank', 'Partner Bank', 900, 200, 'red', { detail: 'slow / unavailable' })],
    edges: [e('customer', 'collections', { label: 'response', tone: 'red' }), e('collections', 'disbursements', { label: 'payout', tone: 'red' }), e('disbursements', 'bank', { label: 'bank call', tone: 'red' })],
  }),
  'comparison-async': () => ({
    title: 'Same slow bank: independent consumers',
    nodes: [n('collections', 'Collections', 0, 190, 'teal', { h: 120, detail: 'continues accepting work' }), n('topic', 'collections\ntopic', 300, 190, 'orange', { h: 120 }), n('disbursements', 'Disbursements', 600, 40, 'purple', { h: 120, detail: 'payouts delayed' }), n('reconciliation', 'Reconciliation', 600, 350, 'teal', { h: 120, detail: 'continues processing' }), n('bank', 'Partner Bank', 900, 40, 'red', { h: 120, detail: 'slow / unavailable' })],
    edges: [e('collections', 'topic', { label: 'publishes', tone: 'teal' }), e('topic', 'disbursements', { label: 'disbursements group', tone: 'purple', labelAt: [545, 175] }), e('topic', 'reconciliation', { label: 'reconciliation group', tone: 'teal', labelAt: [545, 330] }), e('disbursements', 'bank', { label: 'bank call', tone: 'red' })],
  }),
}
