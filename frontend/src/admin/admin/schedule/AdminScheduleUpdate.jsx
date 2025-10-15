import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ResponsiveDrawer from "../components/AdminDrawer";
import WmaAuthService from "../../../api/wmaApi";
import { ToastContainer, toast } from "react-toastify";
import { getAllCollectors } from "../../../api/collectorApi";
import { getAllAreas } from "../../../api/areaApi";
import { updateSchedule } from "../../../api/scheduleApi";
import CloseIcon from "@mui/icons-material/Close";

const AdminScheduleUpdate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [wmas, setWmas] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [filteredCollectors, setFilteredCollectors] = useState([]);
  const [areas, setAreas] = useState([]);
  const [wma, setWma] = useState(location.state.schedule.wmaId);
  const [collector, setCollector] = useState(
    location.state.schedule.collectorId,
  );
  const [area, setArea] = useState(location.state.schedule.area);
  const [date, setDate] = useState(location.state.schedule.date);
  const [time, setTime] = useState(location.state.schedule.time);

  const fetchAllWmas = async () => {
    try {
      const res = await WmaAuthService.getAllWmas();
      setWmas(res);
    } catch (error) {
      alert(error.message);
      console.error("Error fetching WMAs: ", error.message);
    }
  };

  const fetchAllCollectors = async () => {
    try {
      const res = await getAllCollectors();
      setCollectors(res);
      setFilteredCollectors(res);
    } catch (error) {
      alert(error.message);
      console.error("Error fetching collectors: ", error.message);
    }
  };

  const fetchAllAreas = async () => {
    try {
      const res = await getAllAreas();
      setAreas(res);
    } catch (error) {
      alert(error.message);
      console.error("Error fetching areas: ", error.message);
    }
  };

  useEffect(() => {
    fetchAllWmas();
    fetchAllCollectors();
    fetchAllAreas();
  }, []);

  const wmaChangeHandler = (e) => {
    e.preventDefault();
    setWma(e.target.value);
    const fcollectors = collectors.filter(
      (collector) => collector.wmaId === e.target.value,
    );
    setFilteredCollectors(fcollectors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        wma,
        collectorId: collector,
        area,
        date,
        time,
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
        navigate("/admin/schedules");
      }, 2000);
    } catch (error) {
      console.error("Error updating garbage status:", error.message);
      toast.error("Failed to update garbage status.");
    }
  };

  return (
    <ResponsiveDrawer>
      <div className="grid grid-cols-1 lg:grid-cols- gap-8 p-6">
        {/* Form Section */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div
            className=" float-right cursor-pointer"
            onClick={() => navigate("/admin/schedules")}
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
                <select
                  value={wma._id}
                  onChange={(e) => wmaChangeHandler(e)}
                  className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="" disabled>
                    Select Waste Management Authority
                  </option>
                  {wmas.map((wma) => {
                    return (
                      <option key={wma._id} value={wma._id}>
                        {wma.wmaname}
                      </option>
                    );
                  })}
                </select>
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
                <select
                  value={area._id}
                  onChange={(e) => setArea(e.target.value)}
                  className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="" disabled>
                    Select Collection Area
                  </option>
                  {areas.map((area) => {
                    return (
                      <option key={area._id} value={area._id}>
                        {area.name}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-gray-600 font-medium">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  value={new Date(date).toISOString().split("T")[0]}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  max={
                    new Date(new Date().setDate(new Date().getDate() + 14))
                      .toISOString()
                      .split("T")[0]
                  }
                  className="mt-2 block w-full p-[10px] border border-gray-300 rounded-lg bg-white"
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
                  onChange={(e) => setTime(e.target.value)}
                  min="09:00"
                  max="17:00"
                  className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium">
                  Status
                </label>
                <input
                  value={location.state.schedule.status}
                  readOnly
                  className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
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
    </ResponsiveDrawer>
  );
};

export default AdminScheduleUpdate;
