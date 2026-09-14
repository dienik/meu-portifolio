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
