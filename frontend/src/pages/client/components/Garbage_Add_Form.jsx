import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Divider } from "@mui/material";
import { createGarbage, getGarbageQr } from "../../../api/garbageApi";
import UserApi from "../../../api/userApi";
import { getAllAreas } from "../../../api/areaApi";
// import { createTransaction } from "../../../api/transactionApi";

export default function Garbage_Add_Form() {
  const [areas, setAreas] = useState([]);
  const [garbageEntryData, setGarbageEntryData] = useState({
    area: "",
    address: "",
    latitude: "",
    longitude: "",
    type: "",
    weight: "", // Add weight field
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

  // Prefill address from current user profile when component mounts
  useEffect(() => {
    const fetchUserAddress = async () => {
      try {
        const user = await UserApi.getCurrentUserDetails();
        if (user && user.address) {
          setGarbageEntryData((prev) => ({ ...prev, address: prev.address || user.address }));
        }
      } catch (err) {
        // ignore - not critical
      }
    };
    fetchUserAddress();
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const handleOpenModal = () => setIsOpen(true);
  const handleCloseModal = () => setIsOpen(false);

  const { area, address, latitude, longitude, type, weight } = garbageEntryData;

  const [touched, setTouched] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [createdGarbage, setCreatedGarbage] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [geoAvailable, setGeoAvailable] = useState(true);
  const [wasteDetailsText, setWasteDetailsText] = useState("");
  const [selectedImages, setSelectedImages] = useState([]); // File objects
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);

  const handleChange = (e) => {
    setGarbageEntryData({
      ...garbageEntryData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Upload selected images to Cloudinary (if any) and collect URLs
    let imageUrls = [];
    if (selectedImages && selectedImages.length > 0) {
      try {
        const uploadPromises = selectedImages.map(async (file) => {
          const data = new FormData();
          data.append("file", file);
          data.append("upload_preset", "GarboGoUser_Preset");
          const res = await fetch("https://api.cloudinary.com/v1_1/dg8cpnx1m/image/upload", {
            method: "POST",
            body: data,
          });
          const json = await res.json();
          return json.url;
        });
        imageUrls = await Promise.all(uploadPromises);
        setUploadedImageUrls(imageUrls);
      } catch (err) {
        console.error("Image upload failed:", err);
        toast.error("Failed to upload images. Try again or remove images.");
        setIsLoading(false);
        return;
      }
    }

    const newGarbageEntry = {
      area,
      address,
      // send numeric coords when available, otherwise null
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      type,
      weight: parseFloat(
        areas.find((a) => a._id === area)?.type === "weightBased" ? weight : 0,
      ), // Set weight based on area type
      wasteDetails: wasteDetailsText,
      images: imageUrls,
    };

    // const newTransaction = {
    //   description: `Garbage Disposal Request - ${type}`,
    //   isRefund: type === "Recyclable" ? true : false,
    //   isPaid: type === "Recyclable" ? true : false,
    //   amount:
    //     areas.find((a) => a._id === area)?.type === "weightBased"
    //       ? weight * areas.find((a) => a._id === area)?.rate
    //       : areas.find((a) => a._id === area)?.rate, // Calculate amount based on weight and area rate
    // };

    try {
      // console.log(`newGarbageEntry => `, newGarbageEntry);
      // console.log(`newTransaction => `, newTransaction);
      const created = await createGarbage(newGarbageEntry);
      setCreatedGarbage(created);
      // Fetch QR image data URL from backend (dev endpoint)
      try {
        const qr = await getGarbageQr(created._id);
        setQrData(qr.dataUrl || qr.dataUrl);
      } catch (err) {
        console.warn("Failed to fetch QR", err.message || err);
      }
      // await createTransaction(newTransaction);

      toast.success("Garbage entry submitted successfully!", {
        position: "bottom-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });

      setIsSubmit(true);
      setTimeout(() => {
        // close modal after a delay; we keep the modal so user can download QR immediately
        setIsOpen(false);
        // reload after a short pause so user sees QR if they choose to download
        setTimeout(() => window.location.reload(), 1500);
      }, 3000);
    } catch (error) {
      console.error("Error submitting garbage entry:", error);
      toast.error("Failed to submit garbage entry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date();
    setGarbageEntryData((prevData) => ({
      ...prevData,
      date: today.toDateString(),
    }));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGarbageEntryData((prevData) => ({
            ...prevData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          setGeoAvailable(true);
        },
        (error) => {
          console.error("Error getting location:", error);
          setGeoAvailable(false);
          // Show a friendly message but don't block form submission
          if (error && error.code === 1) {
            toast.info(
              "Location permission denied. You can enter coordinates manually or submit with address only. To reset permissions click the lock/tune icon next to the URL.",
            );
          } else {
            toast.info(
              "Unable to get location automatically. You can enter coordinates manually.",
            );
          }
        },
      );
    } else {
      setGeoAvailable(false);
      toast.info(
        "Geolocation is not supported by your browser. Please enter coordinates manually if needed.",
      );
    }
  }, []);

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  return (
    <div>
      <button
        onClick={handleOpenModal}
        className="px-4 py-2 bg-green-800 text-white rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
      >
        Make Garbage Request
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="fixed left-1/2 top-[55%] transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-xl bg-white p-6 rounded-lg shadow-lg max-h-[85vh] overflow-y-auto z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              aria-label="Close"
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 bg-transparent rounded-full p-1 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <h1 className="text-xl mb-4 font-semibold text-center text-gray-800">
              Garbage Disposal Request
            </h1>
            <Divider className="mb-6" />
            <br />
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
                    } focus:border-green-500 focus:ring focus:ring-green-200`}
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
                    Garbage Type
                  </label>
                  <select
                    value={type}
                    name="type"
                    onChange={handleChange}
                    className="mt-1 p-3 w-full rounded-md border border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200"
                  >
                    <option value="default">Choose type</option>
                    <option value="Recyclable">Recyclable Waste</option>
                    <option value="Non-Recyclable">Non-Recyclable Waste</option>
                    {/* Add this option */}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  name="address"
                  onBlur={() => handleBlur("address")}
                  onChange={handleChange}
                  placeholder="Enter address"
                  className={`mt-1 p-3 w-full rounded-md border ${
                    !address && touched.address
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:border-green-500 focus:ring focus:ring-green-200`}
                />
                {!address && touched.address && (
                  <p className="text-red-600 text-sm mt-1">
                    * Address Required
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Waste Details
                </label>
                <textarea
                  value={wasteDetailsText}
                  onChange={(e) => setWasteDetailsText(e.target.value)}
                  placeholder="Describe the waste (e.g., broken furniture, mixed recyclables, food waste, etc.)"
                  className="mt-1 p-3 w-full rounded-md border border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Upload Images (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setSelectedImages(files);
                  }}
                  className="mt-2"
                />
                {selectedImages.length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {selectedImages.map((f, idx) => (
                      <div key={idx} className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">
                        {f.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Show weight input if the selected area's type is weightBased */}
              {areas.find((a) => a._id === area)?.type === "weightBased" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Weight of Garbage (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    name="weight"
                    onBlur={() => handleBlur("weight")}
                    onChange={handleChange}
                    placeholder="Enter weight in kg"
                    className={`mt-1 p-3 w-full rounded-md border ${
                      !weight && touched.weight
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:border-green-500 focus:ring focus:ring-green-200`}
                  />
                  {!weight && touched.weight && (
                    <p className="text-red-600 text-sm mt-1">
                      * Weight Required
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-center">
                <div className="w-full">
                  <div className="mb-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!navigator.geolocation) {
                          toast.error(
                            "Geolocation not supported by your browser.",
                          );
                          return;
                        }
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            setGarbageEntryData((prev) => ({
                              ...prev,
                              latitude: position.coords.latitude,
                              longitude: position.coords.longitude,
                            }));
                            setGeoAvailable(true);
                            toast.success("Location retrieved successfully.");
                          },
                          (error) => {
                            console.error("Error getting location:", error);
                            setGeoAvailable(false);
                            if (error && error.code === 1) {
                              toast.error(
                                "Location permission denied. To reset: click the lock/tune icon next to the URL and allow Location. You can still submit with address only.",
                              );
                            } else {
                              toast.error(
                                "Unable to retrieve location. Enter coords manually.",
                              );
                            }
                          },
                        );
                      }}
                      className="py-2 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-500"
                    >
                      Retry Location
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setGarbageEntryData((prev) => ({
                          ...prev,
                          latitude: "",
                          longitude: "",
                        }));
                        setGeoAvailable(false);
                        toast.info("You can now enter coordinates manually.");
                      }}
                      className="py-2 px-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-100"
                    >
                      Enter Coordinates Manually
                    </button>
                  </div>

                  {!geoAvailable && (
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Latitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          name="latitude"
                          value={latitude}
                          onChange={handleChange}
                          placeholder="e.g. -1.2921"
                          className="mt-1 p-3 w-full rounded-md border border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Longitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          name="longitude"
                          value={longitude}
                          onChange={handleChange}
                          placeholder="e.g. 36.8219"
                          className="mt-1 p-3 w-full rounded-md border border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={
                      !address ||
                      (areas.find((a) => a._id === area)?.type ===
                        "weightBased" &&
                        !weight)
                    }
                    className={`w-full py-3 px-4 font-semibold rounded-lg shadow-md text-white ${
                      !address ||
                      (areas.find((a) => a._id === area)?.type ===
                        "weightBased" &&
                        !weight)
                        ? "bg-gray-300"
                        : "bg-green-700 hover:bg-green-600"
                    } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50`}
                  >
                    {isLoading ? "Adding..." : "Make Request"}
                  </button>
                </div>
              </div>
            </form>
            {/* Show QR if available */}
            {qrData && (
              <div className="mt-4 text-center">
                <h3 className="font-semibold mb-2">Request QR</h3>
                <img
                  src={qrData}
                  alt="Garbage QR"
                  className="mx-auto"
                  style={{ width: 220, height: 220 }}
                />
                <div className="mt-2">
                  <a
                    href={qrData}
                    download={`garbage-${createdGarbage?._id || "qr"}.png`}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Download QR
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
