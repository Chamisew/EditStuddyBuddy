import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Divider } from "@mui/material";
import { getAllAreas } from "../../../api/areaApi";
import { createSmartDeviceRequest } from "../../../api/smartDeviceApi";

export default function SmartDeviceRequestForm() {
  const [areas, setAreas] = useState([]);
  const [requestData, setRequestData] = useState({
    area: "",
    type: "",
    userId: "",
    latitude: "",
    longitude: "",
  });

  const fetchAllAreas = async () => {
    try {
      const areas = await getAllAreas();
      setAreas(areas);
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };

  useEffect(() => {
    fetchAllAreas();
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const handleOpenModal = () => setIsOpen(true);
  const handleCloseModal = () => setIsOpen(false);

  const { area, type, latitude, longitude } = requestData;

  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setRequestData({
      ...requestData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const newDeviceRequest = {
      area,
      type,
      latitude,
      longitude,
    };

    try {
      // console.log(newDeviceRequest);
      await createSmartDeviceRequest(newDeviceRequest);

      toast.success("Smart Device Request submitted successfully!", {
        position: "bottom-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });

      setTimeout(() => {
        setIsOpen(false);
        // window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("Error submitting smart device request:", error);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setRequestData((prevData) => ({
          ...prevData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
      },
      (error) => {
        console.error("Error getting location:", error);
      },
    );
  }, []);

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  return (
    <div>
      <button
        onClick={handleOpenModal}
        className="px-4 py-2 bg-green-800 text-white rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Request Smart Device
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative w-[90%] max-w-2xl bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl mb-5 font-bold text-center text-gray-800">
              Smart Device Request
            </h1>
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              X
            </button>
            <Divider className="mb-6" />
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Select Area
                  </label>
                  <select
                    value={area}
                    name="area"
                    onBlur={() => handleBlur("area")}
                    onChange={handleChange}
                    className={`mt-1 p-3 w-full rounded-md border ${
                      !area && touched.area
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:border-blue-500 focus:ring focus:ring-blue-200`}
                  >
                    <option value="" disabled>
                      -- Select Area --
                    </option>
                    {areas.map((area) => (
                      <option key={area.id} value={area._id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                  {!area && touched.area && (
                    <p className="text-red-600 text-sm mt-1">* Required</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={type}
                    name="type"
                    onChange={handleChange}
                    className="mt-1 p-3 w-full rounded-md border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                  >
                    <option value="default">Choose type</option>
                    <option value="recyclable">Recyclable</option>
                    <option value="non-recyclable">Non-Recyclable</option>
                  </select>
                </div>
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700">
                  User ID
                </label>
                <input
                  type="text"
                  value={userId}
                  name="userId"
                  onBlur={() => handleBlur("userId")}
                  onChange={handleChange}
                  placeholder="Enter user ID"
                  className={`mt-1 p-3 w-full rounded-md border ${
                    !userId && touched.userId
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:border-blue-500 focus:ring focus:ring-blue-200`}
                />
                {!userId && touched.userId && (
                  <p className="text-red-600 text-sm mt-1">
                    * User ID Required
                  </p>
                )}
              </div> */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={!area || !type || !latitude || !longitude}
                  className={`w-full py-3 px-4 font-semibold rounded-lg shadow-md text-white ${
                    !area || !type || !latitude || !longitude
                      ? "bg-gray-300"
                      : "bg-green-800 hover:bg-green-600"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                >
                  {isLoading ? "Submitting..." : "Request Device"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
