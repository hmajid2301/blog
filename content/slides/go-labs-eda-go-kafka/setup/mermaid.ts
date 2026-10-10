export default async function () {
  return {
    theme: 'base',
    look: 'handDrawn',
    handDrawnSeed: 7,
    fontFamily: 'Patrick Hand, Poppins, sans-serif',
    themeVariables: {
      background: '#11111b',
      fontFamily: 'Patrick Hand, Poppins, sans-serif',
      fontSize: '24px',

      textColor: '#e6e9f7',
      lineColor: '#bac2de',
      defaultLinkColor: '#bac2de',

      primaryColor: '#2b3040',
      primaryBorderColor: '#d7dae8',
      primaryTextColor: '#e6e9f7',

      secondaryColor: '#242938',
      secondaryBorderColor: '#d7dae8',
      secondaryTextColor: '#e6e9f7',

      tertiaryColor: '#2f3547',
      tertiaryBorderColor: '#d7dae8',
      tertiaryTextColor: '#e6e9f7',

      mainBkg: '#2b3040',
      nodeBorder: '#d7dae8',
      clusterBkg: '#1e2230',
      clusterBorder: '#8f96b3',

      actorBkg: '#2b3040',
      actorBorder: '#d7dae8',
      actorTextColor: '#e6e9f7',
      actorLineColor: '#d7dae8',
      signalColor: '#d7dae8',
      signalTextColor: '#e6e9f7',

      labelBoxBkgColor: 'transparent',
      labelBoxBorderColor: 'transparent',
      labelTextColor: '#e6e9f7',

      noteBkgColor: '#2b3040',
      noteBorderColor: '#d7dae8',
      noteTextColor: '#e6e9f7',
    },
    themeCSS: `
      /* handDrawn fill hatching: tint it by node class */
      .rough-node path:first-child {
        stroke-width: 1.5px !important;
        opacity: 0.22;
      }

      .rough-node path:last-child {
        stroke-width: 2.5px !important;
      }

      /* infrastructure and outbox relay */
      .rough-node.infrastructure path:first-child,
      .rough-node.infrastructure path:last-child {
        stroke: #9399b2 !important;
      }
      .rough-node.outboxDb path:first-child,
      .rough-node.outboxDb path:last-child {
        stroke: #a6e3a1 !important;
      }
      .rough-node.outboxPublisher path:first-child {
        stroke: #94e2d5 !important;
      }
      .rough-node.outboxPublisher path:last-child {
        stroke: #74c7ec !important;
      }

      /* service / source nodes */
      .rough-node.svcA path:first-child,
      .rough-node.producer path:first-child,
      .rough-node.app path:first-child,
      .rough-node.decision path:first-child {
        stroke: #89b4fa !important;
      }
      .rough-node.svcA path:last-child,
      .rough-node.producer path:last-child,
      .rough-node.app path:last-child,
      .rough-node.decision path:last-child {
        stroke: #74c7ec !important;
      }

      .rough-node.svcB path:first-child,
      .rough-node.storage path:first-child {
        stroke: #fab387 !important;
      }
      .rough-node.svcB path:last-child,
      .rough-node.storage path:last-child {
        stroke: #fab387 !important;
      }

      .rough-node.bank path:first-child,
      .rough-node.bank path:last-child {
        stroke: #f38ba8 !important;
      }

      /* database / cylinder storage nodes: same yellow body as topics */
      .rough-node.db path:first-child {
        stroke: #f9e2af !important;
      }
      .rough-node.db path:last-child {
        stroke: #fab387 !important;
      }

      .rough-node.svcC path:first-child,
      .rough-node.publisher path:first-child,
      .rough-node.controller path:first-child {
        stroke: #cba6f7 !important;
      }
      .rough-node.svcC path:last-child,
      .rough-node.publisher path:last-child,
      .rough-node.controller path:last-child {
        stroke: #b4befe !important;
      }

      /* simple ab nodes */
      .rough-node.a path:first-child {
        stroke: #94e2d5 !important;
      }
      .rough-node.a path:last-child {
        stroke: #74c7ec !important;
      }
      .rough-node.b path:first-child {
        stroke: #fab387 !important;
      }
      .rough-node.b path:last-child {
        stroke: #f38ba8 !important;
      }

      /* topic / log nodes */
      .rough-node.topic path:first-child,
      .rough-node.log path:first-child,
      .rough-node.kafka path:first-child {
        stroke: #f9e2af !important;
      }
      .rough-node.topic path:first-child {
        opacity: 0.16;
      }
      .rough-node.topic path:last-child,
      .rough-node.log path:last-child,
      .rough-node.kafka path:last-child {
        stroke: #fab387 !important;
      }
      .rough-node.topic path:last-child {
        stroke-width: 2.6px;
      }

      .rough-node.kafkaBroker path:first-child,
      .rough-node.kafkaBroker path:last-child {
        stroke: #89b4fa !important;
      }

      .rough-node.retry path:first-child,
      .rough-node.retry path:last-child {
        stroke: #f9e2af !important;
      }

      .rough-node.dlq path:first-child,
      .rough-node.dlq path:last-child {
        stroke: #f38ba8 !important;
      }

      /* hide the ugly hand-drawn bottom base arc on cylinder nodes */
      .rough-node.log .label-container path:nth-child(2),
      .rough-node.kafka .label-container path:nth-child(2) {
        clip-path: inset(0 0 6px 0);
      }

      /* consumer / group nodes */
      .rough-node.consumer1 path:first-child,
      .rough-node.c1 path:first-child,
      .rough-node.inventory path:first-child,
      .rough-node.consumer path:first-child,
      .rough-node.groupA path:first-child {
        stroke: #94e2d5 !important;
      }
      .rough-node.consumer1 path:last-child,
      .rough-node.c1 path:last-child,
      .rough-node.inventory path:last-child,
      .rough-node.consumer path:last-child,
      .rough-node.groupA path:last-child {
        stroke: #74c7ec !important;
      }

      .rough-node.consumer2 path:first-child,
      .rough-node.c2 path:first-child,
      .rough-node.groupB path:first-child {
        stroke: #cba6f7 !important;
      }
      .rough-node.consumer2 path:last-child,
      .rough-node.c2 path:last-child,
      .rough-node.groupB path:last-child {
        stroke: #b4befe !important;
      }

      .rough-node.email path:first-child,
      .rough-node.email path:last-child {
        stroke: #a6e3a1 !important;
      }

      .rough-node.c3 path:first-child {
        stroke: #cba6f7 !important;
      }
      .rough-node.c3 path:last-child {
        stroke: #b4befe !important;
      }

      /* partitions */
      .rough-node.p0 path:first-child,
      .rough-node.p0Leader path:first-child,
      .rough-node.p0Replica path:first-child,
      .rough-node.offset0 path:first-child {
        stroke: #94e2d5 !important;
      }
      .rough-node.p0 path:last-child,
      .rough-node.p0Leader path:last-child,
      .rough-node.p0Replica path:last-child,
      .rough-node.offset0 path:last-child {
        stroke: #94e2d5 !important;
      }

      .rough-node.p1 path:first-child,
      .rough-node.p1Leader path:first-child,
      .rough-node.p1Replica path:first-child,
      .rough-node.offset1 path:first-child {
        stroke: #89b4fa !important;
      }
      .rough-node.p1 path:last-child,
      .rough-node.p1Leader path:last-child,
      .rough-node.p1Replica path:last-child,
      .rough-node.offset1 path:last-child {
        stroke: #74c7ec !important;
      }

      .rough-node.p2 path:first-child,
      .rough-node.p2Leader path:first-child,
      .rough-node.p2Replica path:first-child,
      .rough-node.offset2 path:first-child {
        stroke: #cba6f7 !important;
      }
      .rough-node.p2 path:last-child,
      .rough-node.p2Leader path:last-child,
      .rough-node.p2Replica path:last-child,
      .rough-node.offset2 path:last-child {
        stroke: #b4befe !important;
      }

      .rough-node.offset3 path:first-child {
        stroke: #fab387 !important;
      }
      .rough-node.offset3 path:last-child {
        stroke: #f38ba8 !important;
      }

      .rough-node.offset4 path:first-child {
        stroke: #f9e2af !important;
      }
      .rough-node.offset4 path:last-child {
        stroke: #fab387 !important;
      }

      .rough-node.marker path:first-child {
        stroke: #f5c2e7 !important;
      }
      .rough-node.marker path:last-child {
        stroke: #cba6f7 !important;
      }

      /* group / subgraph containers */
      .label-container rect {
        fill: transparent !important;
        stroke: transparent !important;
      }

      /* external actor */
      .rough-node.client path:first-child {
        stroke: #cdd6f4 !important;
      }
      .rough-node.client path:last-child {
        stroke: #9399b2 !important;
      }

      .rough-node.group path:first-child,
      .rough-node.broker-group path:first-child {
        stroke: #cba6f7 !important;
      }
      .rough-node.group path:last-child,
      .rough-node.broker-group path:last-child {
        stroke: #b4befe !important;
      }

      /* broker / infra nodes */
      .rough-node.broker path:first-child {
        stroke: #9399b2 !important;
      }
      .rough-node.broker path:last-child {
        stroke: #cdd6f4 !important;
      }

      /* labels */
      .nodeLabel,
      .edgeLabel {
        font-family: 'Patrick Hand', 'Poppins', sans-serif !important;
        letter-spacing: 0.02em;
      }

      .nodeLabel p {
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        width: 12rem;
        min-height: 3rem;
        margin: 0;
        padding: 0.15em 0.4em;
        font-weight: 500;
        line-height: 1.1;
        text-align: center;
        color: #e6e9f7 !important;
        text-shadow: none;
        background: transparent;
      }

      .rough-node.topic .nodeLabel p {
        color: #cdd6f4 !important;
        width: 10rem;
        min-height: 2.6rem;
        padding: 0.18em 0.55em;
      }

      .cluster .nodeLabel p {
        width: auto;
        min-width: 0;
        min-height: 0;
        background: rgba(17, 17, 27, 0.7);
        color: #e6e9f7 !important;
      }

      .cluster.topic .nodeLabel p {
        color: #cdd6f4 !important;
      }

      .edgeLabel .labelBkg {
        background: transparent !important;
        border: none !important;
      }

      .edgeLabel:has(span:empty),
      .edgeLabel:has(p:empty) {
        display: none !important;
      }

      .edgeLabel p {
        text-align: center;
        background: rgba(17, 17, 27, 0.45);
        padding: 0.02em 0.28em;
        border-radius: 0.35em;
      }

      .flowchart-link {
        stroke: #bac2de;
        stroke-width: 2px;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .arrowMarkerPath {
        fill: #bac2de !important;
        stroke: #bac2de !important;
      }

      @media (prefers-reduced-motion: reduce) {
        .edge-animation-slow,
        .edge-animation-fast {
          animation: none !important;
          stroke-dashoffset: 0 !important;
        }
      }
    `,
    flowchart: {
      curve: 'basis',
    },
  }
}
