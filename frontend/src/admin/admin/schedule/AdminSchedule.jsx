import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminDrawer from "../components/AdminDrawer";
import { getAllSchedules, deleteSchedule } from "../../../api/scheduleApi";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { ToastContainer, toast } from "react-toastify";
// MUI
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { getAllAreas } from "../../../api/areaApi";
import React from "react";

export default function AdminSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [areas, setAreas] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  // const [typeFilter, setTypeFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const navigate = useNavigate();

  const fetchAllSchedules = async () => {
    try {
      const res = await getAllSchedules();
      setSchedules(res);
    } catch (error) {
      alert(error.message);
      console.error("Error fetching schedules: ", error.message);
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
    fetchAllSchedules();
    fetchAllAreas();
  }, []);

  function getStatusClassName(status) {
    switch (status) {
      case "Pending":
        return "bg-yellow-300/70 text-yellow-900";
      case "Completed":
        return "bg-green-300/70 text-green-900";
      case "In Progress":
        return "bg-red-300/70 text-red-900";
      default:
        return "";
    }
  }

  const handleEditClick = (schedule) => {
    navigate("/admin/schedules/update", { state: { schedule } });
  };

  const handleClickOpen = (id) => {
    setSelectedScheduleId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeleteSchedule = async () => {
    if (selectedScheduleId) {
      try {
        await deleteSchedule(selectedScheduleId);
        setSchedules((currentSchedule) =>
          currentSchedule.filter(
            (schedule) => schedule._id !== selectedScheduleId,
          ),
        );
        handleClose();
        toast.success("Schedule Deleted Successfully!", {
          position: "bottom-right",
          autoClose: 3000,
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
        alert(error.message);
      }
    }
  };

  const filterSchedules = () => {
    let filtered = schedules;
    if (statusFilter) {
      filtered = filtered.filter(
        (schedule) => schedule.status === statusFilter,
      );
    }
    // if (typeFilter) {
    //   filtered = filtered.filter((schedule) => schedule.type === typeFilter);
    // }

    if (areaFilter !== "") {
      filtered = filtered.filter(
        (schedule) => schedule.area?.name === areaFilter,
      );
    }

    // console.log(`areaFilter => `, areaFilter);
    setFilteredSchedules(filtered);
  };

  useEffect(() => {
    filterSchedules();
  }, [statusFilter, areaFilter, schedules]);

  return (
    <AdminDrawer>
      <h1 className="m-5 text-2xl font-semibold text-green-900">
        Schedule Management
      </h1>
      <div className="m-5 shadow-md rounded-lg">
        <div className="flex justify-between p-4">
          <div className="flex items-center space-x-4">
            <FormControl className="w-44">
              <InputLabel id="status-filter-label">Filter By Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
              </Select>
            </FormControl>
            {/* <FormControl className="w-44">
              <InputLabel id="type-filter-label">Filter By Type</InputLabel>
              <Select
                labelId="type-filter-label"
                value={typeFilter}
                label="Type"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Recyclable">Recyclable</MenuItem>
                <MenuItem value="Non-Recyclable">Non-Recyclable</MenuItem>
              </Select>
            </FormControl> */}
            <FormControl className="w-44">
              <InputLabel id="area-filter-label">Filter By Area</InputLabel>
              <Select
                labelId="area-filter-label"
                value={areaFilter}
                label="Area"
                onChange={(e) => setAreaFilter(e.target.value)}
              >
                <MenuItem value={""}>All Areas</MenuItem>
                {areas.map((area) => (
                  <MenuItem key={area._id} value={area.name}>
                    {area.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              navigate("/admin/schedules/create");
            }}
          >
            Create New Schedule
          </Button>
        </div>
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 :text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 :bg-gray-700 :text-gray-400">
            <tr>
              <th scope="col" className="px-5 py-3">
                Wast Management Authority
              </th>
              <th scope="col" className="px-5 py-3">
                Collector
              </th>
              <th scope="col" className="px-3 py-3">
                Area
              </th>
              <th scope="col" className="px-5 py-3">
                Scheduled Date
              </th>
              <th scope="col" className="px-5 py-3">
                Scheduled Time
              </th>
              <th scope="col" className="px-5 py-3">
                Status
              </th>
              <th scope="col" className="px-4 py-3">
                <span className="sr-only"></span>
              </th>
              <th scope="col" className="px-5 py-3">
                <span className="sr-only"></span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedules.length > 0 ? (
              filteredSchedules
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((schedule) => (
                  <tr
                    className="bg-white border-b :bg-gray-800 :border-gray-700"
                    key={schedule._id}
                  >
                    <th
                      scope="row"
                      className="px-5 py-4 font-medium text-gray-900 whitespace-nowrap :text-white"
                    >
                      {schedule.wmaId
                        ? schedule.wmaId.wmaname
                        : "No WMA assigned"}
                    </th>
                    <td className="px-5 py-4">
                      {schedule.collectorId
                        ? schedule.collectorId.collectorName
                        : "No collector assigned"}
                    </td>
                    <td className="px-5 py-4">
                      {schedule.area ? schedule.area.name : "No area assigned"}
                    </td>
                    {/* <td className="px-5 py-4">{garbage.user.address}</td> */}
                    <td className="px-5 py-4">
                      {" "}
                      {new Date(schedule.date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4"> {schedule.time}</td>
                    <td className="px-5 py-4 capitalize">
                      <span
                        className={`uppercase font-semibold text-[12px] px-3 py-1 rounded-md ${getStatusClassName(
                          schedule.status,
                        )}`}
                      >
                        {schedule.status}
                      </span>
                    </td>
                    <td className="px- py-4 text-right">
                      <a
                        onClick={() => handleEditClick(schedule)}
                        className="font-medium text-gray-400 :text-blue-500 cursor-pointer"
                      >
                        {schedule.status === "Pending" ? <EditIcon /> : ""}
                      </a>
                    </td>
                    <td className="px-3 py-4 text-right">
                      <a
                        onClick={() => handleClickOpen(schedule._id)}
                        className="font-medium text-red-600 :text-blue-500 cursor-pointer"
                      >
                        <DeleteIcon />
                      </a>
                    </td>
                  </tr>
                ))
            ) : (
              <tr className="">
                <td className="w-full text-lg text-red-600 py-7 font-semibold text-center col-span-5">
                  No schedules found!
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
            The selected schedule will be deleted and cannot be retrieved.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleDeleteSchedule} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer />
    </AdminDrawer>
  );
}
