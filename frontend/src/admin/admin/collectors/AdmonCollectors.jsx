import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminDrawer from "../components/AdminDrawer";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import GroupIcon from "@mui/icons-material/Group";
import GroupRemoveIcon from "@mui/icons-material/GroupRemove";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import { ToastContainer, toast } from "react-toastify";
import { deleteCollector, getAllCollectors } from "../../../api/collectorApi";
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
import React from "react";

function AdminCollectors() {
  const [collectors, setCollectors] = useState([]);
  const [filteredCollectors, setFilteredCollectors] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [selectedCollectorId, setSelectedCollectorId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const navigate = useNavigate();

  // const fetchAllCollectors = async () => {
  //   try {
  //     const res = await getAllCollectors();
  //     setCollectors(res);
  //     setFilteredCollectors(res);
  //   } catch (error) {
  //     alert(error.message);
  //     console.error("Error fetching collectors: ", error.message);
  //   }
  // };
  const fetchRandomImage = async () => {
    try {
      const response = await fetch("https://randomuser.me/api/");
      const data = await response.json();
      return data.results[0].picture.thumbnail;
    } catch (error) {
      console.error("Error fetching image:", error);
      return ""; // Return an empty string if fetching fails
    }
  };

  const fetchAllCollectors = async () => {
    try {
      const res = await getAllCollectors();
      // Generate random profile images for each collector
      const collectorsWithImages = await Promise.all(
        res.map(async (collector) => ({
          ...collector,
          profileImage: await fetchRandomImage(),
        })),
      );
      setCollectors(collectorsWithImages);
      setFilteredCollectors(collectorsWithImages);
    } catch (error) {
      alert(error.message);
      console.error("Error fetching collectors: ", error.message);
    }
  };

  useEffect(() => {
    fetchAllCollectors();
  }, []);

  const handleClickOpen = (id) => {
    setSelectedCollectorId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeleteCollector = async () => {
    if (selectedCollectorId) {
      try {
        await deleteCollector(selectedCollectorId);
        setCollectors((currentCollector) =>
          currentCollector.filter(
            (collector) => collector._id !== selectedCollectorId,
          ),
        );
        handleClose();
        toast.success("Collector Deleted Successfully!", {
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

  const handleEditClick = (collector) => {
    navigate("/admin/collectors/update", { state: { collector } });
  };

  const filterCollectors = () => {
    let filtered = collectors;
    if (statusFilter) {
      filtered = filtered.filter(
        (collector) => collector.statusOfCollector === statusFilter,
      );
    }

    if (searchFilter !== "") {
      filtered = filtered.filter((collector) =>
        collector.collectorName
          .toLowerCase()
          .includes(searchFilter.toLowerCase()),
      );
    }
    setFilteredCollectors(filtered);
  };

  useEffect(() => {
    filterCollectors();
  }, [statusFilter, searchFilter, collectors]);

  return (
    <AdminDrawer>
      <h1 className="m-5 text-2xl font-semibold text-green-900">
        Collector Management
      </h1>
      <div className="m-5 shadow-md rounded-lg">
        <div className="flex justify-between p-4">
          <div className="flex items-center space-x-4">
            <div className=" border-2 border-gray-400 rounded-2xl px-7 py-3">
              <h1 className=" text-gray-500">Total Collectors</h1>
              <div className=" flex justify-start items-center">
                <div className=" flex justify-center items-center bg-[#BA9114]/50 rounded-full aspect-square h-[60px]">
                  <div className=" flex justify-center items-center bg-[#BA9114] rounded-full aspect-square h-[45px] text-white">
                    <GroupIcon sx={{ fontSize: 30 }} />
                  </div>
                </div>
                <span className=" text-3xl font-bold p-5">
                  {collectors.length} Collectors
                </span>
              </div>
            </div>
            <div className=" border-2 border-gray-400 rounded-2xl px-7 py-3">
              <h1 className=" text-gray-500">Available Collectors</h1>
              <div className=" flex justify-start items-center">
                <div className=" flex justify-center items-center bg-[#52C93F]/50 rounded-full aspect-square h-[60px]">
                  <div className=" flex justify-center items-center bg-[#52C93F] rounded-full aspect-square h-[45px] text-white">
                    <GroupAddIcon sx={{ fontSize: 30 }} />
                  </div>
                </div>
                <span className=" text-3xl font-bold p-5">
                  {
                    collectors.filter(
                      (collector) =>
                        collector.statusOfCollector === "Available",
                    ).length
                  }{" "}
                  Collectors
                </span>
              </div>
            </div>
            <div className=" border-2 border-gray-400 rounded-2xl px-7 py-3">
              <h1 className=" text-gray-500">Unavailable Collectors</h1>
              <div className=" flex justify-start items-center">
                <div className=" flex justify-center items-center bg-[#FF6262]/50 rounded-full aspect-square h-[60px]">
                  <div className=" flex justify-center items-center bg-[#FF6262] rounded-full aspect-square h-[45px] text-white">
                    <GroupRemoveIcon sx={{ fontSize: 30 }} />
                  </div>
                </div>
                <span className=" text-3xl font-bold p-5">
                  {
                    collectors.filter(
                      (collector) =>
                        collector.statusOfCollector === "Not-Available",
                    ).length
                  }{" "}
                  Collectors
                </span>
              </div>
            </div>
          </div>
        </div>
        <h1 className=" pl-4 font-semibold">Registered Collectors</h1>
        <div className=" px-4 my-4 flex justify-between items-center">
          <input
            onChange={(e) => setSearchFilter(e.target.value)}
            type="text"
            placeholder="Search Collector"
            className=" py-2 px-2  border-2 rounded-lg border-gray-400 w-[40%]"
          />
          <FormControl className="w-44">
            <InputLabel id="type-filter-label">Filter By Status</InputLabel>
            <Select
              labelId="type-filter-label"
              value={statusFilter}
              label="Type"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Available">Available</MenuItem>
              <MenuItem value="Not-Available">Not-Available</MenuItem>
            </Select>
          </FormControl>
        </div>
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 :text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 :bg-gray-700 :text-gray-400">
            <tr>
              <th scope="col" className="px-5 py-3">
                Name
              </th>
              <th scope="col" className="px-5 py-3">
                WMA
              </th>
              <th scope="col" className="px-3 py-3">
                Truck No
              </th>
              <th scope="col" className="px-5 py-3">
                NIC
              </th>
              <th scope="col" className="px-5 py-3">
                Contact
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
            {filteredCollectors.length > 0 ? (
              filteredCollectors
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((collector) => (
                  <tr
                    className="bg-white border-b :bg-gray-800 :border-gray-700"
                    key={collector._id}
                  >
                    <th
                      scope="row"
                      className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap :text-white"
                    >
                      <div className=" flex justify-start items-center">
                        <img
                          className=" rounded-full h-[35px]"
                          src={collector.profileImage}
                          alt="Collector Profile"
                        />
                        <span className=" pl-3">{collector.collectorName}</span>
                      </div>
                    </th>
                    <td className="px-5 py-4">
                      {collector.wmaId
                        ? collector.wmaId.wmaname
                        : "No wma assigned"}
                    </td>
                    <td className="px-5 py-4">{collector.truckNumber}</td>
                    <td className="px-5 py-4">{collector.collectorNIC}</td>
                    <td className="px-5 py-4">{collector.contactNo}</td>
                    <td className="px-5 py-4 capitalize flex justify-start items-center">
                      <div
                        className={` h-[20px] rounded-full aspect-square ${collector.statusOfCollector === "Available" ? " bg-green-600/50" : "bg-red-500/50"} flex justify-center items-center`}
                      >
                        <div
                          className={` h-[15px] rounded-full aspect-square ${collector.statusOfCollector === "Available" ? " bg-green-600" : "bg-red-500"} border-2 border-white`}
                        ></div>
                      </div>
                      <span className=" px-2">
                        {collector.statusOfCollector}
                      </span>
                    </td>
                    <td className="px- py-4 text-right">
                      <a
                        onClick={() => handleEditClick(collector)}
                        className="font-medium text-gray-400 :text-blue-500 cursor-pointer"
                      >
                        <EditIcon />
                      </a>
                    </td>
                    <td className="px-3 py-4 text-right">
                      <a
                        onClick={() => handleClickOpen(collector._id)}
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
                  No collectors found!
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
          <Button onClick={handleDeleteCollector} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer />
    </AdminDrawer>
  );
}

export default AdminCollectors;
