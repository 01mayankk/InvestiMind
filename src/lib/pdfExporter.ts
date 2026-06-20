import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportDashboardToPDF(ticker: string): Promise<void> {
  const pages = ["pdf-page-1", "pdf-page-2", "pdf-page-3", "pdf-page-4", "pdf-page-5"];
  
  // Create PDF instance (A4 size: 210mm x 297mm)
  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = 210;
  const pdfHeight = 297;

  try {
    for (let i = 0; i < pages.length; i++) {
      const pageId = pages[i];
      const element = document.getElementById(pageId);

      if (!element) {
        console.warn(`PDF Page element not found: ${pageId}. Skipping.`);
        continue;
      }

      // Add page to PDF if we are on pages 2, 3, 4, 5
      if (i > 0) {
        pdf.addPage();
      }

      // Capture element using html2canvas
      // We set scale to 2 for crisp resolution in PDF print outs
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#0B0F19", // Force default dark dashboard background for high-fidelity export
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      
      // Draw image to fill A4 page bounds
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
    }

    // Save generated PDF report file
    const timestamp = new Date().toISOString().split("T")[0];
    pdf.save(`InvestiMind_AI_${ticker}_Research_${timestamp}.pdf`);
  } catch (error) {
    console.error("Failed to generate PDF export:", error);
    throw error;
  }
}
