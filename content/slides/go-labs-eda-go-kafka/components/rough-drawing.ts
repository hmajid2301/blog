import rough from 'roughjs'
import { palette, type Diagram, type DiagramNode, type Port } from './diagram-previews.ts'

const generator = rough.generator()
const paths = (shape: Parameters<typeof generator.toPaths>[0]) => generator.toPaths(shape)
function seed(id: string) {
  return [...id].reduce((value, char) => (value * 31 + char.charCodeAt(0)) & 0x7fffffff, 1) || 1
}
function port(node: DiagramNode, side: Port): [number, number] {
  switch (side) {
    case 'left': return [node.x, node.y + node.h / 2]
    case 'right': return [node.x + node.w, node.y + node.h / 2]
    case 'top': return [node.x + node.w / 2, node.y]
    case 'bottom': return [node.x + node.w / 2, node.y + node.h]
  }
}

export function roughDrawing(diagram: Diagram) {
  const nodes = diagram.nodes.filter(node => !node.hidden).map(node => {
    const options = {
      seed: seed(node.id), roughness: 1.3, strokeWidth: 2.5,
      stroke: palette[node.tone][0], fill: palette[node.tone][1],
      fillStyle: 'hachure', hachureGap: 13, fillWeight: 2,
    }
    const shape = node.shape === 'database'
      ? generator.path('M 3 18 C 3 -2 187 -1 187 18 L 187 111 C 187 132 3 131 3 111 Z', options)
      : node.shape === 'queue'
        ? generator.path('M 24 3 L 166 4 C 194 5 195 126 166 127 L 24 126 C -4 125 -3 3 24 3 Z', options)
        : generator.rectangle(0, 0, node.w, node.h, options)
    const detail = node.shape === 'database' ? 'M 3 18 C 4 38 186 39 187 18'
      : node.shape === 'queue' ? 'M 53 103 L 72 104 L 72 117 L 52 116 Z M 86 104 L 105 103 L 106 117 L 86 117 Z M 119 103 L 139 104 L 138 118 L 119 117 Z' : ''
    return { ...node, paths: [...paths(shape), ...(detail ? paths(generator.path(detail, { ...options, fill: undefined })) : [])] }
  })
  const groups = (diagram.groups ?? []).filter(group => !group.hidden).map(group => ({
    ...group,
    paths: paths(generator.rectangle(group.x, group.y, group.w, group.h, {
      seed: seed(group.id), stroke: palette[group.tone][0], strokeWidth: 2.5, roughness: 1.3,
    })),
  }))
  const edges = diagram.edges.map((edge, index) => {
    const from = diagram.nodes.find(node => node.id === edge.from)!
    const to = diagram.nodes.find(node => node.id === edge.to)!
    const dx = to.x + to.w / 2 - from.x - from.w / 2
    const dy = to.y + to.h / 2 - from.y - from.h / 2
    const horizontal = Math.abs(dx) >= Math.abs(dy)
    const start = port(from, edge.fromPort ?? (horizontal ? (dx >= 0 ? 'right' : 'left') : (dy >= 0 ? 'bottom' : 'top')))
    const end = port(to, edge.toPort ?? (horizontal ? (dx >= 0 ? 'left' : 'right') : (dy >= 0 ? 'top' : 'bottom')))
    const points: [number, number][] = [start, ...(edge.via ?? []), end]
    const previous = points.at(-2)!
    const angle = Math.atan2(end[1] - previous[1], end[0] - previous[0])
    const arrow: [number, number][] = [end, ...[-1, 1].map(sign => [
      end[0] - 14 * Math.cos(angle) + sign * 7 * Math.sin(angle),
      end[1] - 14 * Math.sin(angle) - sign * 7 * Math.cos(angle),
    ] as [number, number])]
    const color = edge.tone === 'muted' ? '#bac2de' : palette[edge.tone][0]
    const options = { seed: seed(`edge-${index}`), stroke: color, strokeWidth: 4, roughness: 1.1 }
    return {
      ...edge, points,
      paths: paths(generator.linearPath(points, options)),
      arrow: paths(generator.polygon(arrow, { ...options, fill: color, fillStyle: 'solid' })),
      path: points.map(([x, y], i) => `${i ? 'L' : 'M'} ${x} ${y}`).join(' '),
      labelAt: edge.labelAt ?? [(start[0] + end[0]) / 2 + (horizontal ? 0 : 85), (start[1] + end[1]) / 2 - (horizontal ? 26 : 0)],
      color,
    }
  })
  return { nodes, groups, edges }
}
