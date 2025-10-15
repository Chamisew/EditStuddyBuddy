import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ResponsiveDrawer from "../components/AdminDrawer";
import WmaAuthService from "../../../api/wmaApi";
import { ToastContainer, toast } from "react-toastify";
import { getAllCollectors } from "../../../api/collectorApi";
import { getAllAreas } from "../../../api/areaApi";
import { createSchedule } from "../../../api/scheduleApi";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation } from "react-router-dom";

const AdminScheduleCreate = () => {
  const navigate = useNavigate();
  const [wmas, setWmas] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [filteredCollectors, setFilteredCollectors] = useState([]);
  const [areas, setAreas] = useState([]);
  const [wma, setWma] = useState();
  const [collector, setCollector] = useState();
  const [area, setArea] = useState();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(() => {
    const currentTime = new Date();
    const hours = currentTime.getHours().toString().padStart(2, "0");
    const minutes = currentTime.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  });

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

  // If navigated from a bin, prefill wma and area
  const location = useLocation();
  useEffect(() => {
    if (location && location.state && location.state.bin) {
      const bin = location.state.bin;
      // bin.wmaId may be an object or id
      const wmaId = bin.wmaId && (bin.wmaId._id || bin.wmaId);
      const areaId = bin.area && (bin.area._id || bin.area);
      if (wmaId) setWma(wmaId);
      if (areaId) setArea(areaId);
    }
  }, [location]);

  const wmaChangeHandler = (e) => {
    e.preventDefault();
    const selectedWma = e.target.value;
    setWma(selectedWma);
    // normalize collector.wmaId which may be an object with _id or a plain id string
    const fcollectors = collectors.filter((collector) => {
      const wid = collector.wmaId && (collector.wmaId._id || collector.wmaId);
      return String(wid) === String(selectedWma);
    });
    setFilteredCollectors(fcollectors);
    // reset selected collector when WMA changes
    setCollector("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields on client before sending
      if (!wma || !collector || !area || !date || !time) {
        toast.error(
          "Please fill all required fields before creating a schedule.",
        );
        return;
      }

      const newSchedule = {
        wmaId: wma,
        collectorId: collector,
        area,
        date,
        time,
        // If this form was opened from a forwarded bin, include binId so backend links it
        binId: location && location.state && location.state.bin ? (location.state.bin._id || location.state.bin) : undefined,
      };
      console.log(newSchedule);
      await createSchedule(newSchedule);
      toast.success("schedule status Created successfully!", {
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
      console.error("Error creating schedule status:", error.message);
      toast.error("Failed to create schedule status.");
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
            Create New Schedule
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <label className="block text-gray-600 font-medium">
                  Wast Management Authority
                </label>
                <select
                  value={wma}
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
                  value={collector}
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
                  value={area}
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
                  // value={new Date(date).toISOString().split("T")[0]}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="py-3 px-8 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 focus:ring-4 focus:ring-green-400"
              >
                Create Schedule
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </ResponsiveDrawer>
  );
};

export default AdminScheduleCreate;
