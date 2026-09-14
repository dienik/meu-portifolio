export function drawBarChart(
  canvas: HTMLCanvasElement,
  labels: string[],
  values: number[],
  title: string,
) {
  const context = canvas.getContext('2d')
  if (!context) return
  const width = canvas.width
  const height = canvas.height
  const pad = { top: 42, right: 16, bottom: 42, left: 44 }
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom
  const max = Math.max(...values, 0.1)

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)
  context.fillStyle = '#0f172a'
  context.font = '600 16px Plus Jakarta Sans, sans-serif'
  context.fillText(title, pad.left, 26)

  context.strokeStyle = '#e2e8f0'
  context.beginPath()
  context.moveTo(pad.left, pad.top)
  context.lineTo(pad.left, height - pad.bottom)
  context.lineTo(width - pad.right, height - pad.bottom)
  context.stroke()

  const barW = innerW / Math.max(values.length, 1)
  values.forEach((value, index) => {
    const h = (value / max) * innerH
    const x = pad.left + index * barW + barW * 0.18
    const y = height - pad.bottom - h
    context.fillStyle = '#0891b2'
    context.fillRect(x, y, barW * 0.64, h)
  })

  context.fillStyle = '#64748b'
  context.font = '11px Plus Jakarta Sans, sans-serif'
  const step = values.length > 10 ? Math.ceil(values.length / 6) : 1
  labels.forEach((label, index) => {
    if (index % step !== 0 && index !== labels.length - 1) return
    const short = label.slice(8) || label
    context.fillText(short, pad.left + index * barW + 4, height - 16)
  })
  context.fillText(`${max.toFixed(1)} mm`, 8, pad.top + 8)
}

export function drawLineChart(
  canvas: HTMLCanvasElement,
  labels: string[],
  values: number[],
  title: string,
) {
  const context = canvas.getContext('2d')
  if (!context) return
  const width = canvas.width
  const height = canvas.height
  const pad = { top: 42, right: 16, bottom: 42, left: 48 }
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom
  const max = Math.max(...values, 0.1)

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)
  context.fillStyle = '#0f172a'
  context.font = '600 16px Plus Jakarta Sans, sans-serif'
  context.fillText(title, pad.left, 26)

  context.strokeStyle = '#e2e8f0'
  context.beginPath()
  context.moveTo(pad.left, pad.top)
  context.lineTo(pad.left, height - pad.bottom)
  context.lineTo(width - pad.right, height - pad.bottom)
  context.stroke()

  context.beginPath()
  values.forEach((value, index) => {
    const x = pad.left + (index / Math.max(values.length - 1, 1)) * innerW
    const y = height - pad.bottom - (value / max) * innerH
    if (index === 0) context.moveTo(x, y)
    else context.lineTo(x, y)
  })
  context.strokeStyle = '#4f46e5'
  context.lineWidth = 2.4
  context.stroke()

  context.fillStyle = '#64748b'
  context.font = '11px Plus Jakarta Sans, sans-serif'
  context.fillText(`${max.toFixed(1)} mm`, 8, pad.top + 8)
  const last = labels[labels.length - 1]
  if (last) context.fillText(last.slice(8) || last, width - pad.right - 36, height - 16)
}
