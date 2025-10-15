import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ResponsiveDrawer from "../components/AdminDrawer";
import { updateGarbage } from "../../../api/garbageApi"; // Update the path accordingly
import { ToastContainer, toast } from "react-toastify";
import { createTransaction } from "../../../api/transactionApi";

const AdminGarbageUpdate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState(location.state.garbage.status);
  const [lat, setLat] = useState(location.state.garbage.latitude);
  const [lon, setLon] = useState(location.state.garbage.longitude);
  const [type, setType] = useState(location.state.garbage.typeOfGarbage);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare transaction data if status is being updated to "In Progress"
    if (status === "In Progress") {
      const areaType = location.state.garbage.area.type;
      const garbageWeight = location.state.garbage.weight;
      const rate = location.state.garbage.area.rate;

      let amount = areaType === "weightBased" ? garbageWeight * rate : rate; // Calculate amount

      // Apply discount if the garbage type is "Recyclable"
      if (location.state.garbage.type === "Recyclable") {
        amount *= 0.9; // Apply 10% discount
      }

      const newTransaction = {
        userID: location.state.garbage.user._id,
        description: `Garbage Collection: - ${location.state.garbage.type}`,
        isRefund: false,
        isPaid: false,
        amount: amount,
      };

      try {
        // console.log(`newTransaction => `, newTransaction);
        await createTransaction(newTransaction); // Create the transaction
        toast.success("Transaction created successfully!", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      } catch (error) {
        console.error("Error creating transaction:", error);
        toast.error("Failed to create transaction.");
      }
    }

    try {
      await updateGarbage(status, location.state.garbage._id); // Update garbage status
      toast.success("Garbage status updated successfully!", {
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
        navigate("/admin/garbage");
      }, 2000);
    } catch (error) {
      console.error("Error updating garbage status:", error.message);
      toast.error("Failed to update garbage status.");
    }
  };

  return (
    <ResponsiveDrawer>
      <div className="grid grid-cols-1 lg:grid-cols- gap-8 p-6">
        {/* Garbage Display Map */}
        <div className="w-full">
          {/* <GarbageDisplayMap
            garbagelat={lat}
            garbagelon={lon}
            garbagetype={type}
          /> */}
        </div>

        {/* Form Section */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-700 mb-6">
            Update Garbage Status
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-600 font-medium">Name</label>
                <input
                  type="text"
                  value={location.state.garbage.user.username}
                  readOnly
                  className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium">
                  Type of Garbage
                </label>
                <input
                  type="text"
                  value={location.state.garbage.type}
                  readOnly
                  className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-600 font-medium">Area</label>
                <input
                  type="text"
                  value={location.state.garbage.area.name}
                  readOnly
                  className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium">
                  Address
                </label>
                <input
                  type="text"
                  value={location.state.garbage.address}
                  readOnly
                  className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-600 font-medium">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={location.state.garbage.user.contact}
                  readOnly
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
                  {/* <option value="Collected">Collected</option> */}
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
    </ResponsiveDrawer>
  );
};

export default AdminGarbageUpdate;
