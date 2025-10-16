import { useEffect, useState } from "react";
import BinApi from "../../../api/binApi";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import IconButton from '@mui/material/IconButton';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAllAreas } from "../../../api/areaApi";

const BinCreateForm = () => {
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [bins, setBins] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchBins = async () => {
    try {
      const res = await BinApi.getMyBins();
      // apiHelper.get returns response.data directly, so res is the array
      setBins(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBins();
    const fetchAreas = async () => {
      try {
        const res = await getAllAreas();
        setAreas(res || []);
        if (res && res.length > 0) setSelectedArea(res[0]._id);
      } catch (err) {
        console.error("Failed to fetch areas:", err);
      }
    };
    fetchAreas();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
  await BinApi.createBin({ name, capacity: Number(capacity), area: selectedArea });
      setName("");
      setCapacity("");
      await fetchBins();
    } catch (err) {
      console.error("Failed to create bin:", err);
    } finally {
      setLoading(false);
    }
  };

  // Controlled inputs for add amounts per bin
  const [addAmounts, setAddAmounts] = useState({});

  const handleAddAmountChange = (binId, val) => {
    setAddAmounts((s) => ({ ...s, [binId]: val }));
  };

  const handleUpdateLevel = async (binId) => {
    const raw = addAmounts[binId] || 0;
    const level = Number(raw);
    if (Number.isNaN(level)) return;
    try {
      await BinApi.updateBinLevel(binId, { currentLevel: level });
      await fetchBins();
      setAddAmounts((s) => ({ ...s, [binId]: 0 }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBin = async (binId) => {
    const confirmed = window.confirm("Are you sure you want to delete this bin? This action cannot be undone.");
    if (!confirmed) return;

    try {
      await BinApi.deleteBin(binId);
      toast.success('Bin deleted successfully', { position: 'bottom-right' });
      await fetchBins();
    } catch (err) {
      console.error('Failed to delete bin', err);
      toast.error('Failed to delete bin. Please try again.', { position: 'bottom-right' });
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Create Bin</h2>

      <form onSubmit={handleCreate} className="space-y-2">
        <div>
          <label className="block text-sm">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-1 w-full"
          />
        </div>

        <div>
          <label className="block text-sm">Capacity</label>
          <input
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            type="number"
            className="border p-1 w-full"
          />
        </div>

        <div>
          <label className="block text-sm">Area</label>
          <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} className="border p-1 w-full">
            {areas.map((a) => (
              <option key={a._id} value={a._id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div>
          <button
            disabled={loading}
            className="disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-flex"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>

      <h3 className="text-lg font-semibold mt-6">My Bins</h3>

      <div className="space-y-4 mt-2">
        {bins.map((b) => (
          <div
            key={b._id}
            className="bg-green-100/30 border border-green-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-1"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-green-900">{b.name}</div>
                    <div className="text-sm text-gray-600 mt-1">{b.area?.name || 'Area'} • {b.address}</div>
                    <div className="text-xs text-gray-500 mt-1">Owner: {b.owner?.username || 'You'} • {b.owner?.contact || ''}</div>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/60 text-xs font-medium border border-green-200">Capacity: {b.capacity}</div>
                    {b.isUrgent && (
                      <div className="mt-2 text-xs text-red-600 font-bold">URGENT</div>
                    )}
                    <div className="mt-3 flex gap-1">
                      <IconButton size="small" aria-label="info" className="bg-white/50" onClick={() => alert(`Bin: ${b.name}\nAddress: ${b.address}`)}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" aria-label="edit" className="bg-white/50">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <div className="flex items-center justify-between gap-4">
                      <div className="w-2/3">
                        <div className="text-sm text-gray-700">Filled: <span className="font-semibold">{b.currentLevel}</span></div>
                        <div className="w-full bg-white/40 rounded-full h-2 mt-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: `${b.percentageFilled}%` }} />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{b.percentageFilled}% full</div>
                      </div>

                      <div className="w-1/3 flex flex-col items-end">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAddAmountChange(b._id, Math.max(0, (addAmounts[b._id] || 0) - 1))}
                            className="w-8 h-8 flex items-center justify-center bg-white/90 border rounded-full shadow-sm hover:scale-105 transition"
                            aria-label="decrease"
                          >
                            -
                          </button>

                          <input
                            type="number"
                            value={addAmounts[b._id] || 0}
                            onChange={(e) => handleAddAmountChange(b._id, e.target.value)}
                            className="w-16 text-center border rounded p-1"
                            min={0}
                            max={b.capacity}
                          />

                          <button
                            onClick={() => handleAddAmountChange(b._id, (Number(addAmounts[b._id] || 0) + 1))}
                            className="w-8 h-8 flex items-center justify-center bg-white/90 border rounded-full shadow-sm hover:scale-105 transition"
                            aria-label="increase"
                          >
                            +
                          </button>

                        </div>

                        <button
                          onClick={() => handleUpdateLevel(b._id)}
                          className="mt-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 rounded-full shadow hover:scale-105 transition"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => handleDeleteBin(b._id)}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-1 rounded-full shadow hover:scale-105 transition"
                      title="Delete bin"
                    >
                      <DeleteIcon style={{ fontSize: 16 }} />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ToastContainer />
    </div>
  );
};

export default BinCreateForm;
