import { useEffect, useRef } from "react";
import { Chart, registerables } from 'chart.js';
import { jsPDF } from 'jspdf';
Chart.register(...registerables);

const WmaBinsReport = ({ bins, urgent, onClose }) => {
  const barRef = useRef(null);
  const pieRef = useRef(null);

  useEffect(() => {
    if (!bins) return;

    // Bar chart: bins fill percentage
    const labels = bins.map(b => b.name || (b._id ? b._id.slice(-4) : ''));
    const data = bins.map(b => Number(b.percentageFilled || 0));

    const barCtx = barRef.current.getContext('2d');
    const pieCtx = pieRef.current.getContext('2d');

    const barChart = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Fill %',
          data,
          backgroundColor: 'rgba(34,197,94,0.8)'
        }]
      },
      options: { responsive: true }
    });

    // Pie chart: urgent vs normal
    const urgentCount = urgent ? urgent.length : 0;
    const normalCount = bins.length - urgentCount;

    const pieChart = new Chart(pieCtx, {
      type: 'pie',
      data: {
        labels: ['Normal', 'Urgent'],
        datasets: [{
          data: [normalCount, urgentCount],
          backgroundColor: ['#10B981', '#EF4444']
        }]
      },
      options: { responsive: true }
    });

    return () => {
      barChart.destroy();
      pieChart.destroy();
    };
  }, [bins, urgent]);

  // Helper to convert canvas to Image element (promise)
  const canvasToImage = (canvas) =>
    new Promise((resolve) => {
      const dataUrl = canvas.toDataURL('image/png');
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => resolve(img);
    });

  const handleDownloadPdf = async () => {
    try {
      const barCanvas = barRef.current;
      const pieCanvas = pieRef.current;
      if (!barCanvas || !pieCanvas) return;

      const [barImg, pieImg] = await Promise.all([canvasToImage(barCanvas), canvasToImage(pieCanvas)]);

      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 10;
      const usableWidth = pageWidth - margin * 2;

      // Add title
      pdf.setFontSize(16);
      pdf.text('WMA Bins Report', margin, 20);

      // Add bar chart (first page)
      const barRatio = barImg.width / barImg.height;
      const barPdfWidth = usableWidth;
      const barPdfHeight = barPdfWidth / barRatio;
      pdf.addImage(barImg, 'PNG', margin, 30, barPdfWidth, barPdfHeight);

      // Add a new page for pie chart
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('Urgent vs Normal', margin, 20);

      const pieRatio = pieImg.width / pieImg.height;
      const piePdfWidth = usableWidth;
      const piePdfHeight = piePdfWidth / pieRatio;
      pdf.addImage(pieImg, 'PNG', margin, 30, piePdfWidth, piePdfHeight);

      pdf.save(`wma-bins-report-${Date.now()}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      alert('Failed to generate PDF');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg w-11/12 md:w-3/4 lg:w-2/3 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Bins Report</h3>
          <div className="flex items-center gap-3">
            <button onClick={handleDownloadPdf} className="bg-brand-700 text-white px-3 py-1 rounded-md text-sm">Download PDF</button>
            <button onClick={onClose} className="text-gray-600">Close</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm text-gray-700 mb-2">Fill Percentage per Bin</h4>
            <canvas ref={barRef} />
          </div>

          <div>
            <h4 className="text-sm text-gray-700 mb-2">Urgent vs Normal</h4>
            <canvas ref={pieRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WmaBinsReport;
