import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { jsPDF } from 'jspdf';
Chart.register(...registerables);

const WmaSchedulesReport = ({ schedules, onClose }) => {
  const pieRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    if (!schedules) return;

    // Status distribution (pie)
    const statusCounts = schedules.reduce((acc, s) => {
      const key = s.status || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const pieCtx = pieRef.current.getContext('2d');
    const pieChart = new Chart(pieCtx, {
      type: 'pie',
      data: {
        labels: Object.keys(statusCounts),
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: ['#F59E0B', '#10B981', '#EF4444', '#9CA3AF']
        }]
      },
      options: { responsive: true }
    });

    // Schedules per area (bar)
    const areaCounts = schedules.reduce((acc, s) => {
      const name = s.area?.name || 'Unassigned';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    const barCtx = barRef.current.getContext('2d');
    const barChart = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: Object.keys(areaCounts),
        datasets: [{
          label: 'Schedules',
          data: Object.values(areaCounts),
          backgroundColor: 'rgba(59,130,246,0.8)'
        }]
      },
      options: { responsive: true }
    });

    return () => {
      pieChart.destroy();
      barChart.destroy();
    };
  }, [schedules]);

  const canvasToImage = (canvas) =>
    new Promise((resolve) => {
      const dataUrl = canvas.toDataURL('image/png');
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => resolve(img);
    });

  const handleDownloadPdf = async () => {
    try {
      const pieCanvas = pieRef.current;
      const barCanvas = barRef.current;
      if (!pieCanvas || !barCanvas) return;

      const [pieImg, barImg] = await Promise.all([canvasToImage(pieCanvas), canvasToImage(barCanvas)]);

      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 10;
      const usableWidth = pageWidth - margin * 2;

      pdf.setFontSize(16);
      pdf.text('WMA Schedules Report', margin, 20);

      const pieRatio = pieImg.width / pieImg.height;
      const piePdfWidth = usableWidth;
      const piePdfHeight = piePdfWidth / pieRatio;
      pdf.addImage(pieImg, 'PNG', margin, 30, piePdfWidth, piePdfHeight);

      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('Schedules per Area', margin, 20);

      const barRatio = barImg.width / barImg.height;
      const barPdfWidth = usableWidth;
      const barPdfHeight = barPdfWidth / barRatio;
      pdf.addImage(barImg, 'PNG', margin, 30, barPdfWidth, barPdfHeight);

      pdf.save(`wma-schedules-report-${Date.now()}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      alert('Failed to generate PDF');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg w-11/12 md:w-3/4 lg:w-2/3 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Schedules Report</h3>
          <button onClick={onClose} className="text-gray-600">Close</button>
        </div>

        <div className="flex justify-end gap-3 mb-4">
          <button onClick={handleDownloadPdf} className="bg-brand-700 text-white px-3 py-1 rounded-md text-sm">Download PDF</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm text-gray-700 mb-2">Status Distribution</h4>
            <canvas ref={pieRef} />
          </div>
          <div>
            <h4 className="text-sm text-gray-700 mb-2">Schedules per Area</h4>
            <canvas ref={barRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WmaSchedulesReport;
