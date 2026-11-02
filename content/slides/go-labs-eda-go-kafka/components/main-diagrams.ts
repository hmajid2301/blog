import { previews, type Diagram, type DiagramNode } from './diagram-previews.ts'
import { retryDelays, retryProgressState } from './demo-states.ts'

// Main-talk layouts retain room for the existing explanatory captions.
const shapes: Record<string, Record<string, 'database' | 'queue'>> = {
  'event-flow': { 'collections-topic': 'queue', 'disbursements-topic': 'queue' },
  'consumer-failure': { topic: 'queue' },
  retry: { topic: 'queue', retry: 'queue' }, dlq: { retry: 'queue', dlq: 'queue' },
  outbox: { db: 'database', topic: 'queue' },
  'relay-shapes': { db: 'database', topic: 'queue' },
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

function partitionLog(step: number): Diagram {
  const count = Math.max(0, Math.min(6, step))
  const tones = ['teal', 'green', 'pink'] as const
  const samples = [['a', 'c', 'a', 'd'], ['n', 'f', 'n', 'g'], ['e', 'j', 'i', 'h']]
  const destination = step >= 8 ? -1 : step === 7 ? 0 : count ? (count - 1) % 3 : -1
  return {
    title: 'Three independent partition logs; offsets increase within each partition', width: 1100, height: 620,
    groups: [
      { id: 'topic', label: 'Topic: collections', x: 10, y: 0, w: 1080, h: 610, tone: 'orange' },
      ...samples.map((_, index): DiagramNode => ({
        id: `partition-${index}`, label: step >= 8 ? `Partition ${index} · 0 → 1 → 2 → …` : `Partition ${index}`, x: 30 + index * 355, y: step >= 8 ? 50 : 60, w: 330, h: step >= 8 ? 545 : 535,
        tone: destination === index ? (step >= 7 ? 'red' : 'orange') : tones[index],
      })),
    ],
    nodes: [
      { id: 'producer', label: step >= 8 ? 'Ordered within a partition. No order across partitions.' : 'Incoming events', x: step >= 8 ? 320 : 385, y: 5, w: step >= 8 ? 760 : 340, h: 45, tone: 'orange' },
      ...samples.flatMap((keys, partition) => keys.map((key, offset): DiagramNode => ({
        id: `p${partition}-${offset}`, label: `collection-${key}`, offset,
        x: 60 + partition * 355, y: 105 + offset * 80, w: 270, h: 65, tone: tones[partition],
        markBox: key === 'a' ? [7, '#f38ba8'] : undefined,
      }))),
      ...Array.from({ length: count }, (_, index): DiagramNode => {
        const partition = index % 3
        const x = 60 + partition * 355
        return {
          id: `append-${index}`, label: `collection-${['o', 'k', 'p', 'q', 'r', 'l'][index]}`,
          offset: 4 + Math.floor(index / 3), x, y: 425 + Math.floor(index / 3) * 80,
          w: 270, h: 65, tone: tones[partition],
          arrival: step <= 6 && index === count - 1 ? { from: [410, 5], via: [x, 80] } : undefined,
        }
      }),
    ],
    edges: [],
  }
}

function brokerScaling(step: number): Diagram {
  const tones = ['teal', 'green', 'pink'] as const
  const spread = step >= 1
  const brokers = spread ? [0, 1, 2] : [0]
  const brokerX = (index: number) => spread ? 10 + index * 370 : 380
  return {
    title: spread ? 'Three partitions spread across three brokers, each with its own resources' : 'Three partitions sharing one broker’s resources',
    width: 1100, height: 460,
    groups: brokers.map(index => ({
      id: `broker-${index}`, label: `Broker ${index + 1}`,
      x: brokerX(index), y: 10, w: 340, h: 430, tone: 'blue',
    })),
    nodes: [
      ...tones.map((tone, index) => ({
        id: `partition-${index}`, label: `Partition ${index}`,
        x: brokerX(index) + 25, y: spread ? 170 : 80 + index * 85,
        w: 290, h: 65, tone, motion: true,
      })),
      ...brokers.map((index): DiagramNode => ({
        id: `resources-${index}`, label: 'CPU · network · disk',
        x: brokerX(index) + 25, y: 350, w: 290, h: 65,
        tone: 'blue', motion: true, enter: spread && index > 0,
      })),
    ],
    edges: [],
  }
}

function logSegments(step: number): Diagram {
  const samples = [
    ['collection-a collections.created.v1\ncollection-c collections.completed.v1\ncollection-a collections.updated.v1', 'collection-d collections.created.v1'],
    ['collection-n collections.created.v1\ncollection-f collections.updated.v1\ncollection-n collections.completed.v1', 'collection-g collections.created.v1'],
    ['collection-e collections.updated.v1\ncollection-j collections.created.v1\ncollection-i collections.completed.v1', 'collection-h collections.created.v1'],
  ]
  const tones = ['teal', 'green', 'pink'] as const
  const group = (id: string, label: string, x: number, y: number, w: number, h: number, tone: DiagramNode['tone']): DiagramNode => ({ id, label, x, y, w, h, tone })
  const count = Math.max(0, Math.min(6, step))
  const destination = count ? (count - 1) % 3 : -1
  const appended: DiagramNode[] = Array.from({ length: count }, (_, index) => {
    const partition = index % 3
    const x = 60 + partition * 355
    return {
      ...group(`append-${index}`, `collection-${['o', 'k', 'p', 'q', 'r', 'l'][index]}`, x, 405 + Math.floor(index / 3) * 90, 270, 85, tones[partition]),
      detail: 'collections.created.v1', small: true,
      offset: 4 + Math.floor(index / 3),
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

function bankResponseLost(step: number): Diagram {
  const phase = Math.max(0, Math.min(4, step))
  return {
    title: 'The bank pays once, loses its response, then returns the original result for the same payment key',
    width: 1100, height: 560,
    groups: [
      { id: 'service', label: 'Disbursements', x: 0, y: 10, w: 320, h: 440, tone: 'purple' },
      { id: 'bank-service', label: 'Bank', x: 780, y: 10, w: 320, h: 440, tone: 'blue' },
    ],
    nodes: [
      { id: 'caller', label: phase >= 3 ? 'Retry payout' : 'Request payout', x: 25, y: 90, w: 270, h: 100, tone: 'purple' },
      { id: 'bank', label: 'Payment API', x: 805, y: 90, w: 270, h: 100, tone: 'blue' },
      { id: 'known', label: phase >= 4 ? 'Paid ✓' : phase >= 2 ? 'Result unknown' : 'Waiting', x: 25, y: 310, w: 270, h: 100, tone: phase >= 4 ? 'green' : phase >= 2 ? 'yellow' : 'muted' },
      { id: 'payment', label: 'Paid once ✓', detail: 'key: collection-a\npayment-7', x: 805, y: 295, w: 270, h: 130, tone: 'green', hidden: phase < 1, small: true, enter: phase === 1 },
      { id: 'request', label: 'collection-a', detail: phase === 2 ? 'timeout' : phase >= 4 ? 'payment-7' : 'same payment key',
        x: [35, 815, 35, 815, 35][phase], y: 480, w: 250, h: 75, tone: phase === 2 ? 'red' : phase >= 4 ? 'green' : 'yellow', motion: true, small: true },
    ],
    edges: [
      { from: 'caller', to: 'bank', label: 'key: collection-a', tone: 'purple', active: phase === 1 || phase === 3, fromPort: 'right', toPort: 'left', labelAt: [550, 115] },
      ...(phase >= 2 ? [{ from: 'bank', to: 'caller', label: phase >= 4 ? 'Original result' : 'Response lost', tone: phase >= 4 ? 'green' as const : 'red' as const,
        active: phase === 4, dashed: phase < 4, crash: phase === 2, fromPort: 'bottom' as const, toPort: 'bottom' as const,
        via: [[940, 245], [160, 245]], labelAt: [550, 245] as [number, number] }] : []),
    ],
  }
}

function retryHandoff(step: number): Diagram {
  const phase = Math.max(0, Math.min(5, step))
  return {
    title: 'Retry publish succeeds but a crash before source commit allows a duplicate retry copy', width: 1100, height: 540,
    nodes: [
      { id: 'source', label: 'collections', x: 10, y: 100, w: 230, h: 130, shape: 'queue', tone: 'orange' },
      { id: 'consumer', label: 'Disbursements', x: 425, y: 115, w: 250, h: 100, tone: phase === 3 ? 'red' : 'purple', crossAt: phase === 3 ? 3 : undefined },
      { id: 'retry', label: 'disbursements\n.retry.5m', x: 850, y: 100, w: 240, h: 130, shape: 'queue', tone: 'yellow' },
      { id: 'source-record', label: 'collection-a', detail: 'event ID: evt-a', offset: 42, x: 20, y: 280, w: 220, h: 100, tone: 'orange', hidden: phase === 0, small: true },
      { id: 'bookmark', label: 'Committed next: 42', x: 10, y: 445, w: 290, h: 65, tone: 'blue' },
      { id: 'first-copy', label: 'collection-a', detail: 'event ID: evt-a', x: 850, y: 280, w: 240, h: 100, tone: 'yellow', hidden: phase < 4, small: true },
      { id: 'event', label: 'collection-a', detail: 'event ID: evt-a', x: phase === 0 ? 20 : phase === 4 ? 440 : 850,
        y: phase >= 5 ? 410 : 280, w: phase === 0 ? 220 : 240, h: 100, tone: 'yellow', motion: true, small: true, offset: phase === 0 || phase === 4 ? 42 : undefined },
    ],
    edges: [
      { from: 'source', to: 'consumer', label: phase >= 4 ? 'Replay 42' : 'Consume 42', tone: 'orange', active: phase === 4, fromPort: 'right', toPort: 'left' },
      ...(phase >= 1 ? [{ from: 'consumer', to: 'retry', label: phase >= 5 ? 'Publish again' : 'Publish retry', tone: 'yellow' as const, active: phase === 1 || phase === 5, fromPort: 'right' as const, toPort: 'left' as const }] : []),
      ...(phase >= 2 ? [{ from: 'retry', to: 'consumer', label: 'ACK ✓', tone: 'green' as const, active: phase === 2, fromPort: 'top' as const, toPort: 'top' as const,
        via: [[970, 35], [550, 35]], labelAt: [760, 35] as [number, number] }] : []),
      ...(phase === 3 ? [{ from: 'consumer', to: 'bookmark', label: 'Crash before commit', tone: 'red' as const, crash: true, dashed: true,
        fromPort: 'bottom' as const, toPort: 'right' as const, via: [[550, 477.5]], labelAt: [550, 420] as [number, number] }] : []),
    ],
  }
}

function metricOverview(step: number): Diagram {
  const phase = Math.max(0, Math.min(3, step))
  if (phase >= 2) {
    const dlq = phase === 3
    const keys = ['collection-a', 'collection-c', 'collection-b', 'collection-d', 'collection-e', 'collection-f', 'collection-g', 'collection-h', 'collection-i', 'collection-j', 'collection-k', 'collection-l']
    return {
      title: dlq ? 'Twelve unresolved DLQ events' : 'Twelve events waiting to retry', width: 1100, height: 380,
      groups: [{ id: 'topic', label: dlq ? 'Kafka · disbursements.dlq · unresolved events' : 'Kafka · disbursements.retry.5m', x: 15, y: 25, w: 1070, h: 325, tone: dlq ? 'red' : 'yellow' }],
      nodes: keys.map((key, i) => ({
        id: key, label: key, detail: dlq ? 'needs attention' : `retry-count: ${i % 2 + 1}`,
        x: 45 + (i % 6) * 170, y: 90 + Math.floor(i / 6) * 120, w: 150, h: 95,
        small: true, tone: dlq ? 'red' : 'yellow',
      })),
      edges: [],
    }
  }
  if (phase === 1) {
    const rows = [['collection-a', '09:00', 'NULL'], ['collection-c', '09:04', 'NULL'], ['collection-b', '08:59', '08:59:01']]
    const columns = [{ x: 45, w: 220 }, { x: 265, w: 350 }, { x: 615, w: 440 }]
    return {
      title: 'Oldest unpublished outbox row: collection-a, five minutes old', width: 1100, height: 380,
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
      ...['collection-f', 'collection-m', 'collection-a', 'collection-c', 'collection-b', 'collection-d', 'collection-e'].map((label, i): DiagramNode => ({
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

function pollBatch(step: number): Diagram {
  const phase = Math.max(0, Math.min(4, step))
  const records = ['collection-a', 'collection-b', 'collection-c']
  return {
    title: 'One PollFetches call can return multiple records; this loop handles them one at a time',
    width: 1100, height: 580,
    groups: [
      { id: 'topic', label: 'Kafka · collections', x: 10, y: 40, w: 300, h: 520, tone: 'orange' },
      { id: 'consumer', label: 'Consumer', x: 380, y: 40, w: 710, h: 520, tone: 'purple' },
      ...(phase >= 1 ? [{ id: 'batch', label: 'Returned records', x: 410, y: 225, w: 650, h: 110, tone: 'yellow' } as DiagramNode] : []),
      ...(phase >= 2 ? [{ id: 'handler', label: 'Handle one at a time', x: 410, y: 400, w: 650, h: 140, tone: 'green' } as DiagramNode] : []),
    ],
    nodes: [
      { id: 'poll', label: 'PollFetches(ctx)', x: 430, y: 110, w: 610, h: 65, tone: 'blue' },
      ...records.map((label, index): DiagramNode => ({
        id: `stored-${index}`, label, x: 65, y: 150 + index * 120, w: 180, h: 65,
        tone: 'orange', hidden: phase === 0,
      })),
      ...records.map((label, index): DiagramNode => {
        const handled = phase >= index + 2
        return {
          id: `record-${index}`, label: handled ? `${label} ✓` : label,
          x: phase === 0 ? 65 : 450 + index * 195,
          y: phase === 0 ? 150 + index * 120 : handled ? 460 : 265,
          w: 180, h: 65, tone: handled ? 'green' : phase >= 1 ? 'yellow' : 'orange', motion: true,
        }
      }),
    ],
    edges: phase === 1 ? [{ from: 'poll', to: 'record-1', tone: 'blue', active: true, fromPort: 'bottom', toPort: 'top' }] : [],
  }
}

function shutdownService(step: number): Diagram {
  const phase = Math.max(0, Math.min(5, step))
  const stopped = phase >= 2
  return {
    title: 'Disbursements stops polling, finishes its current payout and commit, then allows rebalance and closes', width: 1100, height: 620,
    groups: [
      { id: 'service', label: 'Disbursements', x: 290, y: 20, w: 790, h: 590, tone: phase >= 5 ? 'muted' : 'purple' },
      ...(phase >= 1 ? [{ id: 'pending', label: 'Buffered · uncommitted', x: 700, y: 225, w: 350, h: 135, tone: phase >= 5 ? 'orange' : 'yellow' } as DiagramNode] : []),
    ],
    nodes: [
      { id: 'kafka', label: 'collections', x: 10, y: 100, w: 210, h: 130, shape: 'queue', tone: 'orange' },
      { id: 'poll', label: stopped ? 'Stop polling' : 'Poll one record', detail: 'pollCtx', x: 330, y: 115, w: 240, h: 100, tone: stopped ? 'red' : 'blue', crossAt: stopped ? 2 : undefined },
      { id: 'signal', label: 'SIGTERM', x: 800, y: 130, w: 240, h: 65, tone: 'red', hidden: !stopped, enter: phase === 2 },
      { id: 'payout', label: phase >= 3 ? 'Payout ✓' : 'Pay Collection A', detail: 'workCtx', x: 330, y: 330, w: 240, h: 110, tone: phase >= 3 ? 'green' : 'yellow', hidden: phase < 1, enter: phase === 1 },
      { id: 'commit', label: 'Commit next: 43 ✓', x: 720, y: 385, w: 310, h: 65, tone: 'green', hidden: phase < 4, enter: phase === 4 },
      ...['collection-b', 'collection-c'].map((label, index): DiagramNode => ({
        id: `pending-${index}`, label, offset: 43 + index, x: 720 + index * 165, y: 275, w: 150, h: 65,
        tone: phase >= 5 ? 'orange' : 'yellow', hidden: phase < 1, enter: phase === 1,
      })),
      { id: 'close', label: 'Close ✓', x: 800, y: 490, w: 230, h: 65, tone: 'muted', hidden: phase < 5, enter: phase === 5 },
      { id: 'event', label: 'collection-a', x: phase === 0 ? 20 : phase >= 4 ? 570 : 350, y: phase === 0 ? 260 : 500, w: 200, h: 55, tone: phase >= 3 ? 'green' : 'yellow', motion: true },
    ],
    edges: [
      { from: 'kafka', to: 'poll', tone: stopped ? 'muted' : 'blue', dashed: stopped, active: phase <= 1 },
      ...(phase >= 1 ? [{ from: 'poll', to: 'payout', tone: stopped ? 'muted' as const : 'blue' as const, active: phase === 1, dashed: stopped, fromPort: 'bottom' as const, toPort: 'top' as const }] : []),
      ...(stopped ? [{ from: 'signal', to: 'poll', tone: 'red' as const, active: phase === 2 }] : []),
      ...(phase >= 3 ? [{ from: 'payout', to: 'event', tone: 'green' as const, active: phase === 3, fromPort: 'bottom' as const, toPort: 'top' as const }] : []),
      ...(phase >= 4 ? [{ from: 'payout', to: 'commit', tone: 'green' as const, active: phase === 4, fromPort: 'right' as const, toPort: 'left' as const }] : []),
      ...(phase >= 5 ? [{ from: 'commit', to: 'close', tone: 'green' as const, active: phase === 5, fromPort: 'bottom' as const, toPort: 'top' as const }] : []),
    ],
  }
}

function delayedRetry(step: number): Diagram {
  const due = step >= 2
  const released = step >= 3
  return {
    title: 'Go code in the Disbursements service enforces the retry due time', width: 1100, height: 390,
    nodes: [
      { id: 'clock', label: `Now: ${step === 0 ? '10:00:00' : step === 1 ? '10:02:30' : '10:05:00'}`, x: 420, y: 10, w: 260, h: 65, tone: due ? 'green' : 'blue' },
      { id: 'failure', label: 'Failure', detail: '10:00', x: 10, y: 140, w: 190, h: 130, tone: 'red' },
      { id: 'retry', label: 'disbursements\n.retry.5m', detail: 'due at 10:05', x: 290, y: 140, w: 230, h: 130, shape: 'queue', tone: step >= 1 ? 'orange' : 'muted' },
      { id: 'scheduler', label: 'Disbursements', detail: due ? 'Due — invoke handler' : 'Sleep until 10:05', x: 610, y: 140, w: 220, h: 130, tone: due ? 'green' : 'blue' },
      { id: 'handler', label: 'Handler', detail: released ? 'retry Collection A' : 'not invoked yet', x: 910, y: 140, w: 190, h: 130, tone: released ? 'green' : 'muted' },
      { id: 'event', label: 'collection-a', x: [10, 625, 625, 910][Math.min(step, 3)], y: 310, w: 190, h: 65, tone: released ? 'green' : 'yellow', motion: true },
    ],
    edges: [
      { from: 'failure', to: 'retry', label: 'publish', tone: step >= 1 ? 'orange' : 'muted', active: step === 1, fromPort: 'right', toPort: 'left' },
      { from: 'retry', to: 'scheduler', label: 'read', tone: step >= 1 ? 'orange' : 'muted', active: step === 1, fromPort: 'right', toPort: 'left' },
      { from: 'scheduler', to: 'handler', label: released ? 'invoke' : 'wait', tone: released ? 'green' : 'muted', active: released, dashed: !released, fromPort: 'right', toPort: 'left' },
    ],
  }
}

function dlqRecovery(step: number): Diagram {
  const phase = Math.max(0, Math.min(4, step))
  const position = Math.max(0, phase - 2)
  const stages = [
    { id: 'dlq', label: 'disbursements\n.dlq', tone: 'red' },
    { id: 'replay', label: 'disbursements\n.retry.5m', tone: 'yellow' },
    { id: 'handler', label: 'Disbursements', tone: 'green' },
  ] as const
  return {
    title: 'We investigate and fix; the event moves from DLQ to Retry topic to Disbursements', width: 1100, height: 510,
    nodes: [
      { id: 'investigate', label: 'We investigate', detail: 'inspect error + trace', x: 220, y: 0, w: 280, h: 95, tone: phase >= 1 ? 'blue' : 'muted' },
      { id: 'fix', label: 'We fix', detail: 'deploy handler fix', x: 600, y: 0, w: 280, h: 95, tone: phase >= 2 ? 'purple' : 'muted' },
      ...stages.map((stage, index): DiagramNode => ({
        ...stage, x: 20 + index * 410, y: 190, w: 240, h: 130,
        shape: index < 2 ? 'queue' : undefined,
        tone: index <= position ? stage.tone : 'muted',
      })),
      { id: 'event', label: 'collection-a', detail: 'event ID: evt-a\nbank key: collection-a', x: 40 + position * 410, y: 365, w: 200, h: 130, tone: phase === 4 ? 'green' : 'yellow', small: true, motion: true },
    ],
    edges: stages.slice(1).map((stage, index) => ({
      from: stages[index].id, to: stage.id, tone: index < position ? stage.tone : 'muted',
      label: index === 0 ? 'replay' : 'consume', active: phase === index + 3,
      dashed: index >= position, fromPort: 'right', toPort: 'left',
    })),
  }
}

function isrOverview(step: number): Diagram {
  const phase = Math.max(0, Math.min(3, step))
  const replicated = phase >= 1
  const blocked = phase === 3
  const members = phase < 2 ? '1, 2, 3' : phase === 2 ? '1, 2' : '1'
  return {
    title: 'All current ISR acknowledge; min ISR is a write threshold, not an acknowledgement count',
    width: 1100, height: 580,
    groups: [
      { id: 'broker-1', label: 'Broker 1', x: 310, y: 15, w: 350, h: 210, tone: 'blue' },
      { id: 'broker-2', label: 'Broker 2', x: 310, y: 265, w: 350, h: 210, tone: 'blue' },
      { id: 'broker-3', label: 'Broker 3', x: 730, y: 265, w: 350, h: 210, tone: 'blue' },
    ],
    nodes: [
      { id: 'producer', label: 'Producer', detail: blocked ? 'next write' : 'write event', x: 5, y: 85, w: 230, h: 120, tone: blocked ? 'red' : 'teal' },
      { id: 'leader', label: 'collections · P0', detail: 'Leader', x: 345, y: 85, w: 280, h: 120, tone: 'green', small: true },
      ...[2, 3].map((broker, index): DiagramNode => {
        const inSync = broker === 2 ? !blocked : phase < 2
        return {
          id: `follower-${broker}`, label: 'collections · P0',
          detail: 'Follower',
          x: 345 + index * 420, y: 335, w: 280, h: 120,
          tone: !inSync ? 'muted' : replicated ? 'green' : 'yellow', small: true,
        }
      }),
      { id: 'result', label: `ISR: {${members}} · min ISR=2`,
        detail: blocked ? 'Write rejected · not enough replicas' : replicated ? `ACK ✓ · all ${phase === 2 ? '2' : '3'} current ISR` : 'Waiting for replication',
        x: 300, y: 495, w: 790, h: 80, tone: blocked ? 'red' : replicated ? 'green' : 'yellow', small: true },
    ],
    edges: [
      { from: 'producer', to: 'leader', label: 'acks=all', tone: blocked ? 'red' : 'teal', active: phase === 0, fromPort: 'right', toPort: 'left' },
      { from: 'leader', to: 'follower-2', label: blocked ? 'outside ISR' : replicated ? 'replicate' : 'awaiting record', tone: blocked ? 'muted' : replicated ? 'green' : 'yellow', dashed: blocked, active: phase === 1, fromPort: 'bottom', toPort: 'top', labelAt: [485, 250] },
      { from: 'leader', to: 'follower-3', label: phase >= 2 ? 'outside ISR' : replicated ? 'replicate' : 'awaiting record', tone: phase >= 2 ? 'muted' : replicated ? 'green' : 'yellow', dashed: phase >= 2, active: phase === 1, fromPort: 'right', toPort: 'top', via: [[905, 145]], labelAt: [815, 115] },
    ],
  }
}

function topicOverview(): Diagram {
  return {
    title: 'Events are organized into the collections topic', width: 1100, height: 390,
    groups: [{ id: 'topic', label: 'Topic: collections', x: 10, y: 160, w: 1080, h: 210, tone: 'orange' }],
    nodes: ['created', 'updated', 'completed'].map((type, index): DiagramNode => ({
      id: `event-${index}`, label: 'collection-a', detail: `collections.${type}.v1`,
      x: 45 + index * 350, y: 235, w: 310, h: 100,
      tone: (['blue', 'purple', 'green'] as const)[index], small: true,
    })),
    edges: [],
  }
}

function producerConsumer(step: number): Diagram {
  const phase = Math.max(0, Math.min(2, step))
  return {
    title: 'Collections produces an event to the collections topic; Disbursements consumes it', width: 1100, height: 370,
    groups: [
      ...(phase >= 1 ? [{ id: 'producer-role', label: 'Producer', x: 0, y: 35, w: 280, h: 195, tone: 'teal' } as DiagramNode] : []),
      ...(phase >= 2 ? [{ id: 'consumer-role', label: 'Consumer', x: 820, y: 35, w: 280, h: 195, tone: 'purple' } as DiagramNode] : []),
    ],
    nodes: [
      { id: 'producer', label: 'Collections', x: 20, y: 100, w: 240, h: 100, tone: 'teal' },
      { id: 'topic', label: 'collections', detail: 'Topic', x: 430, y: 85, w: 240, h: 130, shape: 'queue', tone: 'orange' },
      { id: 'consumer', label: 'Disbursements', x: 840, y: 100, w: 240, h: 100, tone: 'purple' },
      { id: 'event', label: 'collection-a', x: [40, 450, 860][phase], y: 280, w: 200, h: 65, tone: 'yellow', motion: true },
      { id: 'stored-event', label: 'collection-a', x: 450, y: 280, w: 200, h: 65, tone: 'orange', hidden: phase < 2 },
    ],
    edges: [
      { from: 'producer', to: 'topic', label: 'publishes', tone: 'teal', active: phase === 1, fromPort: 'right', toPort: 'left' },
      { from: 'topic', to: 'consumer', label: 'receives', tone: 'purple', active: phase === 2, fromPort: 'right', toPort: 'left' },
    ],
  }
}

function tracePropagation(step: number): Diagram {
  const phase = Math.max(0, Math.min(3, step))
  return {
    title: 'Kafka carries the producer context; consumers and bank calls create child spans in the same trace', width: 1100, height: 560,
    groups: [{ id: 'trace', label: 'Trace T1', x: 10, y: 350, w: 1080, h: 195, tone: 'blue' }],
    nodes: [
      { id: 'collections', label: 'Collections', x: 10, y: 50, w: 200, h: 110, tone: 'teal' },
      { id: 'kafka', label: 'collections', x: 290, y: 40, w: 220, h: 130, shape: 'queue', tone: phase >= 1 ? 'orange' : 'muted' },
      { id: 'disbursements', label: 'Disbursements', x: 590, y: 50, w: 220, h: 110, tone: phase >= 2 ? 'purple' : 'muted' },
      { id: 'bank', label: 'Bank request', x: 890, y: 50, w: 200, h: 110, tone: phase >= 3 ? 'blue' : 'muted' },
      { id: 'context', label: phase === 3 ? 'HTTP request' : 'collection-a', detail: `traceparent\nT1 / ${phase === 3 ? 'B1' : 'P1'}`, x: [10, 290, 590, 890][phase], y: 200, w: 200, h: 110, tone: 'yellow', motion: true },
      { id: 'producer-span', label: 'P1', detail: 'publish', x: 50, y: 410, w: 220, h: 95, tone: 'teal' },
      { id: 'consumer-span', label: 'C1', detail: 'consume', x: 435, y: 410, w: 220, h: 95, tone: 'purple', hidden: phase < 2 },
      { id: 'bank-span', label: 'B1', detail: 'bank call', x: 820, y: 410, w: 220, h: 95, tone: 'blue', hidden: phase < 3 },
    ],
    edges: [
      { from: 'collections', to: 'kafka', label: 'inject', tone: phase >= 1 ? 'teal' : 'muted', active: phase === 1, fromPort: 'right', toPort: 'left' },
      { from: 'kafka', to: 'disbursements', label: 'extract', tone: phase >= 2 ? 'purple' : 'muted', active: phase === 2, fromPort: 'right', toPort: 'left' },
      { from: 'disbursements', to: 'bank', label: 'ctx', tone: phase >= 3 ? 'blue' : 'muted', active: phase === 3, fromPort: 'right', toPort: 'left' },
      ...(phase >= 2 ? [{ from: 'producer-span', to: 'consumer-span', label: 'parent', tone: 'purple' as const, fromPort: 'right' as const, toPort: 'left' as const }] : []),
      ...(phase >= 3 ? [{ from: 'consumer-span', to: 'bank-span', label: 'parent', tone: 'blue' as const, fromPort: 'right' as const, toPort: 'left' as const }] : []),
    ],
  }
}

function traceWaterfall(step: number): Diagram {
  const phase = Math.max(0, Math.min(4, step))
  return {
    title: 'A bank timeout ends the attempt; five minutes later a linked retry succeeds', width: 1100, height: 560,
    groups: [
      { id: 'original', label: 'Trace T1 · 10:00', x: 10, y: 15, w: 590, h: 310, tone: 'blue' },
      ...(phase >= 3 ? [{ id: 'later', label: 'Trace T2 · 10:05', x: 720, y: 335, w: 370, h: 210, tone: phase >= 4 ? 'green' : 'purple' } as DiagramNode] : []),
    ],
    nodes: [
      { id: 'publish', label: 'publish · P1', x: 40, y: 75, w: 220, h: 50, tone: 'teal' },
      { id: 'consume', label: 'consume · C1', x: 230, y: 155, w: 340, h: 50, tone: phase >= 1 ? 'red' : 'muted', hidden: phase < 1 },
      { id: 'bank', label: 'bank · B1', detail: 'timeout · 3s', x: 290, y: 230, w: 250, h: 75, tone: phase >= 1 ? 'red' : 'muted', hidden: phase < 1 },
      { id: 'gap', label: '… 1 minute …', x: 680, y: 85, w: 400, h: 65, tone: 'muted', hidden: phase < 2 },
      { id: 'retry', label: 'retry · R1', x: 755, y: 395, w: 300, h: 50, tone: phase >= 4 ? 'green' : 'purple', hidden: phase < 3 },
      { id: 'retry-bank', label: 'bank ✓', x: 835, y: 475, w: 200, h: 50, tone: 'green', hidden: phase < 4 },
    ],
    edges: phase >= 3 ? [{ from: 'consume', to: 'retry', label: 'span link', tone: 'purple', dashed: true, fromPort: 'right', toPort: 'left', via: [[650, 180], [650, 420]], labelAt: [650, 300] }] : [],
  }
}

function retryProgress(step: number): Diagram {
  const state = retryProgressState(step)
  const diagram = talkDiagram('retry', 0)
  diagram.title = 'Disbursements consumes Collection A through increasing retry delays, then publishes DLQ'
  diagram.height = 300
  diagram.nodes = diagram.nodes.filter(node => node.id === 'consumer' || node.id === 'retry')
  for (const node of diagram.nodes) {
    node.y -= 60
    node.tone = 'muted'
    node.detail = undefined
    if (node.id === 'consumer') {
      node.x = 200
      node.y = 80
      node.h = 130
      node.detail = state.beat === 'consume' ? undefined : 'Failed ✕'
      node.tone = state.beat === 'consume' ? 'blue' : 'red'
    } else if (node.id === 'retry') {
      node.x = 710
      node.label = state.dlq ? 'disbursements\n.dlq' : `disbursements\n.retry.${retryDelays[state.index]}`
      node.detail = state.dlq ? undefined : `retry-at: ${state.due.slice(0, 5)}`
      if (state.beat === 'publish' || state.dlq) {
        node.tone = state.dlq ? 'red' : 'yellow'
      }
    }
  }
  const publishing = state.beat === 'publish' || state.dlq
  diagram.nodes.push({ id: 'event', label: 'Collection A', x: publishing ? 720 : 210, y: 215, w: 170, h: 50, tone: 'blue', motion: true })
  diagram.edges = [
    { from: 'consumer', to: 'retry', label: 'publish', tone: publishing ? (state.dlq ? 'red' : 'yellow') : 'muted', active: publishing, fromPort: 'right', toPort: 'left', labelAt: [550, 145] },
    ...(state.dlq ? [] : [{ from: 'retry', to: 'consumer', label: 'consume', tone: state.beat === 'consume' ? 'blue' as const : 'muted' as const, active: state.beat === 'consume', fromPort: 'top' as const, toPort: 'top' as const, via: [[805, 25], [295, 25]] as [number, number][], labelAt: [550, 25] as [number, number] }]),
  ]
  return diagram
}

export function talkDiagram(key: string, step: number): Diagram {
  if (key === 'retry-progress') return retryProgress(step)
  if (key === 'isr-overview') return isrOverview(step)
  if (key === 'topic-overview') return topicOverview()
  if (key === 'producer-consumer') return producerConsumer(step)
  if (key === 'trace-propagation') return tracePropagation(step)
  if (key === 'trace-waterfall') return traceWaterfall(step)
  if (key === 'dlq-recovery') return dlqRecovery(step)
  if (key === 'delayed-retry') return delayedRetry(step)
  if (key === 'poll-batch') return pollBatch(step)
  if (key === 'shutdown-service') return shutdownService(step)
  if (key === 'metric-overview') return metricOverview(step)
  if (key === 'partition-log') return partitionLog(step)
  if (key === 'partition-segments') return logSegments(step)
  if (key === 'broker-scaling') return brokerScaling(step)
  if (key === 'bank-response-lost') return bankResponseLost(step)
  if (key === 'retry-handoff') return retryHandoff(step)
  const isRebalance = key === 'rebalance' || key === 'rebalance-eager'
  const previewStep = isRebalance ? [0, 1, 3, 4][Math.max(0, Math.min(3, step))]
    : step
  const source = previews[key === 'rebalance-eager' ? 'rebalance' : key](previewStep)
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
      { id: 'kafka', label: 'Kafka · collections', detail: 'collection-a · offset 42', x: 10, y: 130, w: 210, h: 130, shape: 'queue', tone: 'orange' },
      { id: 'consume', label: replay ? 'Replay event' : 'Consume event', detail: replay ? 'same offset 42' : 'offset 42', x: 340, y: 75, w: 220, h: 75, tone: replay ? 'yellow' : 'purple' },
      { id: 'pay', label: 'Call bank', detail: keyed ? 'same key: collection-a' : 'no idempotency key', x: 340, y: 195, w: 220, h: 75, tone: keyed ? 'green' : 'purple' },
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
    if (key === 'retry') {
      Object.assign(diagram.edges[3], { fromPort: 'top', toPort: 'right', via: [[965, 25], [735, 25], [735, 105]], labelAt: [850, 25] })
      diagram.title = 'A bank failure triggers a retry; publish and acknowledge before committing the original offset'
      diagram.nodes.push({ id: 'bank', label: 'Partner Bank', detail: step >= 1 ? 'Unavailable' : undefined, x: 20, y: 0, w: 190, h: 90, tone: step >= 1 ? 'red' : 'green' })
      diagram.edges.push({ from: 'consumer', to: 'bank', label: step >= 1 ? 'payout fails' : 'payout', tone: step >= 1 ? 'red' : 'muted', active: step === 1,
        fromPort: 'top', toPort: 'right', via: [[540, 45]], labelAt: [375, 45] })
    }
    if (key === 'dlq') {
      diagram.nodes[0].label = 'disbursements\n.retry.1h'
      diagram.edges[1].label = 'publish DLQ → ACK'
      diagram.nodes.push({ id: 'bank', label: 'Partner Bank', x: 20, y: 0, w: 190, h: 90, tone: step >= 1 ? 'red' : 'green' })
      diagram.edges.push({ from: 'consumer', to: 'bank', label: step >= 1 ? 'payout fails' : 'payout', tone: step >= 1 ? 'red' : 'muted', active: step === 1,
        fromPort: 'top', toPort: 'right', via: [[540, 45]], labelAt: [375, 45] })
    }
    if (key === 'relay-shapes') diagram.edges[2].label = 'delete + commit'
  } else if (key === 'outbox') {
    const deleted = step === 4
    const crashed = step === 5
    const replay = step >= 6
    diagram.width = 1100
    diagram.height = 490
    diagram.groups = [
      { id: 'database', label: 'Collections DB', x: 270, y: 25, w: 470, h: 425, tone: 'blue' },
      { id: 'transaction', label: 'One DB transaction', x: 290, y: 90, w: 430, h: 335, tone: step >= 1 ? 'green' : 'muted' },
    ]
    diagram.nodes = [
      { id: 'collections', label: 'Collections', x: 0, y: 220, w: 200, h: 100, tone: 'teal' },
      { id: 'state', label: 'collections', detail: step >= 1 ? 'status: completed' : undefined, x: 320, y: 150, w: 370, h: 85, tone: step >= 1 ? 'green' : 'muted' },
      { id: 'outbox', label: 'outbox', detail: deleted ? 'empty · row deleted' : step >= 1 ? 'collections.completed.v1' : undefined, x: 320, y: 300, w: 370, h: 85, tone: deleted ? 'muted' : step >= 5 ? 'yellow' : step >= 1 ? 'green' : 'muted' },
      { id: 'publisher', label: 'Outbox publisher', detail: crashed ? 'CRASH' : replay ? 'restarted' : undefined, x: 850, y: 295, w: 240, h: 95, tone: crashed ? 'red' : step >= 2 ? 'green' : 'muted' },
      { id: 'topic', label: 'collections topic', detail: replay ? 'collection-a × 2' : step >= 3 ? 'collection-a' : undefined, x: 850, y: 55, w: 240, h: 130, shape: 'queue', tone: step >= 3 ? 'orange' : 'muted' },
    ]
    diagram.edges = [
      { from: 'collections', to: 'state', label: 'update', tone: step >= 1 ? 'green' : 'muted', active: step === 1, fromPort: 'right', toPort: 'left', via: [[245, 270], [245, 192.5]], labelAt: [240, 165] },
      { from: 'collections', to: 'outbox', label: 'insert', tone: step >= 1 ? 'green' : 'muted', active: step === 1, fromPort: 'right', toPort: 'left', via: [[245, 270], [245, 342.5]], labelAt: [240, 370] },
      { from: 'publisher', to: 'outbox', label: deleted ? 'delete + commit' : crashed ? 'not deleted' : replay ? 'poll again' : 'poll', tone: crashed ? 'red' : step >= 2 ? 'green' : 'muted', active: step === 2 || deleted || replay, dashed: crashed, fromPort: 'left', toPort: 'right', labelAt: [770, 315] },
      { from: 'publisher', to: 'topic', label: replay ? 'republish' : 'publish', tone: step >= 3 ? 'orange' : 'muted', active: step === 3 || replay, fromPort: 'top', toPort: 'bottom', labelAt: [1035, 240] },
    ]
    if (step >= 3) diagram.edges.push({
      from: 'topic', to: 'publisher', label: 'ACK', tone: 'green', active: step === 3 || replay,
      fromPort: 'left', toPort: 'top', via: [[800, 120], [800, 260], [970, 260]], labelAt: [800, 220],
    })
  } else if (key === 'consumer-failure') {
    diagram.title = 'Consumer failure: reassign and replay'
    diagram.caption = undefined
    diagram.height = 580
    for (const node of diagram.nodes) node.y += 50
    for (const group of diagram.groups ?? []) { group.y += 50; group.h = 190 }
    diagram.nodes[1].detail = undefined
    Object.assign(diagram.nodes[2], { h: 130, small: true, tone: step >= 1 ? 'red' : 'green', detail: step >= 1 ? 'down' : 'P0', offset: undefined })
    Object.assign(diagram.nodes[3], { h: 130, small: true, tone: 'green', detail: step >= 2 ? 'P1 + P0' : 'P1', offset: undefined })
    Object.assign(diagram.nodes[4], { h: 130, small: true, tone: 'green', detail: 'P2' })
    Object.assign(diagram.edges[0], { active: true })
    Object.assign(diagram.edges[1], { label: step < 2 ? 'P0 · offset 42' : '', active: step === 0, tone: step === 0 ? 'green' : 'muted', dashed: step >= 1, labelAt: [305, 350] })
    Object.assign(diagram.edges[2], { label: step >= 3 ? 'P1 + P0 · replay 42' : step >= 2 ? 'P1 + P0 · offset 42' : 'P1', active: true, tone: 'green', dashed: false })
    Object.assign(diagram.edges[3], { label: 'P2', active: true, tone: 'green', dashed: false })
  } else if (isRebalance) {
    const eager = key === 'rebalance-eager'
    diagram.title = eager ? 'Eager assignment: revoke all partitions' : 'Cooperative-sticky assignment: move only P2'
    diagram.height = 490
    diagram.caption = undefined
    diagram.groups = diagram.groups?.filter(group => group.id !== 'handoff')
    for (const node of diagram.nodes) {
      if (node.id === 'topic') continue
      node.motion = true
      if (previewStep === 3 && (eager || node.id === 'p2')) {
        node.y = 385
        node.detail = 'paused'
        node.tone = 'red'
        if (eager) node.x = node.id === 'p0' ? 45 : node.id === 'p1' ? 415 : 785
      }
    }
    if (eager && previewStep === 3) diagram.edges = []
  }
  return diagram
}
