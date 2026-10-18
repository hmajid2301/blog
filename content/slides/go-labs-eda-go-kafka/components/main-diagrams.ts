import { previews, type Diagram, type DiagramNode } from './diagram-previews.ts'

// Main-talk layouts retain room for the existing explanatory captions.
// The appendix is only a comparison gallery; no slide content is imported here.
const shapes: Record<string, Record<string, 'database' | 'queue'>> = {
  'event-flow': { 'collections-topic': 'queue', 'disbursements-topic': 'queue' },
  replication: { leader: 'queue', follower2: 'queue', follower3: 'queue' },
  'worker-failure': { topic: 'queue' },
  retry: { topic: 'queue', retry: 'queue' }, dlq: { retry: 'queue', dlq: 'queue' },
  'dual-write': { db: 'database', kafka: 'queue' }, outbox: { db: 'database', topic: 'queue' },
  'relay-shapes': { db: 'database', topic: 'queue' }, cdc: { outbox: 'database', kafka: 'queue' },
}

function place(diagram: Diagram, positions: Record<string, [number, number]>, width: number, height: number) {
  diagram.width = width
  diagram.height = height
  for (const node of diagram.nodes) if (positions[node.id]) [node.x, node.y] = positions[node.id]
}

function arc(diagram: Diagram, index: number, side: 'top' | 'bottom', y: number) {
  const edge = diagram.edges[index]
  const from = diagram.nodes.find(node => node.id === edge.from)!
  const to = diagram.nodes.find(node => node.id === edge.to)!
  const fromX = from.x + from.w / 2
  const toX = to.x + to.w / 2
  Object.assign(edge, {
    fromPort: side, toPort: side,
    via: [[fromX, y], [toX, y]], labelAt: [(fromX + toX) / 2, y],
  })
}

function logOverview(step: number): Diagram {
  const samples = [
    ['transfer-a collections.created.v1\ntransfer-c collections.completed.v1\ntransfer-a collections.updated.v1', 'transfer-d collections.created.v1'],
    ['transfer-n collections.created.v1\ntransfer-f collections.updated.v1\ntransfer-n collections.completed.v1', 'transfer-g collections.created.v1'],
    ['transfer-e collections.updated.v1\ntransfer-j collections.created.v1\ntransfer-i collections.completed.v1', 'transfer-h collections.created.v1'],
  ]
  const tones = ['teal', 'green', 'pink'] as const
  const group = (id: string, label: string, x: number, y: number, w: number, h: number, tone: DiagramNode['tone']): DiagramNode => ({ id, label, x, y, w, h, tone })
  const count = Math.max(0, Math.min(6, step))
  const destination = count ? (count - 1) % 3 : -1
  const appended: DiagramNode[] = Array.from({ length: count }, (_, index) => {
    const partition = index % 3
    const x = 60 + partition * 355
    return {
      ...group(`append-${index}`, `transfer-${['o', 'k', 'p', 'q', 'r', 'l'][index]}`, x, 405 + Math.floor(index / 3) * 90, 270, 85, tones[partition]),
      detail: 'collections.created.v1', small: true,
      offset: 4 + Math.floor(index / 3),
      arrival: index === count - 1 ? { from: [410, 5], via: [x, 270] } : undefined,
    }
  })
  return {
    title: 'Topic: collections · illustrative round-robin appends', height: 620,
    groups: [group('topic', 'Topic: collections', 10, 0, 1080, 610, 'orange'),
      ...samples.map((_, id) => group(`partition-${id}`, `Partition ${id}${id === destination ? ' ← append' : ''}`, 30 + id * 355, 60, 330, 535, id === destination ? 'orange' : tones[id])),
      ...samples.map((_, id) => group(`p${id}-segment`, '001.log · active', 45 + id * 355, 300, 300, 290, tones[id]))],
    nodes: [group('producer', 'Incoming events', 385, 5, 340, 45, 'orange'),
      ...samples.flatMap(([closed, active], id) => [
        { ...group(`p${id}-closed`, '000.log · closed', 45 + id * 355, 110, 300, 140, tones[id]), detail: closed, small: true },
        { ...group(`p${id}-active`, `offset 3 · ${active.split(' ')[0]}`, 60 + id * 355, 340, 270, 55, tones[id]), detail: active.split(' ')[1], small: true },
      ]), ...appended],
    edges: samples.map((_, id) => ({ from: `p${id}-closed`, to: `p${id}-active`, tone: tones[id], label: 'rollover', labelAt: [195 + id * 355, 275] })),
  }
}

function redirectOverview(step: number): Diagram {
  const redirected = step >= 1
  return {
    title: 'Redirect prevents later events overtaking a failed event', width: 1000, height: 470,
    groups: [{ id: 'kafka', label: 'Kafka', x: 0, y: 0, w: 310, h: 450, tone: 'orange' }],
    nodes: [
      { id: 'topic', label: 'collections', x: 30, y: 50, w: 240, h: 110, shape: 'queue', tone: 'orange' },
      { id: 'consumer', label: 'Disbursements', detail: step >= 3 ? 'transfer-b handled ✓' : step === 2 ? 'transfer-a must wait' : step === 1 ? 'transfer-a failed' : 'handle events', x: 650, y: 170, w: 270, h: 110, tone: step >= 3 ? 'green' : step === 1 ? 'red' : 'purple' },
      { id: 'redirect', label: 'redirect', detail: redirected ? 'transfer-a must queue' : 'empty', x: 30, y: 180, w: 240, h: 110, shape: 'queue', tone: redirected ? 'yellow' : 'muted' },
      { id: 'retry', label: 'retry', detail: step >= 2 ? 'transfer-a: first → next' : step === 1 ? 'transfer-a: first event' : 'empty', x: 30, y: 310, w: 240, h: 130, shape: 'queue', tone: 'yellow' },
    ],
    edges: [
      { from: 'topic', to: 'consumer', label: step >= 3 ? 'transfer-b' : step === 2 ? 'later transfer-a event' : 'events', tone: step >= 3 ? 'green' : 'orange', active: true, fromPort: 'right', toPort: 'top', via: [[785, 105]], labelAt: [480, 80] },
      { from: 'consumer', to: 'redirect', label: 'redirect this key', tone: redirected ? 'yellow' : 'muted', active: step === 1 || step === 2, dashed: true, fromPort: 'left', toPort: 'right', labelAt: [460, 200] },
      { from: 'consumer', to: 'retry', label: 'transfer-a → retry', tone: 'yellow', active: step === 1 || step === 2, fromPort: 'bottom', toPort: 'right', via: [[785, 375]], labelAt: [480, 350] },
    ],
  }
}

function metricOverview(step: number): Diagram {
  const phase = Math.max(0, Math.min(3, step))
  if (phase >= 2) {
    const dlq = phase === 3
    const keys = ['transfer-a', 'transfer-c', 'transfer-b', 'transfer-d', 'transfer-e', 'transfer-f', 'transfer-g', 'transfer-h', 'transfer-i', 'transfer-j', 'transfer-k', 'transfer-l']
    return {
      title: dlq ? 'Twelve unresolved DLQ events' : 'Twelve events waiting to retry', width: 1100, height: 380,
      groups: [{ id: 'topic', label: dlq ? 'Kafka · disbursements.dlq · unresolved events' : 'Kafka · disbursements.retry.*', x: 15, y: 25, w: 1070, h: 325, tone: dlq ? 'red' : 'yellow' }],
      nodes: keys.map((key, i) => ({
        id: key, label: key, detail: dlq ? 'needs attention' : `retry-count: ${i % 2 + 1}`,
        x: 45 + (i % 6) * 170, y: 90 + Math.floor(i / 6) * 120, w: 150, h: 95,
        small: true, tone: dlq ? 'red' : 'yellow',
      })),
      edges: [],
    }
  }
  if (phase === 1) {
    const rows = [['transfer-a', '09:00', 'NULL'], ['transfer-c', '09:04', 'NULL'], ['transfer-b', '08:59', '08:59:01']]
    const columns = [{ x: 45, w: 220 }, { x: 265, w: 350 }, { x: 615, w: 440 }]
    return {
      title: 'Oldest unpublished outbox row: transfer-a, five minutes old', width: 1100, height: 380,
      groups: [{ id: 'db', label: 'Collections DB · outbox table', x: 15, y: 65, w: 1070, h: 295, tone: 'blue' }],
      nodes: [
        { id: 'clock', label: 'Now: 09:05', x: 805, y: 0, w: 250, h: 50, tone: 'blue' },
        ...['event_id', 'created_at', 'published_at'].map((label, i): DiagramNode => ({ id: `header-${i}`, label, ...columns[i], y: 110, h: 50, tone: 'blue' })),
        ...rows.flatMap((row, index) => row.map((label, column): DiagramNode => ({
          id: `row-${index}-${column}`, label, ...columns[column], y: 160 + index * 60, h: 60,
          tone: index === 0 ? 'orange' : index === 1 ? 'yellow' : 'muted',
        }))),
      ],
      edges: [],
    }
  }
  return {
    title: 'Partition lag: log end 47 minus committed next offset 42 equals five', width: 1100, height: 380,
    groups: [
      { id: 'partition', label: 'collections · Partition 0', x: 15, y: 100, w: 1070, h: 225, tone: 'orange' },
      { id: 'lag', label: 'Lag', x: 315, y: 145, w: 745, h: 155, tone: 'yellow' },
    ],
    nodes: [
      ...['transfer-f', 'transfer-m', 'transfer-a', 'transfer-c', 'transfer-b', 'transfer-d', 'transfer-e'].map((label, i): DiagramNode => ({
        id: `record-${i}`, label, offset: 40 + i, x: 40 + i * 145, y: 190, w: 125, h: 90, tone: i < 2 ? 'muted' : 'yellow',
      })),
      { id: 'committed', label: 'Committed next: 42', x: 300, y: 20, w: 260, h: 55, tone: 'blue' },
      { id: 'log-end', label: 'Log end: 47', x: 805, y: 20, w: 250, h: 55, tone: 'blue' },
      { id: 'end', label: '', x: 1050, y: 190, w: 10, h: 90, tone: 'blue' },
    ],
    edges: [
      { from: 'committed', to: 'record-2', tone: 'blue', fromPort: 'bottom', toPort: 'top' },
      { from: 'log-end', to: 'end', tone: 'blue', fromPort: 'bottom', toPort: 'top' },
    ],
  }
}

function shutdownContexts(step: number): Diagram {
  const signaled = step >= 1
  const finished = step >= 2
  return {
    title: 'SIGTERM stops polling; independent work context finishes the current record', width: 1100, height: 530,
    nodes: [
      { id: 'signal', label: 'SIGTERM', detail: signaled ? 'received' : 'not received', x: 30, y: 40, w: 220, h: 100, tone: signaled ? 'red' : 'muted' },
      { id: 'poll-context', label: 'pollCtx', detail: signaled ? 'canceled' : 'active', x: 350, y: 40, w: 230, h: 100, tone: signaled ? 'red' : 'blue', markBox: [1, '#f38ba8'] },
      { id: 'poll', label: 'PollRecords', detail: signaled ? 'no more polling' : 'fetch next record', x: 740, y: 40, w: 320, h: 100, tone: signaled ? 'muted' : 'blue' },
      { id: 'root', label: 'Background()', detail: 'separate root', x: 30, y: 230, w: 220, h: 110, tone: 'purple' },
      { id: 'work-context', label: 'workCtx', detail: '10s deadline', x: 350, y: 230, w: 230, h: 110, tone: finished ? 'muted' : 'green', markBox: [1, '#a6e3a1'] },
      { id: 'record', label: 'transfer-a', detail: finished ? 'handled ✓' : 'already processing', offset: 42, x: 740, y: 230, w: 320, h: 110, tone: finished ? 'green' : 'yellow' },
      { id: 'commit', label: 'Commit next: 43', detail: finished ? 'acknowledged ✓' : 'only after success', x: 740, y: 410, w: 320, h: 90, tone: finished ? 'green' : 'muted' },
      { id: 'close', label: 'client.Close()', detail: finished ? 'leave group' : 'after loop exits', x: 350, y: 410, w: 230, h: 90, tone: finished ? 'green' : 'muted' },
    ],
    edges: [
      { from: 'signal', to: 'poll-context', tone: signaled ? 'red' : 'muted', active: step === 1, fromPort: 'right', toPort: 'left' },
      { from: 'poll-context', to: 'poll', tone: signaled ? 'red' : 'blue', dashed: signaled, active: !signaled, fromPort: 'right', toPort: 'left' },
      { from: 'root', to: 'work-context', tone: 'purple', fromPort: 'right', toPort: 'left' },
      { from: 'work-context', to: 'record', tone: 'green', active: !finished, fromPort: 'right', toPort: 'left' },
      { from: 'record', to: 'commit', tone: finished ? 'green' : 'muted', active: finished, fromPort: 'bottom', toPort: 'top' },
      { from: 'commit', to: 'close', tone: finished ? 'green' : 'muted', active: finished, fromPort: 'left', toPort: 'right' },
    ],
  }
}

function dlqReplay(step: number): Diagram {
  const copied = step >= 1
  const handled = step >= 2
  return {
    title: 'Deliberate DLQ replay copies the record; the original remains retained', width: 1100, height: 440,
    groups: [
      { id: 'dlq-topic', label: 'disbursements.dlq', x: 15, y: 30, w: 350, h: 360, tone: 'red' },
      { id: 'retry-topic', label: 'disbursements.retry.5m', x: 425, y: 30, w: 350, h: 360, tone: 'yellow' },
    ],
    nodes: [
      { id: 'original', label: 'transfer-a', detail: 'original retained', offset: 7, x: 45, y: 185, w: 290, h: 135, tone: 'red' },
      { id: 'copy', label: 'transfer-a', detail: 'same identity', offset: 18, x: 455, y: 185, w: 290, h: 135, tone: handled ? 'green' : 'yellow', hidden: !copied, enter: true },
      { id: 'handler', label: 'Retry worker', detail: handled ? 'transfer-a handled ✓' : 'waiting', x: 840, y: 185, w: 245, h: 135, tone: handled ? 'green' : 'muted' },
    ],
    edges: [
      ...(copied ? [{ from: 'original', to: 'copy', label: 'copy', tone: 'yellow' as const, active: step === 1, fromPort: 'top' as const, toPort: 'top' as const, via: [[190, 115], [600, 115]] as [number, number][], labelAt: [395, 95] as [number, number] }] : []),
      ...(handled ? [{ from: 'copy', to: 'handler', tone: 'green' as const, active: true, fromPort: 'right' as const, toPort: 'left' as const }] : []),
    ],
  }
}

export function talkDiagram(key: string, step: number): Diagram {
  if (key === 'dlq-replay') return dlqReplay(step)
  if (key === 'shutdown-contexts') return shutdownContexts(step)
  if (key === 'metric-overview') return metricOverview(step)
  if (key === 'redirect-intro') return redirectOverview(step)
  if (key === 'partition-log') return logOverview(step)
  const previewStep = key === 'rebalance' ? [0, 1, 3, 4][Math.max(0, Math.min(3, step))]
    : key === 'dlq' ? Math.max(0, step - 1) : step
  const source = previews[key](previewStep)
  const diagram: Diagram = {
    ...source,
    nodes: source.nodes.map(node => {
      const shape = shapes[key]?.[node.id] ?? node.shape
      const h = shape ? Math.max(130, node.h) : node.h
      return { ...node, shape, h, y: node.y - (h - node.h) / 2, markDetail: undefined }
    }),
    edges: source.edges.map(edge => ({ ...edge })),
    groups: source.groups?.map(group => ({ ...group })),
  }
  if (key === 'happy-path' || key === 'slow-bank') {
    place(diagram, { customer: [205, 0], collections: [205, 140], disbursements: [205, 280], bank: [430, 430], notifications: [0, 430] }, 630, 540)
    Object.assign(diagram.edges[2], { fromPort: 'bottom', toPort: 'top', labelAt: [490, 395] })
    Object.assign(diagram.edges[3], { fromPort: 'bottom', toPort: 'top', labelAt: [120, 395] })
    if (key === 'slow-bank') {
      const phase = Math.max(0, Math.min(3, step))
      const waiting = [0, 3, 40, 300][phase]
      for (const node of diagram.nodes) {
        if (node.id === 'bank') Object.assign(node, { tone: phase >= 1 ? 'red' : 'green', detail: phase >= 1 ? 'unavailable' : undefined })
        if (node.id === 'disbursements' && phase >= 1) Object.assign(node, { tone: 'red', detail: `${waiting} waiting` })
        if (node.id === 'collections' && phase >= 2) Object.assign(node, { tone: 'red', detail: `${waiting} waiting` })
        if (node.id === 'customer' && phase >= 3) Object.assign(node, { tone: 'red', detail: `${waiting} waiting` })
        if (node.id === 'notifications' && phase >= 1) Object.assign(node, { tone: 'muted', detail: 'receipts wait' })
      }
      if (phase >= 3) {
        diagram.edges[0].label = 'client retries'
        diagram.edges[1].label = 'repeat request'
        for (const [from, to, y] of [['customer', 'collections', 100], ['collections', 'disbursements', 240]] as const) {
          for (const x of [170, 430]) diagram.edges.push({
            from, to, tone: 'red', dashed: true, fromPort: 'bottom', toPort: 'top', via: [[x, y], [x, y + 30]],
          })
        }
      }
    }
  } else if (key === 'event-flow') {
    place(diagram, { collections: [80, 0], 'collections-topic': [80, 160], disbursements: [80, 360], bank: [430, 360], 'disbursements-topic': [80, 530], notifications: [430, 550] }, 650, 680)
    Object.assign(diagram.edges[0], { fromPort: 'bottom', toPort: 'top', via: undefined, labelAt: [320, 125] })
    Object.assign(diagram.edges[3], { fromPort: 'bottom', toPort: 'top', labelAt: [320, 490] })
    if (step >= 4) {
      for (const node of diagram.nodes) {
        if (node.id === 'collections') Object.assign(node, { tone: 'green', detail: 'still charging' })
        if (node.id === 'collections-topic') Object.assign(node, { tone: 'yellow', detail: 'lag grows' })
        if (node.id === 'disbursements') Object.assign(node, { tone: 'yellow', detail: 'payouts waiting' })
        if (node.id === 'bank') Object.assign(node, { tone: 'red', detail: 'unavailable' })
        if (node.id === 'notifications') Object.assign(node, { tone: 'muted', detail: 'receipts wait' })
      }
      Object.assign(diagram.edges[0], { tone: 'green' })
      Object.assign(diagram.edges[1], { tone: 'yellow' })
      Object.assign(diagram.edges[2], { tone: 'red', label: 'failed payout' })
      for (const edge of diagram.edges.slice(3)) Object.assign(edge, { active: false, tone: 'muted' })
    }
  } else if (key === 'bank-crash') {
    const replay = step >= 2
    const keyed = step >= 3
    const crashed = step === 1
    diagram.width = 1100
    diagram.height = 440
    diagram.groups = [{ id: 'service', label: 'Disbursements service', x: 300, y: 10, w: 300, h: 390, tone: crashed ? 'red' : 'purple' }]
    diagram.nodes = [
      { id: 'kafka', label: 'Kafka · collections', detail: 'transfer-a · offset 42', x: 10, y: 130, w: 210, h: 130, shape: 'queue', tone: 'orange' },
      { id: 'consume', label: replay ? 'Replay event' : 'Consume event', detail: replay ? 'same offset 42' : 'offset 42', x: 340, y: 75, w: 220, h: 75, tone: replay ? 'yellow' : 'purple' },
      { id: 'pay', label: 'Call bank', detail: keyed ? 'same key: transfer-a' : 'no idempotency key', x: 340, y: 195, w: 220, h: 75, tone: keyed ? 'green' : 'purple' },
      { id: 'offset', label: 'Commit offset', detail: replay ? 'next offset: 43 ✓' : crashed ? 'Never reached' : 'Pending', x: 340, y: 315, w: 220, h: 75, tone: replay ? 'green' : 'muted' },
      { id: 'bank', label: 'Partner Bank', detail: keyed ? 'Already paid ✓' : replay ? 'Paid twice ✗' : 'Paid once ✓', x: 810, y: 185, w: 240, h: 95, tone: replay && !keyed ? 'red' : 'green' },
    ]
    diagram.edges = [
      { from: 'kafka', to: 'consume', label: replay ? 'restart → replay' : 'deliver', tone: replay ? 'yellow' : 'orange', active: true, fromPort: 'right', toPort: 'left', via: [[260, 195], [260, 112.5]], labelAt: [170, 85] },
      { from: 'consume', to: 'pay', tone: 'purple', active: true },
      { from: 'pay', to: 'bank', label: replay ? 'call again' : 'payout', tone: replay && !keyed ? 'red' : 'green', active: true },
      { from: 'pay', to: 'offset', label: crashed ? 'CRASH' : '', tone: crashed ? 'red' : replay ? 'green' : 'muted', crash: crashed, active: replay, labelAt: [545, 293] },
      { from: 'offset', to: 'kafka', label: replay ? 'commit 43' : 'not committed', tone: replay ? 'green' : 'muted', active: replay, dashed: !replay, fromPort: 'bottom', toPort: 'bottom', via: [[450, 425], [115, 425]], labelAt: [200, 405] },
    ]
  } else if (['retry', 'dlq', 'relay-shapes'].includes(key)) {
    diagram.width = 1100
    diagram.height = 375
    diagram.nodes.forEach((node, index) => {
      node.x = 20 + index * 425
      node.y = node.shape ? 140 : 160
    })
    Object.assign(diagram.edges[0], { fromPort: 'right', toPort: 'left', labelAt: [332, 205] })
    Object.assign(diagram.edges[1], { fromPort: 'right', toPort: 'left', labelAt: [757, 205] })
    arc(diagram, 2, 'bottom', 335)
    if (key === 'retry') arc(diagram, 3, 'top', 60)
    if (key === 'dlq') {
      diagram.nodes[0].label = step === 0 ? 'disbursements\n.retry.5m' : 'disbursements\n.retry.30m'
      diagram.nodes[0].detail = step === 0 ? 'transfer-a · count 1' : 'transfer-a · count 2'
      diagram.nodes[1].detail = step === 1 ? '5m retry failed' : step >= 2 ? 'transfer-a · count 3\nexhausted' : undefined
      diagram.nodes[1].small = true
      diagram.nodes[2].detail = step >= 3 ? 'transfer-a · count 3' : undefined
      if (step === 1) {
        diagram.edges.push({ from: 'consumer', to: 'retry', label: 'publish next tier · count 2', tone: 'yellow', active: true })
        arc(diagram, 3, 'top', 60)
      }
    }
    if (key === 'relay-shapes') diagram.edges[2].label = 'delete + commit'
  } else if (key === 'dual-write') {
    diagram.width = 620
    diagram.nodes.forEach((node, index) => { node.x = index * 210 })
    arc(diagram, 0, 'top', 75)
    arc(diagram, 1, 'bottom', 410)
    arc(diagram, 2, 'top', 75)
    arc(diagram, 3, 'bottom', 410)
    if (step >= 3) {
      diagram.title = 'Event published. DB write failed.'
      Object.assign(diagram.nodes[0], { tone: 'red', detail: 'Write failed' })
      Object.assign(diagram.nodes[2], { tone: 'green', detail: 'Published · ghost event' })
      Object.assign(diagram.edges[0], { tone: 'red', active: true })
      Object.assign(diagram.edges[1], { label: 'failed', tone: 'red', active: true })
      Object.assign(diagram.edges[2], { label: 'publish first', tone: 'green', active: true })
      Object.assign(diagram.edges[3], { label: 'published', tone: 'green', active: true })
    }
  } else if (key === 'outbox') {
    place(diagram, { collections: [20, 70], db: [20, 240], publisher: [350, 240], topic: [350, 430], consumer: [20, 430] }, 560, 580)
    diagram.groups = [{ id: 'transaction', label: 'Same DB transaction', x: 0, y: 0, w: 250, h: 400, tone: step >= 1 ? 'green' : 'muted' }]
    Object.assign(diagram.nodes[1], {
      tone: step >= 1 ? 'green' : 'muted',
      detail: step === 2 ? 'state saved\noutbox: transfer-a retained' : step >= 1 ? 'state saved\noutbox: transfer-a' : 'Pending',
    })
    Object.assign(diagram.nodes[2], {
      tone: step === 2 ? 'red' : step >= 3 ? 'green' : 'muted',
      detail: step === 2 ? 'CRASH' : step >= 3 ? 'Restarted ✓' : 'Waiting',
    })
    diagram.nodes[3].detail = step >= 3 ? 'transfer-a published' : 'No event yet'
    Object.assign(diagram.nodes[4], { tone: step >= 4 ? 'green' : 'muted', detail: step >= 4 ? 'transfer-a handled ✓' : 'Waiting' })
    for (const [index, edge] of diagram.edges.entries()) {
      const stage = index === 0 ? 1 : index === 3 ? 4 : 3
      Object.assign(edge, { active: step === stage, tone: step >= stage ? 'green' : 'muted' })
    }
  } else if (key === 'cdc') {
    place(diagram, { outbox: [20, 60], wal: [350, 60], cdc: [350, 350], kafka: [20, 350] }, 610, 520)
    for (const node of diagram.nodes) node.h = 130
  } else if (key === 'replication') {
    for (const node of diagram.nodes.filter(node => node.shape === 'queue')) {
      node.x -= 30
      node.w += 60
    }
  } else if (key === 'worker-failure') {
    diagram.title = 'Worker failure: reassign and replay'
    diagram.caption = [
      'P0: transfer-a is in flight. Committed next offset: 42.',
      'Worker 1 dies. P0 waits; P1 and P2 keep their owners.',
      'P0 is reassigned to Worker 2.',
      'Worker 2 resumes P0 from offset 42: transfer-a is replayed.',
    ][Math.max(0, Math.min(3, step))]
    diagram.height = 580
    for (const node of diagram.nodes) node.y += 50
    for (const group of diagram.groups ?? []) { group.y += 50; group.h = 190 }
    diagram.nodes[1].detail = 'P0: next offset 42'
    Object.assign(diagram.nodes[2], { h: 130, small: true, tone: step >= 1 ? 'red' : 'green', detail: step >= 1 ? 'down · P0 unassigned' : 'P0 · transfer-a in flight', offset: step === 0 ? 42 : undefined })
    Object.assign(diagram.nodes[3], { h: 130, small: true, tone: 'green', detail: step >= 3 ? 'P1 + P0\ntransfer-a replayed' : step >= 2 ? 'P1 + P0 assigned' : 'P1 · running', offset: step >= 3 ? 42 : undefined })
    Object.assign(diagram.nodes[4], { h: 130, small: true, tone: 'green', detail: 'P2 · running' })
    Object.assign(diagram.edges[0], { active: true })
    Object.assign(diagram.edges[1], { label: 'P0', active: step === 0, tone: step === 0 ? 'green' : 'muted', dashed: step >= 1 })
    Object.assign(diagram.edges[2], { label: step >= 2 ? 'P1 + P0' : 'P1', active: true, tone: 'green', dashed: false })
    Object.assign(diagram.edges[3], { label: 'P2', active: true, tone: 'green', dashed: false })
  } else if (key === 'rebalance') {
    diagram.height = 490
    diagram.caption = [
      'Two workers share three partitions.',
      'Worker 3 joins.',
      'P2 pauses; P0 and P1 keep consuming.',
      'P2 resumes on Worker 3.',
    ][Math.max(0, Math.min(3, step))]
    diagram.groups = diagram.groups?.filter(group => group.id !== 'handoff')
    for (const node of diagram.nodes) {
      node.motion = false
      if (node.id === 'p2' && previewStep === 3) {
        node.y = 385
        node.detail = 'paused'
        node.arrival = { from: [190, 240], via: [190, 385] }
      } else if (node.id === 'p2' && previewStep === 4) {
        node.arrival = { from: [487.5, 385], via: [785, 385] }
      }
    }
  }
  return diagram
}
