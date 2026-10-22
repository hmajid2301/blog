// Click-indexed snapshots: navigating backwards restores the entire demo.

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
