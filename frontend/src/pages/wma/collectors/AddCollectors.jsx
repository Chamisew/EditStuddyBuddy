import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import WMADrawer from "../components/WMADrawer";
import WmaAuthService from "../../../api/wmaApi";
import { ToastContainer, toast } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";
import { createCollector } from "../../../api/collectorApi";

const WmaCollectorCreate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentWma, setCurrentWma] = useState({});
  const [truckNumber, setTruckNumber] = useState("");
  const [collectorName, setCollectorName] = useState("");
  const [collectorNIC, setCollectorNIC] = useState("");
  const [contactNo, setContactNo] = useState("");
  // const [statusOfCollector, setStatusOfCollector] = useState();
  const [valideForm, setValideForm] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchCurrentWma = async () => {
    try {
      const res = await WmaAuthService.getCurrentWmaDetails();
      setCurrentWma(res);
    } catch (error) {
      alert(error.message);
      console.error("Error fetching WMAs: ", error.message);
    }
  };

  useEffect(() => {
    fetchCurrentWma();
  }, []);

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
    } else if (truckNumber.length == null) {
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
        wmaId: currentWma._id,
        truckNumber,
        collectorName,
        collectorNIC,
        contactNo,
      };
      await createCollector(body);
      toast.success("collector status added successfully!", {
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
        navigate("/wma/collectors");
      }, 2000);
    } catch (error) {
      console.error("Error adding collector status:", error.message);
      toast.error("Failed to add collector status.");
    }
  };

  return (
    <WMADrawer>
      <div className="grid grid-cols-1 lg:grid-cols- gap-8 p-6">
        {/* Form Section */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div
            className=" float-right cursor-pointer"
            onClick={() => navigate("/wma/collectors")}
          >
            <CloseIcon />
          </div>
          <h2 className="text-2xl font-bold text-gray-700 mb-6">
            Update Collector Details
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <label className="block text-gray-600 font-medium">
                  Wast Management Authority
                </label>
                <input
                  type="text"
                  value={currentWma.wmaname}
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
              {/* <div>
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
              </div> */}
            </div>
            <div className=" mt-5">
              <span className=" text-red-500">{formError}</span>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                /* onClick removed: form handles submit via onSubmit; pass undefined instead of string to avoid warnings */
                onClick={valideForm ? handleSubmit : undefined}
                disabled={!valideForm}
                className={`py-3 px-8 text-white rounded-lg transition duration-200 focus:ring-4 focus:ring-green-400 ${valideForm ? "bg-green-600 hover:bg-green-700" : "bg-gray-500"}`}
              >
                Add Collector
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </WMADrawer>
  );
};

export default WmaCollectorCreate;
