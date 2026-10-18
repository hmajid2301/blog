// Click-indexed snapshots: navigating backwards restores the entire demo.
const partitionEvents = [
  { id: 'evt-1', key: 'transfer-a', type: 'collections.created.v1' },
  { id: 'evt-2', key: 'transfer-c', type: 'collections.created.v1' },
  { id: 'evt-3', key: 'transfer-a', type: 'collections.updated.v1' },
  { id: 'evt-4', key: 'transfer-d', type: 'collections.created.v1' },
  { id: 'evt-5', key: 'transfer-a', type: 'collections.completed.v1' },
]
// Illustrative assignments, not a Kafka client hash implementation.
const partitionForKey: Record<string, number> = { 'transfer-a': 1, 'transfer-c': 0, 'transfer-d': 2 }

export function partitionState(step: number) {
  const offsets = [0, 0, 0]
  const events = partitionEvents.slice(0, Math.max(0, Math.min(step, partitionEvents.length))).map(event => {
    const partition = partitionForKey[event.key]
    return { ...event, partition, offset: offsets[partition]++ }
  })
  const current = events.at(-1)
  return {
    current, count: events.length, total: partitionEvents.length,
    caption: current ? `${current.key} → Partition ${current.partition} · appended at offset ${current.offset}` : 'Send one event at a time. Watch its key choose a partition.',
    partitions: [0, 1, 2].map(id => ({ id, events: events.filter(event => event.partition === id) })),
  }
}

export function offsetState(step: number) {
  const captions = [
    'Consume offset 42. The committed next offset is still 42.',
    'Bank accepts the payout with the stable key payout:transfer-a.',
    'Process crashes before committing offset 43. The payment already happened.',
    'Restart from committed offset 42: Kafka delivers the same record again.',
    'Call the bank with the SAME key. Bank returns the original result; no second payout.',
    'Commit next offset 43 only after handling the replay successfully.',
  ]
  return {
    caption: captions[Math.min(step, 5)], key: 'payout:transfer-a',
    committed: step >= 5 ? 43 : 42, payments: step >= 1 ? 1 : 0,
    bankCalls: step >= 4 ? 2 : step >= 1 ? 1 : 0,
    crashed: step === 2, replay: step >= 3, deduplicated: step >= 4,
  }
}

const orderedRetryRecords = [
  { id: 'or-0', key: 'transfer-a', type: 'created', offset: 0 },
  { id: 'or-1', key: 'transfer-a', type: 'updated', offset: 1 },
  { id: 'or-2', key: 'transfer-b', type: 'created', offset: 2 },
  { id: 'or-3', key: 'transfer-a', type: 'completed', offset: 3 },
]
const orderedRetryCaptions = [
  'One partition · two keys',
  'transfer-a created fails',
  'Park created · add redirect',
  'updated queues behind created',
  'transfer-b runs normally',
  'completed joins the line',
  'created handled · tombstone',
  'updated handled · tombstone',
  'transfer-a keeps order: 0 → 1 → 3',
]

export function orderedRetryState(step: number) {
  const clamped = Math.max(0, Math.min(step, orderedRetryCaptions.length - 1))
  const line: string[] = []
  const done: string[] = []
  let failing: string | undefined
  for (let click = 1; click <= clamped; click++) {
    switch (click) {
      case 1: failing = 'or-0'; break
      case 2: failing = undefined; line.push('or-0'); break
      case 3: line.push('or-1'); break
      case 4: done.push('or-2'); break
      case 5: line.push('or-3'); break
      default: done.push(line.shift()!)
    }
  }
  const records = orderedRetryRecords.map(record => {
    if (record.id === failing) return { ...record, where: 'consumer' as const, position: 0 }
    if (line.includes(record.id)) return { ...record, where: 'line' as const, position: line.indexOf(record.id) }
    if (done.includes(record.id)) return { ...record, where: 'done' as const, position: done.indexOf(record.id) }
    return { ...record, where: 'partition' as const, position: record.offset }
  })
  const recordOf = (id: string) => orderedRetryRecords.find(record => record.id === id)!
  const justLeft = clamped >= 6 ? done.at(-1) : undefined
  const redirect = [
    ...(justLeft ? [{ ...recordOf(justLeft), tombstone: true }] : []),
    ...line.map(id => ({ ...recordOf(id), tombstone: false })),
  ]
  return { caption: orderedRetryCaptions[clamped], parked: line.length > 0, line, done, records, redirect }
}

const unorderedRetryRecords = [
  { id: 'or-0', key: 'transfer-a', type: 'completed', offset: 0 },
  { id: 'or-1', key: 'transfer-b', type: 'completed', offset: 1 },
  { id: 'or-2', key: 'transfer-c', type: 'completed', offset: 2 },
  { id: 'or-3', key: 'transfer-d', type: 'completed', offset: 3 },
]
const unorderedRetryCaptions = [
  'One partition · four transfers',
  'transfer-a handling fails',
  '.retry.5m · commit and continue',
  'transfer-b handled',
  'transfer-c handled',
  'transfer-d handled',
  'transfer-a retried · all handled',
]

export function unorderedRetryState(step: number) {
  const clamped = Math.max(0, Math.min(step, unorderedRetryCaptions.length - 1))
  const line: string[] = []
  const done: string[] = []
  let failing: string | undefined
  for (let click = 1; click <= clamped; click++) {
    switch (click) {
      case 1: failing = 'or-0'; break
      case 2: failing = undefined; line.push('or-0'); break
      case 3: done.push('or-1'); break
      case 4: done.push('or-2'); break
      case 5: done.push('or-3'); break
      default: done.push(line.shift()!)
    }
  }
  const records = unorderedRetryRecords.map(record => {
    if (record.id === failing) return { ...record, where: 'consumer' as const, position: 0 }
    if (line.includes(record.id)) return { ...record, where: 'line' as const, position: line.indexOf(record.id) }
    if (done.includes(record.id)) return { ...record, where: 'done' as const, position: done.indexOf(record.id) }
    return { ...record, where: 'partition' as const, position: record.offset }
  })
  return { caption: unorderedRetryCaptions[clamped], records }
}
