import { useEffect, useState } from "react";
import AdminDrawer from "../components/AdminDrawer";
import BinApi from "../../../api/binApi";
import { createSchedule } from "../../../api/scheduleApi";
import { useNavigate } from "react-router-dom";

const AdminBins = () => {
  const [bins, setBins] = useState([]);
  const navigate = useNavigate();

  const fetchBins = async () => {
    try {
      const res = await BinApi.getBinsForwardedToAdmin();
      setBins(res || []);
    } catch (err) {
      console.error("Failed to fetch forwarded bins:", err);
    }
  };

  useEffect(() => {
    fetchBins();
  }, []);

  const handleCreateSchedule = (bin) => {
    // Navigate to the admin schedule creation form with the bin prefilled
    navigate('/admin/schedules/create', { state: { bin } });
  };

  return (
    <AdminDrawer>
      <div className="p-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-green-900">Forwarded Bins</h2>
          </div>

          <div className="space-y-4">
            {bins.map((b) => (
              <div key={b._id} className="flex justify-between items-start p-4 border rounded-md hover:shadow-sm transition">
                <div>
                  <div className="font-medium text-lg">{b.name} {b.isUrgent && <span className="text-red-600 font-bold">(URGENT)</span>}</div>
                  <div className="text-sm text-gray-600 mt-1">Address: {b.address}</div>
                  <div className="text-sm text-gray-600">Owner: {b.owner?.username || b.owner}</div>
                  <div className="text-sm text-gray-600">Forwarded At: {b.forwardedAt ? new Date(b.forwardedAt).toLocaleString() : 'N/A'}</div>
                </div>

                <div className="text-right">
                  <div className="text-sm">Level: <span className="font-semibold">{b.currentLevel}</span> / {b.capacity}</div>
                  <div className="text-lg font-semibold mt-1">{b.percentageFilled}%</div>
                  <div className="mt-3">
                    {b.scheduleId ? (
                      <button className="bg-gray-400 text-white px-4 py-2 rounded-md" disabled>
                        Created Schedule
                      </button>
                    ) : (
                      <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition" onClick={() => handleCreateSchedule(b)}>
                        Create Schedule
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {bins.length === 0 && <div className="text-gray-600">No forwarded bins.</div>}
          </div>
        </div>
      </div>
    </AdminDrawer>
  );
};

export default AdminBins;
