import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import WMADrawer from "../components/WMADrawer";
import { ToastContainer, toast } from "react-toastify";
import { getAllCollectorsInWma } from "../../../api/collectorApi";
import { updateSchedule } from "../../../api/scheduleApi";
import CloseIcon from "@mui/icons-material/Close";

const ScheduleUpdate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collectors, setCollectors] = useState([]);
  const [filteredCollectors, setFilteredCollectors] = useState([]);
  const [wma, setWma] = useState(location.state.schedule.wmaId);
  const [collector, setCollector] = useState(
    location.state.schedule.collectorId,
  );
  const [area, setArea] = useState(location.state.schedule.area.name);
  const [date, setDate] = useState(location.state.schedule.date);
  const [time, setTime] = useState(location.state.schedule.time);
  const [status, setStatus] = useState(location.state.schedule.status);

  const fetchAllCollectorsInWma = async (currentWma) => {
    try {
      const res = await getAllCollectorsInWma(currentWma._id);
      setCollectors(res);
      setFilteredCollectors(res);
    } catch (error) {
      alert(error.message);
      console.error("Error fetching collectors: ", error.message);
    }
  };

  useEffect(() => {
    if (wma) {
      fetchAllCollectorsInWma(wma);
    }
  }, [wma]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        collectorId: collector,
        status,
      };
      await updateSchedule(body, location.state.schedule._id);
      toast.success("schedule status updated successfully!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setTimeout(() => {
        navigate("/wma/schedules");
      }, 2000);
    } catch (error) {
      console.error("Error updating garbage status:", error.message);
      toast.error("Failed to update garbage status.");
    }
  };

  return (
    <WMADrawer>
      <div className="grid grid-cols-1 lg:grid-cols- gap-8 p-6">
        {/* Form Section */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div
            className=" float-right cursor-pointer"
            onClick={() => navigate("/wma/schedules")}
          >
            <CloseIcon />
          </div>
          <h2 className="text-2xl font-bold text-gray-700 mb-6">
            Update Schedule Details
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <label className="block text-gray-600 font-medium">
                  Wast Management Authority
                </label>
                <input
                  type="text"
                  value={wma.wmaname}
                  readOnly
                  className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium">
                  Collector
                </label>
                <select
                  value={collector._id}
                  onChange={(e) => setCollector(e.target.value)}
                  className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="" disabled>
                    Select Waste Collector
                  </option>
                  {filteredCollectors.map((collector) => {
                    return (
                      <option key={collector._id} value={collector._id}>
                        {collector.truckNumber}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-10">
              <div>
                <label className="block text-gray-600 font-medium">Area</label>
                <input
                  type="text"
                  value={area}
                  readOnly
                  className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  value={new Date(date).toISOString().split("T")[0]}
                  readOnly
                  min={new Date().toISOString().split("T")[0]}
                  max={
                    new Date(new Date().setDate(new Date().getDate() + 14))
                      .toISOString()
                      .split("T")[0]
                  }
                  className="mt-2 block w-full p-[10px] border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <label className="block text-gray-600 font-medium">
                  Scheduled Time
                </label>
                <input
                  type="time"
                  value={time}
                  readOnly
                  min="09:00"
                  max="17:00"
                  className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="py-3 px-8 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 focus:ring-4 focus:ring-green-400"
              >
                Update Status
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </WMADrawer>
  );
};

export default ScheduleUpdate;
