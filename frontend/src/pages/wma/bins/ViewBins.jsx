import { useEffect, useState } from "react";
import WMADrawer from "../components/WMADrawer";
import { getAllBinsForWma, getUrgentBinsForWma, forwardBinToAdmin } from "../../../api/binApi";
import WmaBinsReport from './WmaBinsReport';

// Chart.js is already a project dependency (package.json)

const ViewBins = () => {
  const [bins, setBins] = useState([]);
  const [urgent, setUrgent] = useState([]);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const fetchBins = async () => {
    try {
      const res = await getAllBinsForWma();
      setBins(res || []);
    } catch (err) {
      console.error("Failed to fetch bins:", err);
    }
  };

  const fetchUrgent = async () => {
    try {
      const res = await getUrgentBinsForWma();
      setUrgent(res || []);
    } catch (err) {
      console.error("Failed to fetch urgent bins:", err);
    }
  };

  useEffect(() => {
    fetchBins();
    fetchUrgent();
  }, []);

  return (
    <WMADrawer>
      <div className="p-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-green-900">Bins</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setIsReportOpen(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Generate Report
              </button>
            </div>
            {bins.map((b) => (
              <div key={b._id} className="flex justify-between items-start p-4 border rounded-md hover:shadow-sm transition">
                <div>
                  <div className="font-medium text-lg">{b.name} {b.isUrgent && <span className="text-red-600 font-bold">(URGENT)</span>}</div>
                  <div className="text-sm text-gray-600 mt-1">Address: {b.address}</div>
                  <div className="text-sm text-gray-600">Owner: {b.owner?.username || b.owner}</div>
                </div>

                <div className="text-right">
                  <div className="text-sm">Level: <span className="font-semibold">{b.currentLevel}</span> / {b.capacity}</div>
                  <div className="text-lg font-semibold mt-1">{b.percentageFilled}%</div>
                  {b.isUrgent && !b.forwardedToAdmin && (
                    <div className="mt-3">
                      <button
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                        onClick={async () => {
                          try {
                            await forwardBinToAdmin(b._id);
                            // refresh lists
                            fetchBins();
                            fetchUrgent();
                            alert('Bin forwarded to admin');
                          } catch (err) {
                            console.error('Failed to forward bin:', err);
                            alert('Failed to forward bin');
                          }
                        }}
                      >
                        Forward to Admin
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {bins.length === 0 && <div className="text-gray-600">No bins found for this WMA.</div>}
          </div>

          {urgent.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold">Urgent bins</h3>
              <div className="mt-2 space-y-2">
                {urgent.map((u) => (
                  <div key={u._id} className="border p-2 rounded bg-red-50">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-sm text-gray-700">{u.address}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {isReportOpen && (
        <WmaBinsReport bins={bins} urgent={urgent} onClose={() => setIsReportOpen(false)} />
      )}
    </WMADrawer>
  );
};

export default ViewBins;
