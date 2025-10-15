import ApiHelper from "../helpers/apiHelper";

const api = new ApiHelper();

export async function createBin(data) {
  try {
    const res = await api.post("bins", data);
    return res;
  } catch (err) {
    console.error("createBin error", err);
    throw err;
  }
}

export async function updateBinLevel(binId, payload) {
  try {
    const res = await api.put(`bins/${binId}/level`, payload);
    return res;
  } catch (err) {
    console.error("updateBinLevel error", err);
    throw err;
  }
}

export async function getMyBins() {
  try {
    const res = await api.get("bins/mine");
    return res;
  } catch (err) {
    console.error("getMyBins error", err);
    throw err;
  }
}

export async function getUrgentBinsForWma() {
  try {
    const res = await api.get("bins/urgent");
    return res;
  } catch (err) {
    console.error("getUrgentBinsForWma error", err);
    throw err;
  }
}

export async function forwardBinToAdmin(binId) {
  try {
    const res = await api.post(`bins/${binId}/forward`);
    return res;
  } catch (err) {
    console.error("forwardBinToAdmin error", err);
    throw err;
  }
}

export async function getBinsForwardedToAdmin() {
  try {
    const res = await api.get("bins/admin");
    return res;
  } catch (err) {
    console.error("getBinsForwardedToAdmin error", err);
    throw err;
  }
}

export async function getAllBinsForWma() {
  try {
    const res = await api.get("bins/wma");
    return res;
  } catch (err) {
    console.error("getAllBinsForWma error", err);
    throw err;
  }
}

export async function deleteBin(binId) {
  try {
    const res = await api.delete(`bins/${binId}`);
    return res;
  } catch (err) {
    console.error("deleteBin error", err);
    throw err;
  }
}

export default {
  createBin,
  updateBinLevel,
  getMyBins,
  getUrgentBinsForWma,
  forwardBinToAdmin,
  getBinsForwardedToAdmin,
  getAllBinsForWma,
  deleteBin,
};
