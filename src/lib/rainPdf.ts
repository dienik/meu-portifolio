import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import type { AreaRainReport } from './rain'

export async function exportRainPdf(element: HTMLElement, report: AreaRainReport) {
  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: true,
  })
  const image = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = 210
  const pageHeight = 297
  const margin = 10
  const usable = pageWidth - margin * 2
  const imgHeight = (canvas.height * usable) / canvas.width
  let remaining = imgHeight
  let position = margin
  pdf.addImage(image, 'PNG', margin, position, usable, imgHeight)
  remaining -= pageHeight - margin * 2
  while (remaining > 0) {
    position -= pageHeight - margin
    pdf.addPage()
    pdf.addImage(image, 'PNG', margin, position, usable, imgHeight)
    remaining -= pageHeight - margin
  }
  pdf.save(`chuva-area-${report.startDate}_${report.endDate}.pdf`)
}

export type HourlyRainPdfRow = {
  label: string
  mean: number
  max: number
  wet: number
  points: number
}

export function exportHourlyRainPdf(params: {
  place: string
  date: string
  startHour: number
  endHour: number
  rows: HourlyRainPdfRow[]
}) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const meanAll = params.rows.length
    ? params.rows.reduce((sum, row) => sum + row.mean, 0) / params.rows.length
    : 0
  const maxAll = params.rows.reduce((max, row) => Math.max(max, row.max), 0)

  pdf.setFontSize(18)
  pdf.text('Relatório de chuva', 16, 22)
  pdf.setFontSize(11)
  pdf.text(`Local: ${params.place}`, 16, 34)
  pdf.text(`Data: ${params.date} · ${String(params.startHour).padStart(2, '0')}h–${String(params.endHour).padStart(2, '0')}h`, 16, 41)
  pdf.text(`Média no intervalo: ${meanAll.toFixed(1)} mm · Máxima: ${maxAll.toFixed(1)} mm`, 16, 48)
  pdf.text('Fonte: Open-Meteo (CC BY 4.0). Grade local no entorno da cidade.', 16, 55)

  let y = 70
  pdf.setFontSize(12)
  pdf.text('Horário', 16, y)
  pdf.text('Média', 80, y)
  pdf.text('Máxima', 120, y)
  pdf.text('Pontos com chuva', 160, y)
  y += 8
  pdf.setFontSize(11)
  for (const row of params.rows) {
    if (y > 270) {
      pdf.addPage()
      y = 22
    }
    pdf.text(row.label, 16, y)
    pdf.text(`${row.mean.toFixed(1)} mm`, 80, y)
    pdf.text(`${row.max.toFixed(1)} mm`, 120, y)
    pdf.text(`${row.wet}/${row.points}`, 160, y)
    y += 8
  }

  const slug = params.place.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-')
  pdf.save(`chuva-${slug}-${params.date}-${params.startHour}h-${params.endHour}h.pdf`)
}
