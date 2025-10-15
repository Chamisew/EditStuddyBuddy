import React from 'react';
import { jsPDF } from 'jspdf';

const WmaCollectorsReport = ({ collectors = [], onClose }) => {
  const handleDownloadPdf = () => {
    try {
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      const margin = 10;
      pdf.setFontSize(14);
      pdf.text('WMA Collectors Details', margin, 20);
      pdf.setFontSize(10);

      const startY = 30;
      const lineHeight = 6;
      let y = startY;

  // Header
  pdf.text('Name', margin, y);
  pdf.text('Truck No', margin + 60, y);
  pdf.text('NIC', margin + 120, y);
  pdf.text('Contact', margin + 160, y);
      y += lineHeight;

      collectors.forEach((c) => {
        if (y > pdf.internal.pageSize.getHeight() - 20) {
          pdf.addPage();
          y = startY;
        }
        pdf.text(c.collectorName || '-', margin, y);
        pdf.text(c.truckNumber || '-', margin + 60, y);
        pdf.text(c.collectorNIC || '-', margin + 120, y);
        pdf.text(c.contactNo || '-', margin + 160, y);
        y += lineHeight;
      });

      pdf.save(`wma-collectors-details-${Date.now()}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      alert('Failed to generate PDF');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg w-11/12 md:w-4/5 lg:w-4/5 p-6 max-h-[85vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Collectors Details</h3>
          <div className="flex items-center gap-3">
            <button onClick={handleDownloadPdf} className="bg-brand-700 text-white px-3 py-1 rounded-md text-sm">Download PDF</button>
            <button onClick={onClose} className="text-gray-600">Close</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Truck No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {collectors.length > 0 ? (
                collectors.map((collector) => (
                  <tr key={collector._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{collector.collectorName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{collector.truckNumber || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{collector.collectorNIC || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{collector.contactNo || '-'}</td>
                    
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600" colSpan={5}>No collectors found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WmaCollectorsReport;
