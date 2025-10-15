import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ResponsiveDrawer from "../components/AdminDrawer";
import { ToastContainer, toast } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";
import { updateCollector } from "../../../api/collectorApi";

const AdminCollectorUpdate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [truckNumber, setTruckNumber] = useState(
    location.state.collector.truckNumber,
  );
  const [collectorName, setCollectorName] = useState(
    location.state.collector.collectorName,
  );
  const [collectorNIC, setCollectorNIC] = useState(
    location.state.collector.collectorNIC,
  );
  const [contactNo, setContactNo] = useState(
    location.state.collector.contactNo,
  );
  const [statusOfCollector, setStatusOfCollector] = useState(
    location.state.collector.statusOfCollector,
  );
  const [valideForm, setValideForm] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let isValid = true;

    if (contactNo.length !== 10) {
      setFormError("Invalid Contact Number");
      isValid = false;
    } else if (
      collectorNIC.length >= 0 &&
      !/^\d{12}$|^\d{10}V$/.test(collectorNIC)
    ) {
      setFormError("Invalid Collector NIC");
      isValid = false;
    } else if (
      collectorName.length >= 0 &&
      !/^[a-zA-Z\s]+$/.test(collectorName)
    ) {
      setFormError("Invalid Collector Name");
      isValid = false;
    } else if (truckNumber.length >= 0 && !/^[a-zA-Z0-9]*$/.test(truckNumber)) {
      setFormError("Invalid Truck Number");
      isValid = false;
    } else {
      setFormError("");
    }

    setValideForm(isValid);
  }, [contactNo, collectorNIC, collectorName, truckNumber]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        truckNumber,
        collectorName,
        collectorNIC,
        statusOfCollector,
        contactNo,
      };
      await updateCollector(body, location.state.collector._id);
      toast.success("collector status updated successfully!", {
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
        navigate("/admin/collectors");
      }, 2000);
    } catch (error) {
      console.error("Error updating collector status:", error.message);
      toast.error("Failed to update collector status.");
    }
  };

  return (
    <ResponsiveDrawer>
      <div className="grid grid-cols-1 lg:grid-cols- gap-8 p-6">
        {/* Form Section */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div
            className=" float-right cursor-pointer"
            onClick={() => navigate("/admin/collectors")}
          >
            <CloseIcon />
          </div>
          <h2 className="text-2xl font-bold text-gray-700 mb-6">
            Update Collector Details
          </h2>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <label className="block text-gray-600 font-medium">
                  Wast Management Authority
                </label>
                <input
                  type="text"
                  value={location.state.collector.wmaId.wmaname}
                  readOnly
                  className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium">
                  Collector Name
                </label>
                <input
                  value={collectorName}
                  onChange={(e) => {
                    const input = e.target.value;
                    if (/^[a-zA-Z\s]*$/.test(input)) {
                      setCollectorName(input);
                    }
                  }}
                  className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-10">
              <div>
                <label className="block text-gray-600 font-medium">
                  Collector NIC
                </label>
                <input
                  value={collectorNIC}
                  onChange={(e) => {
                    const input = e.target.value;
                    if (/^\d{0,12}$/.test(input) || /^\d{10}V$/.test(input)) {
                      setCollectorNIC(input);
                    }
                  }}
                  className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={contactNo}
                  onChange={(e) => {
                    const input = e.target.value;
                    if (/^\d*$/.test(input) && input.length <= 10) {
                      setContactNo(input);
                    }
                  }}
                  className="mt-2 block w-full p-[10px] border border-gray-300 rounded-lg bg-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <label className="block text-gray-600 font-medium">
                  Truck Number
                </label>
                <input
                  type="text"
                  value={truckNumber}
                  onChange={(e) => {
                    const input = e.target.value;
                    if (/^[a-zA-Z0-9]*$/.test(input) && input.length < 8) {
                      setTruckNumber(input);
                    }
                  }}
                  className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium">
                  Status
                </label>
                <select
                  value={statusOfCollector}
                  onChange={(e) => setStatusOfCollector(e.target.value)}
                  className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="Available">Available</option>
                  <option value="Not-Available">Not-Available</option>
                </select>
              </div>
            </div>
            <div className=" mt-5">
              <span className=" text-red-500">{formError}</span>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                onClick={valideForm ? handleSubmit : ""}
                disabled={!valideForm}
                className={`py-3 px-8 text-white rounded-lg transition duration-200 focus:ring-4 focus:ring-green-400 ${valideForm ? "bg-green-600 hover:bg-green-700" : "bg-gray-500"}`}
              >
                Update Details
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </ResponsiveDrawer>
  );
};

export default AdminCollectorUpdate;
