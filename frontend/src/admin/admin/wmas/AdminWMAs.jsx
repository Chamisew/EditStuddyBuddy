import { useState, useEffect } from "react";
import AdminDrawer from "../components/AdminDrawer";
import AuthService from "../../../api/wmaApi";
import { getAllCollectorsInWma } from "../../../api/collectorApi";
import { ToastContainer, toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import wmaimage from "../../../assets/company.png";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import React from "react";

function AdminWMAs() {
  const [wmas, setWMAs] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [selectedWMAId, setSelectedWMAId] = useState(null);
  const [loader, setLoader] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredWMAs = wmas.filter((wma) =>
    wma.wmaname.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleClickOpen = (id) => {
    console.log(`id => `, id);
    setSelectedWMAId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeleteWMA = async () => {
    if (selectedWMAId) {
      try {
        await AuthService.deleteWma(selectedWMAId);
        setWMAs((currentWMA) =>
          currentWMA.filter((wma) => wma._id !== selectedWMAId),
        );
        handleClose();
        toast.success("WMA account has been deleted successfully!", {
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
        alert(error.message);
        console.log("Error deleting garbage: ", error);
      }
    }
  };

  const fetchAllWMAs = async () => {
    try {
      const res = await AuthService.getAllWmas();

      const wmasWithCollectorCounts = await Promise.all(
        res.map(async (wma) => {
          try {
            // Ensure we pass a string id
            const id = wma._id || wma.id || (wma._doc && wma._doc._id);
            console.log(`Fetching collectors for WMA id:`, id);
            const collectors = await getAllCollectorsInWma(id);
            console.log(`Collectors for WMA ${id}:`, collectors);
            return {
              // copy properties (ensure plain object)
              ...wma,
              collectorCount: Array.isArray(collectors) ? collectors.length : 0,
            };
          } catch (err) {
            console.error("Error fetching collectors for wma", wma, err);
            return {
              ...wma,
              collectorCount: 0,
            };
          }
        }),
      );
      setWMAs(wmasWithCollectorCounts);
    } catch (error) {
      alert(error.message);
      console.error("Error fetching WMAs: ", error.message);
    }
  };

  useEffect(() => {
    fetchAllWMAs();
  }, []);

  const calculateTotalWMAs = () => {
    return wmas.length;
  };

  const findWMAWithHighestCollectors = () => {
    if (wmas.length === 0) return "N/A";
    const wmaWithHighestCollectors = wmas.reduce((maxWMA, currentWMA) =>
      currentWMA.collectorCount > maxWMA.collectorCount ? currentWMA : maxWMA,
    );
    return wmaWithHighestCollectors.wmaname;
  };

  const downloadPDF = (wmaData) => {
    const doc = new jsPDF();
    const imgLogo = new Image();
    imgLogo.src = "../src/assets/logo.png";

    console.log("Image path: ", imgLogo.src);
    imgLogo.onload = () => {
      doc.addImage(imgLogo, "PNG", 14, 10, 55, 15);
      doc.setFont("helvetica", "bold");
      doc.setTextColor("48752c");
      doc.setFontSize(16);
      doc.text("CleanPath Waste Management System", 95, 18);

      doc.setFont("helvetica", "normal");
      doc.setTextColor("000000");
      doc.setFontSize(18);
      doc.text("WMA Management Report", 14, 40);

      doc.setFontSize(11);
      doc.setTextColor(100);

      doc.text(`Generated Date: ${new Date().toLocaleString()}`, 14, 48);

      autoTable(doc, {
        startY: 58,
        head: [["Summary", ""]],
        body: [["Total Accounts Registered", wmaData.totalWMAs]],
        theme: "grid",
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.getWidth() - 20,
          doc.internal.pageSize.getHeight() - 10,
        );
        doc.text(
          "CleanPath Waste Management System - Confidential",
          14,
          doc.internal.pageSize.getHeight() - 10,
        );
      }

      const generatedDate = new Date().toLocaleDateString().replace(/\//g, "-");
      doc.save(`WMA_Management_Report_${generatedDate}.pdf`);
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
    <div>
      <AdminDrawer>
        <h1 className="m-5 text-2xl font-semibold text-green-900">
          Waste Management Authority Management
        </h1>
        <div className="m-5 flex justify-between mb-4 text-center">
          <div className="bg-white rounded w-[30%] p-4 flex flex-col justify-center shadow-xl">
            <h1>Total Waste Management Authorities</h1>
            <h1 className="text-[28px] font-semibold text-[#48752c]">
              {calculateTotalWMAs()}
            </h1>
          </div>
          <div className="bg-white rounded w-[30%] p-4 flex flex-col justify-center shadow-xl">
            <h1>Maximum Collectors Registered By:</h1>
            <h1 className="text-[24px] font-semibold text-[#48752c]">
              {findWMAWithHighestCollectors()}
            </h1>
          </div>
          <div
            className="bg-[#48752c] cursor-pointer shadow-xl text-white hover:text-[#f9da78] rounded w-[30%] p-4 flex flex-col justify-center"
            onClick={() =>
              downloadPDF({
                totalWMAs: calculateTotalWMAs(),
              })
            }
          >
            <h1>Click to Download WMA Report</h1>
          </div>
        </div>
        <div className="m-5">
          <input
            type="text"
            placeholder="Search by Authority Name"
            value={searchTerm}
            onChange={handleSearchChange}
            className="p-2 border border-gray-300 rounded w-full"
          />
        </div>
        <table className="w-[96%] m-5 shadow-xl text-sm text-left rtl:text-right text-gray-500">
          <caption className="p-5 shadow-xl text-lg font-semibold text-left rtl:text-right text-[#48752c] bg-gray-50">
            Waste Management Authority Account Holders
          </caption>
          <thead className="text-center text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-4 py-3"></th>
              <th className="px-4 py-3">WMAname</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Authorization No.</th>
              <th className="px-4 py-3">Collectors Count</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="text-center shadow-xl">
            {filteredWMAs.length > 0 ? (
              filteredWMAs.map((wma) => (
                <tr className="bg-white border-b" key={wma._id}>
                  <td className="px-3">
                    <img
                      src={wma?.profileImage || wmaimage}
                      alt="Profile Picture"
                      className="w-[30px] h-[30px] rounded-full"
                    />
                  </td>
                  <th className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {wma.wmaname}
                  </th>
                  <td className="px-4 py-4">{wma.email}</td>
                  <td className="px-4 py-4">{wma.authNumber}</td>
                  <td className="px-4 py-4">{wma.collectorCount}</td>
                  <td className="px-4 py-4">{wma.address}</td>
                  <td className="px-4 py-4">{wma.contact}</td>
                  <td className="px-3 py-4 text-right">
                    <a
                      onClick={() => handleClickOpen(wma._id)}
                      className="font-medium text-red-600 cursor-pointer"
                    >
                      <DeleteIcon />
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <div className="w-full text-md text-gray-600 font-semibold m-10 text-center">
                No registered wma found!
              </div>
            )}
          </tbody>
        </table>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Are you sure?"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              The selected WMA account will be deleted and cannot be retrieved.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleDeleteWMA} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        <ToastContainer />
      </AdminDrawer>
    </div>
  );
}

export default AdminWMAs;
