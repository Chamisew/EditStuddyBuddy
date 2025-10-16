import { useEffect, useState } from "react";
import { deleteGarbage, getUserAllGarbages } from "../../../api/garbageApi";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { ToastContainer, toast } from "react-toastify";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import UserDrawer from "../components/UserDrawer";
import Garbage_Add_Form from "../components/Garbage_Add_Form";
import React from "react";

const UserGarbageRequest = () => {
  const [garbages, setGarbages] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [selectedGarbageId, setSelectedGarbageId] = useState(null);
  
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsGarbage, setDetailsGarbage] = useState(null);

  const fetchAllGarbages = async () => {
    try {
      const res = await getUserAllGarbages();
      setGarbages(res || []);
    } catch (error) {
      toast.error(error.message, { position: "bottom-right" });
      console.error("Error fetching garbages: ", error.message);
    }
  };
  useEffect(() => {
    fetchAllGarbages();
  }, []);

  const handleClickOpen = (id) => {
    setSelectedGarbageId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedGarbageId(null);
  };

  const handleDeleteGarbage = async () => {
    if (!selectedGarbageId) return;
    try {
      await deleteGarbage(selectedGarbageId);
      toast.success("Garbage request deleted", { position: "bottom-right" });
      handleClose();
      fetchAllGarbages();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err?.message || "Failed to delete", { position: "bottom-right" });
    }
  };

  const getStatusClassName = (status) => {
    if (!status) return "bg-gray-50 text-gray-700";
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-50 text-yellow-800";
      case "collected":
        return "bg-green-50 text-green-800";
      case "cancelled":
        return "bg-red-50 text-red-800";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const getTypeClassName = (type) => {
    if (!type) return "bg-gray-100 text-gray-800";
    switch (type.toLowerCase()) {
      case "recyclable":
        return "bg-blue-50 text-blue-800";
      case "organic":
        return "bg-green-50 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <UserDrawer>
  <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-green-900">Garbage Requests</h1>
            <p className="text-sm text-gray-600">Your submitted disposal requests — track status and details.</p>
          </div>

          <div className="flex items-center gap-3">
            <Garbage_Add_Form />
          </div>
        </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-28">
          {garbages && garbages.length > 0 ? (
            garbages
              .slice()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((g) => (
                  <div key={g._id} className="card hover:shadow-md transition p-5 border border-green-50">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="text-sm text-gray-500">Area</div>
                      <div className="text-lg font-semibold text-green-900">{g.area?.name || '-'}</div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(g.createdAt).toLocaleString()}</div>
                    </div>

                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${g.status === 'Pending' ? 'bg-yellow-50 text-yellow-800' : g.status === 'Collected' ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-700'}`}>
                        {g.status}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">{g.type || ''}</div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-700">
                    <div className="mb-2">{g.wasteDetails ? (g.wasteDetails.length > 120 ? `${g.wasteDetails.slice(0,120)}...` : g.wasteDetails) : 'No additional details'}</div>

                    <div className="flex items-center gap-2 mt-3">
                      {g.images && g.images.length > 0 ? (
                        g.images.slice(0,3).map((img, idx) => (
                          <img key={idx} src={img} alt={`img-${idx}`} className="w-20 h-14 object-cover rounded-md shadow-sm" />
                        ))
                      ) : (
                        <div className="text-xs text-gray-400">No images</div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => { setDetailsGarbage(g); setDetailsOpen(true); }}
                      className="btn-ghost inline-flex items-center gap-2"
                    >
                      <InfoOutlinedIcon style={{ fontSize: 18 }} />
                      <span className="text-sm">Details</span>
                    </button>

                    {g.status === 'Pending' ? (
                        <button onClick={() => handleClickOpen(g._id)} className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-1 rounded-full shadow hover:scale-105 transition">
                        <DeleteIcon style={{ fontSize: 16 }} />
                        <span className="text-sm">Delete</span>
                      </button>
                    ) : (
                      <div className="text-sm text-gray-500">&nbsp;</div>
                    )}
                  </div>
                </div>
              ))
          ) : (
            <div className="col-span-full text-center text-gray-600 font-semibold py-10 bg-white rounded-2xl border border-dashed border-green-50">
              No garbage requests found!
            </div>
          )}
        </div>

        <Dialog open={open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogTitle id="alert-dialog-title">{"Are you sure?"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">The selected garbage disposal request will be deleted and cannot be retrieved.</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleDeleteGarbage} color="error" autoFocus>Delete</Button>
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
                          <div className="text-sm text-gray-500">Area</div>
                          <div className="text-xl font-bold text-gray-800">{detailsGarbage.area?.name || '-'}</div>
                          <div className="text-sm text-gray-500 mt-1">{new Date(detailsGarbage.createdAt).toLocaleString()}</div>
                        </div>

                        <div className="text-right">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded ${getStatusClassName(detailsGarbage.status)} uppercase text-[12px] font-semibold`}>{detailsGarbage.status}</div>
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded ${getTypeClassName(detailsGarbage.type)} text-[12px] font-semibold`}>{detailsGarbage.type}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-500">Amount</div>
                          <div className="text-xl font-semibold text-green-600">LKR&nbsp;{detailsGarbage.weight ? detailsGarbage.weight * detailsGarbage.area.rate * (detailsGarbage.type === "Recyclable" ? 0.9 : 1) : detailsGarbage.area.rate * (detailsGarbage.type === "Recyclable" ? 0.9 : 1)}.00</div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-500">Address</div>
                          <div className="mt-1 text-sm text-gray-700 break-words">{detailsGarbage.address}</div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-500">Weight</div>
                          <div className="mt-1 text-sm text-gray-700">{detailsGarbage.weight ? `${detailsGarbage.weight} kg` : '—'}</div>
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
      </UserDrawer>
      <ToastContainer />
    </>
  );
};

export default UserGarbageRequest;
