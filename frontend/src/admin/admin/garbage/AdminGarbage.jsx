import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminDrawer from "../components/AdminDrawer";
import { deleteGarbage, getAllGarbages } from "../../../api/garbageApi";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SummarizeIcon from "@mui/icons-material/Summarize";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { ToastContainer, toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
import WmaAuthService from "../../../api/wmaApi";
import { getAllCollectors } from "../../../api/collectorApi";
import { createSchedule } from "../../../api/scheduleApi";
import React from "react";

const AdminGarbage = () => {
  const [garbages, setGarbages] = useState([]);
  const [filteredGarbages, setFilteredGarbages] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [selectedGarbageId, setSelectedGarbageId] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsGarbage, setDetailsGarbage] = useState(null);
  const [loader, setLoader] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [areas, setAreas] = useState([]);
  const navigate = useNavigate();

  // schedule modal state
  const [wmas, setWmas] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [filteredCollectors, setFilteredCollectors] = useState([]);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleWma, setScheduleWma] = useState("");
  const [scheduleCollector, setScheduleCollector] = useState("");
  const [scheduleArea, setScheduleArea] = useState("");
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split("T")[0]);
  const [scheduleTime, setScheduleTime] = useState(() => {
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
      console.error("Error fetching WMAs: ", error.message);
    }
  };

  const fetchAllCollectors = async () => {
    try {
      const res = await getAllCollectors();
      setCollectors(res);
    } catch (error) {
      console.error("Error fetching collectors: ", error.message);
    }
  };

  useEffect(() => {
    fetchAllWmas();
    fetchAllCollectors();
  }, []);

  const onScheduleWmaChange = (e) => {
    const selected = e.target.value;
    setScheduleWma(selected);
    const f = collectors.filter((c) => {
      const wid = c.wmaId && (c.wmaId._id || c.wmaId);
      return String(wid) === String(selected);
    });
    setFilteredCollectors(f);
    setScheduleCollector("");
  };

  const openScheduleModalFor = (garbage) => {
    setDetailsGarbage(garbage);
    setScheduleArea(garbage.area?._id || (garbage.area && garbage.area));
    setScheduleDate(new Date().toISOString().split("T")[0]);
    setScheduleTime(() => {
      const currentTime = new Date();
      const hours = currentTime.getHours().toString().padStart(2, "0");
      const minutes = currentTime.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    });
    setScheduleOpen(true);
  };

  const handleCreateScheduleFromRequest = async (e) => {
    e.preventDefault();
    try {
      if (!scheduleWma || !scheduleCollector || !scheduleArea || !scheduleDate || !scheduleTime) {
        toast.error("Please fill all required fields before creating a schedule.");
        return;
      }
      const payload = {
        wmaId: scheduleWma,
        collectorId: scheduleCollector,
        area: scheduleArea,
        date: scheduleDate,
        time: scheduleTime,
        // attach garbage id for reference if needed by future logic
        garbageId: detailsGarbage?._id,
      };
      await createSchedule(payload);
      toast.success("Schedule created successfully!", { position: "bottom-right" });
      setScheduleOpen(false);
      // refresh garbage list so scheduled requests disappear/reflect new status
      await fetchAllGarbages();
      // optionally refresh schedules page or data
    } catch (error) {
      console.error("Error creating schedule:", error.message);
      toast.error("Failed to create schedule.");
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

  const fetchAllGarbages = async () => {
    try {
      const res = await getAllGarbages();
      setGarbages(res);
      setFilteredGarbages(res);
    } catch (error) {
      alert(error.message);
      console.error("Error fetching garbages: ", error.message);
    }
  };

  useEffect(() => {
    fetchAllGarbages();
    fetchAllAreas();
  }, []);

  const filterGarbages = () => {
    let filtered = garbages;
    if (statusFilter) {
      filtered = filtered.filter((garbage) => garbage.status === statusFilter);
    }
    if (typeFilter) {
      filtered = filtered.filter((garbage) => garbage.type === typeFilter);
    }

    if (areaFilter !== "") {
      filtered = filtered.filter(
        (garbage) => garbage.area?.name === areaFilter,
      );
    }

    // console.log(`areaFilter => `, areaFilter);
    setFilteredGarbages(filtered);
  };

  useEffect(() => {
    filterGarbages();
  }, [statusFilter, typeFilter, areaFilter, garbages]);

  const handleClickOpen = (id) => {
    setSelectedGarbageId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeleteGarbage = async () => {
    if (selectedGarbageId) {
      try {
        await deleteGarbage(selectedGarbageId);
        setGarbages((currentGarbage) =>
          currentGarbage.filter((garbage) => garbage._id !== selectedGarbageId),
        );
        handleClose();
        toast.success("Garbage Request Deleted Successfully!", {
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
        // console.log("Error deleting garbage: ", error);
      }
    }
  };

  function getStatusClassName(status) {
    switch (status) {
      case "Pending":
        return "bg-yellow-300 text-yellow-900";
      case "Collected":
        return "bg-green-300 text-green-900";
      case "In Progress":
        return "bg-red-300 text-red-900";
      default:
        return "";
    }
  }

  function getTypeClassName(type) {
    switch (type) {
      case "Recyclable":
        return "bg-blue-100 text-blue-800";
      case "Non-Recyclable":
        return "bg-orange-100 text-orange-800";

      default:
        return "";
    }
  }

  const handleEditClick = (garbage) => {
    navigate("/admin/garbage/update", { state: { garbage } });
  };

  const downloadPDF = (garbageData) => {
    const doc = new jsPDF();
    const imgLogo = new Image();
    imgLogo.src = "../src/assets/logo.png"; // Add your logo path

    // console.log("Image path: ", imgLogo.src);
    imgLogo.onload = () => {
      // Header
      doc.addImage(imgLogo, "PNG", 14, 10, 55, 15); // Add logo
      doc.setFont("helvetica", "bold");
      doc.setTextColor("48752c"); // Change color if needed
      doc.setFontSize(16);
      doc.text("CleanPath Waste Management System", 95, 18); // Title in the header

      // Title and Date
      doc.setFont("helvetica", "normal");
      doc.setTextColor("000000");
      doc.setFontSize(20);
      doc.text("Garbage Collection Report", 14, 40);

      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated Date: ${new Date().toLocaleString()}`, 14, 48);

      // Garbage Collection Summary Table
      autoTable(doc, {
        startY: 58,
        head: [["Summary", "Total Count"]],
        body: [
          ["Total Garbage Requests", garbageData.totalRequests],
          ["Collected Garbages", garbageData.collectedCount],
          ["InProgress Garbages", garbageData.inProgressCount],
          ["Pending Garbages", garbageData.pendingCount],
        ],
        theme: "grid",
      });

      // Garbage Type Counts Table
      autoTable(doc, {
        startY: doc.autoTable.previous.finalY + 10,
        head: [["Garbage Type", "Toatal Count"]],
        body: [
          ["Recyclable", garbageData.recyclableCount],
          ["Non-Recyclable", garbageData.nonRecyclableCount],
        ],
        theme: "grid",
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width - 30,
          doc.internal.pageSize.height - 10,
        ); // Page number
      }

      setLoader(false);

      // Save the PDF
      const generatedDate = new Date().toLocaleDateString().replace(/\//g, "-");
      doc.save(`Garbage_Collection_Report_${generatedDate}.pdf`);

      toast.success("Report Generated Successfully!", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    };
  };

  return (
    <AdminDrawer>
      <h1 className="m-5 text-2xl font-semibold text-green-900">
        Garbage Management
      </h1>
      <div className="m-5 shadow-md rounded-lg">
        <div className="flex justify-between p-4">
          <div className="flex items-center space-x-4">
            {/* <span className="font-semibold">Filter By</span> */}
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
                <MenuItem value="Collected">Collected</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
              </Select>
            </FormControl>
            <FormControl className="w-44">
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
            </FormControl>
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
            startIcon={<SummarizeIcon />}
            onClick={() =>
              downloadPDF({
                totalRequests: filteredGarbages.length,
                collectedCount: filteredGarbages.filter(
                  (g) => g.status === "Collected",
                ).length,
                inProgressCount: filteredGarbages.filter(
                  (g) => g.status === "In Progress",
                ).length,
                pendingCount: filteredGarbages.filter(
                  (g) => g.status === "Pending",
                ).length,
                recyclableCount: filteredGarbages.filter(
                  (g) => g.type === "Recyclable",
                ).length,
                nonRecyclableCount: filteredGarbages.filter(
                  (g) => g.type === "Non-Recyclable",
                ).length,
              })
            }
          >
            Generate Report
          </Button>
        </div>
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 :text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 :bg-gray-700 :text-gray-400">
            <tr>
              <th scope="col" className="px-5 py-3">Name</th>
              <th scope="col" className="px-5 py-3">Phone Number</th>
              <th scope="col" className="px-5 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {filteredGarbages.length > 0 ? (
              filteredGarbages
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((garbage) => (
                  <tr
                    className="bg-white border-b :bg-gray-800 :border-gray-700"
                    key={garbage._id}
                  >
                    <th
                      scope="row"
                      className="px-5 py-4 font-medium text-gray-900 whitespace-nowrap :text-white"
                    >
                      {garbage.user
                        ? garbage.user.username
                        : "No user assigned"}
                    </th>
                    <td className="px-5 py-4">{garbage.user ? garbage.user.contact : ""}</td>
                    <td className="px-5 py-4 text-right flex items-center justify-end gap-2">
                      {garbage.status !== 'Scheduled' && (
                        <button
                          type="button"
                          onClick={() => openScheduleModalFor(garbage)}
                          className="inline-flex items-center gap-2 uppercase font-semibold text-[12px] px-2.5 py-0.5 rounded bg-green-100 text-green-800 border border-green-200 shadow-sm hover:bg-green-200 transition"
                        >
                          <span>Schedule</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => { setDetailsGarbage(garbage); setDetailsOpen(true); }}
                        className="inline-flex items-center gap-2 uppercase font-semibold text-[12px] px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 shadow-sm hover:bg-blue-200 transition"
                      >
                        <InfoOutlinedIcon style={{ fontSize: 16 }} />
                        <span>More details</span>
                      </button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr className="">
                <td className="w-full text-lg text-red-600 py-7 font-semibold text-center col-span-5">
                  No garbage requests found!
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
            The selected garbage disposal request will be deleted and cannot be
            retrieved.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleDeleteGarbage} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule from request modal */}
      <Dialog open={scheduleOpen} onClose={() => setScheduleOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <div className="flex items-center justify-between w-full">
            <div className="text-lg font-semibold text-gray-800">Waste Request Schedule</div>
            <IconButton aria-label="close" onClick={() => setScheduleOpen(false)} size="small" className="ml-2">
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent>
          {detailsGarbage ? (
            <form onSubmit={handleCreateScheduleFromRequest} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">User Name</div>
                  <div className="font-semibold">{detailsGarbage.user?.username || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Contact</div>
                  <div className="font-semibold">{detailsGarbage.user?.contact || '-'}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Type</label>
                  <div className="mt-1">{detailsGarbage.type}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Area</label>
                  <div className="mt-1">{detailsGarbage.area?.name || '-'}</div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Waste Details</label>
                <div className="mt-1 p-3 bg-gray-50 rounded">{detailsGarbage.wasteDetails || '-'}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 font-medium">WMA</label>
                  <select value={scheduleWma} onChange={onScheduleWmaChange} className="mt-2 block w-full p-2 border rounded">
                    <option value="">Select WMA</option>
                    {wmas.map((w) => (<option key={w._id} value={w._id}>{w.wmaname}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 font-medium">Collector</label>
                  <select value={scheduleCollector} onChange={(e) => setScheduleCollector(e.target.value)} className="mt-2 block w-full p-2 border rounded">
                    <option value="">Select Collector</option>
                    {filteredCollectors.map((c) => (<option key={c._id} value={c._id}>{c.truckNumber}</option>))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 font-medium">Date</label>
                  <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="mt-2 block w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium">Time</label>
                  <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="mt-2 block w-full p-2 border rounded" />
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" className="py-2 px-4 bg-green-600 text-white rounded">Create Schedule</button>
              </div>
            </form>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Details dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <div className="flex items-center justify-between w-full">
            <div className="text-lg font-semibold text-gray-800">Request Details</div>
            <IconButton aria-label="close" onClick={() => setDetailsOpen(false)} size="small" className="ml-2">
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent>
          {detailsGarbage ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Type</div>
                      <div className="text-xl font-bold text-gray-800">{detailsGarbage.type}</div>
                      <div className="text-sm text-gray-500 mt-1">{new Date(detailsGarbage.createdAt).toLocaleString()}</div>
                    </div>

                    <div className="text-right">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded ${getStatusClassName(detailsGarbage.status)} uppercase text-[12px] font-semibold`}>{detailsGarbage.status}</div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Area</div>
                      <div className="text-sm text-gray-700 mt-1">{detailsGarbage.area?.name || '-'}</div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="text-sm text-gray-700 mt-1">{detailsGarbage.user?.contact || '-'}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Waste Details</div>
                  <div className="mt-2 p-4 bg-white border rounded-lg text-sm text-gray-700 break-words" style={{ minHeight: 120 }}>{detailsGarbage.wasteDetails || '-'}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-2">Images</div>
                {detailsGarbage.images && detailsGarbage.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {detailsGarbage.images.map((img, idx) => (
                      <a key={idx} href={img} target="_blank" rel="noreferrer" className="block">
                        <img src={img} alt={`garbage-${idx}`} className="w-full h-32 object-cover rounded-lg shadow-sm transform hover:scale-105 transition" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No images</div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <ToastContainer />
    </AdminDrawer>
  );
};

export default AdminGarbage;
