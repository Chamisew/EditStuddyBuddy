import React from 'react';
import { useNavigate } from 'react-router-dom';
import WMADrawer from '../components/WMADrawer';

const WmaReports = () => {
  const navigate = useNavigate();

  return (
    <WMADrawer>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Reports & Analytics</h2>
        <div className="flex flex-col gap-4">
          <div
            onClick={() => navigate('/wma/reports/schedules')}
            className="p-6 bg-white rounded-lg shadow hover:shadow-md cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between"
          >
            <div>
              <h3 className="font-semibold text-lg">Schedules Report</h3>
              <p className="text-sm text-gray-600 max-w-xl">Analyze schedules by status and area. Export a PDF containing status distribution and schedules-per-area charts.</p>
              <p className="text-xs text-gray-400 mt-2">Includes: Status distribution, Schedules per area</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Open report</span>
            </div>
          </div>

          <div
            onClick={() => navigate('/wma/reports/bins')}
            className="p-6 bg-white rounded-lg shadow hover:shadow-md cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between"
          >
            <div>
              <h3 className="font-semibold text-lg">Bins Report</h3>
              <p className="text-sm text-gray-600 max-w-xl">Review bin fill levels and urgent bins. Export a PDF with fill percentage bar chart and urgent/normal pie chart.</p>
              <p className="text-xs text-gray-400 mt-2">Includes: Bin fill %, Urgent vs Normal counts</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Open report</span>
            </div>
          </div>

          <div
            onClick={() => navigate('/wma/reports/collectors')}
            className="p-6 bg-white rounded-lg shadow hover:shadow-md cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between"
          >
            <div>
              <h3 className="font-semibold text-lg">Collectors Details</h3>
              <p className="text-sm text-gray-600 max-w-xl">View a detailed table of registered collectors including contact information and truck numbers. Export the table to a PDF.</p>
              <p className="text-xs text-gray-400 mt-2">Includes: Name, Truck No, NIC, Contact</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">Open report</span>
            </div>
          </div>
        </div>
      </div>
    </WMADrawer>
  );
};

export default WmaReports;
