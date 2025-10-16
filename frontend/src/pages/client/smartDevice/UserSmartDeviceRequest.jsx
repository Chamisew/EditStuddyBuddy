import { useEffect, useState } from "react";
import {
  deleteSmartDeviceRequest,
  getUserAllSmartDeviceRequests,
} from "../../../api/smartDeviceApi";
import DeleteIcon from "@mui/icons-material/Delete";

import { ToastContainer, toast } from "react-toastify";
// MUI
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import UserDrawer from "../components/UserDrawer";
import SmartDeviceAddForm from "../components/SmartDeviceAddForm";

const UserSmartDeviceRequest = () => {
  const [smartDevices, setSmartDevices] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  const fetchAllSmartDevices = async () => {
    try {
      const res = await getUserAllSmartDeviceRequests(); // Call the API to fetch smart device requests
      setSmartDevices(res); // Assuming setSmartDevices is your state setter for smart device data
    } catch (error) {
      toast.error(error.message, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      console.error("Error fetching smart device requests: ", error.message);
    }
  };

  useEffect(() => {
    fetchAllSmartDevices();
  }, []);

  console.log(`smart => `, smartDevices);
  const handleClickOpen = (id) => {
    setSelectedDeviceId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeleteDevice = async () => {
    if (selectedDeviceId) {
      try {
        await deleteSmartDeviceRequest(selectedDeviceId);

        // Refresh the smart device list after successful deletion
        const updatedSmartDevices = await getUserAllSmartDeviceRequests();
        setSmartDevices(updatedSmartDevices);

        handleClose();
        toast.success("Smart Device Request Deleted Successfully!", {
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
          window.location.reload();
        }, 3000);
      } catch (error) {
        console.error("Error deleting smart device request: ", error);
        toast.error(
          "Failed to delete smart device request. Please try again.",
          {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          },
        );
      }
    }
  };

  function getStatusClassName(status) {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Collected":
        return "bg-green-100 text-green-800";
      case "Distributed":
        return "bg-blue-100 text-blue-800";
      case "Inactive":
        return "bg-red-100 text-red-800";
      default:
        return "";
    }
  }
  function getDeviceTypeClassName(type) {
    switch (type) {
      case "Recyclable":
        return "bg-blue-100 text-blue-800";
      case "Non-Recyclable":
        return "bg-orange-100 text-orange-800";

      default:
        return "";
    }
  }

  return (
    <>
      <UserDrawer>
        <div className="flex justify-end mb-2">
          <SmartDeviceAddForm />
        </div>
        <div className="mb-28 shadow-md rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 :text-gray-400">
            <caption className="p-5 text-lg font-semibold text-left rtl:text-right text-[#48752c] bg-white :text-white :bg-gray-800">
              Smart Device Requests
            </caption>
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 :bg-gray-700 :text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Device Type
                </th>
                <th scope="col" className="px-6 py-3">
                  Date Requested
                </th>
                <th scope="col" className="px-6 py-3">
                  Bin Status
                </th>
                <th scope="col" className="px-6 py-3">
                  Garbage Status
                </th>
                <th scope="col" className="px-3 py-4 text-right">
                  <span className="sr-only"></span>
                </th>
              </tr>
            </thead>
            <tbody>
              {smartDevices.length > 0 ? (
                smartDevices
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by createdAt in descending order
                  .map((device) => (
                    <tr
                      className="bg-white border-b :bg-gray-800 :border-gray-700"
                      key={device._id}
                    >
                      <td className="px-3 py-4 capitalize">
                        <span
                          className={`uppercase font-semibold text-[12px] px-2.5 py-0.5 rounded ${getDeviceTypeClassName(
                            device.type,
                          )}`}
                        >
                          {device.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(device.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 capitalize">
                        <span
                          className={`uppercase font-semibold text-[12px] px-2.5 py-0.5 rounded ${getStatusClassName(
                            device.status,
                          )}`}
                        >
                          {device.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 capitalize">
                        <span
                          className={`uppercase font-semibold text-[12px] px-2.5 py-0.5 rounded ${getStatusClassName(
                            device.garbageStatus,
                          )}`}
                        >
                          {device.garbageStatus}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-right">
                        <a
                          onClick={() => handleClickOpen(device._id)}
                          className="font-medium text-red-600 :text-blue-500 cursor-pointer"
                        >
                          <DeleteIcon />
                        </a>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="w-full text-md text-gray-600 font-semibold text-center py-4"
                  >
                    No smart device requests found!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Are you sure?"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              The selected smart device request will be deleted and cannot be
              retrieved.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleDeleteDevice} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </UserDrawer>
      <ToastContainer />
    </>
  );
};

export default UserSmartDeviceRequest;
