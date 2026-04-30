// Iconos SVG como functional components usando render functions (h)
// 100% compatible con Vue runtime-only (sin compilador de templates)
import { h } from 'vue'

function makeSvgIcon(children) {
  return {
    props: {
      size: { type: [Number, String], default: 16 },
    },
    setup(props) {
      return () =>
        h(
          'svg',
          {
            xmlns: 'http://www.w3.org/2000/svg',
            width: props.size,
            height: props.size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '2',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
          },
          children
        )
    },
  }
}

export const IconPlus = makeSvgIcon([
  h('line', { x1: 12, y1: 5, x2: 12, y2: 19 }),
  h('line', { x1: 5, y1: 12, x2: 19, y2: 12 }),
])

export const IconX = makeSvgIcon([
  h('line', { x1: 18, y1: 6, x2: 6, y2: 18 }),
  h('line', { x1: 6, y1: 6, x2: 18, y2: 18 }),
])

export const IconSave = makeSvgIcon([
  h('path', { d: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z' }),
  h('polyline', { points: '17 21 17 13 7 13 7 21' }),
  h('polyline', { points: '7 3 7 8 15 8' }),
])

export const IconEye = makeSvgIcon([
  h('path', { d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' }),
  h('circle', { cx: 12, cy: 12, r: 3 }),
])

export const IconDownload = makeSvgIcon([
  h('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
  h('polyline', { points: '7 10 12 15 17 10' }),
  h('line', { x1: 12, y1: 15, x2: 12, y2: 3 }),
])

export const IconUpload = makeSvgIcon([
  h('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
  h('polyline', { points: '17 8 12 3 7 8' }),
  h('line', { x1: 12, y1: 3, x2: 12, y2: 15 }),
])

export const IconSearch = makeSvgIcon([
  h('circle', { cx: 11, cy: 11, r: 8 }),
  h('line', { x1: 21, y1: 21, x2: 16.65, y2: 16.65 }),
])

export const IconEdit = makeSvgIcon([
  h('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
  h('path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' }),
])

export const IconTrash = makeSvgIcon([
  h('polyline', { points: '3 6 5 6 21 6' }),
  h('path', { d: 'M19 6l-1 14H6L5 6' }),
  h('path', { d: 'M10 11v6' }),
  h('path', { d: 'M14 11v6' }),
  h('path', { d: 'M9 6V4h6v2' }),
])
