// Click-indexed snapshots: navigating backwards restores the entire demo.

export const retryDelays = ['5m', '15m', '30m', '1h']
export const retryMinutes = [0, 5, 20, 50, 110]
export function retryClock(minutes: number) {
  const seconds = 10 * 3600 + minutes * 60
  return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
    .map(value => String(value).padStart(2, '0')).join(':')
}
export function retryProgressState(step: number) {
  const finalStep = retryDelays.length * 3 + 1
  const s = Math.max(0, Math.min(step, finalStep))
  const index = Math.min(Math.floor((Math.max(1, s) - 1) / 3), retryDelays.length - 1)
  const beat = s === 0 ? 'fail' : s >= finalStep ? 'dlq' : ['publish', 'consume', 'fail'][(s - 1) % 3]
  const fraction = beat === 'publish' ? 0 : 1
  const progress = s === 0 ? 0 : s >= finalStep ? retryDelays.length : index + fraction
  const minutes = s === 0 ? 0 : retryMinutes[index] + (retryMinutes[index + 1] - retryMinutes[index]) * fraction
  return { index, beat, progress, now: retryClock(minutes), due: retryClock(retryMinutes[index + 1]), dlq: s >= finalStep }
}

const orderedRetryRecords = [
  { id: 'or-0', key: 'collection-a', type: 'created', offset: 0 },
  { id: 'or-1', key: 'collection-a', type: 'updated', offset: 1 },
  { id: 'or-2', key: 'collection-b', type: 'created', offset: 2 },
  { id: 'or-3', key: 'collection-a', type: 'completed', offset: 3 },
]
const orderedRetryCaptions = [
  'One partition · two keys',
  'collection-a created fails',
  'Park created · add redirect',
  'updated queues behind created',
  'collection-b runs normally',
  'completed joins the line',
  'created handled · tombstone',
  'updated handled · tombstone',
  'collection-a keeps order: 0 → 1 → 3',
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
  { id: 'or-0', key: 'collection-a', type: 'completed', offset: 0 },
  { id: 'or-1', key: 'collection-b', type: 'completed', offset: 1 },
  { id: 'or-2', key: 'collection-c', type: 'completed', offset: 2 },
  { id: 'or-3', key: 'collection-d', type: 'completed', offset: 3 },
]
const unorderedRetryCaptions = [
  'One partition · four collections',
  'collection-a handling fails',
  '.retry.5m · commit and continue',
  'collection-b handled',
  'collection-c handled',
  'collection-d handled',
  'collection-a retried · all handled',
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
