import API from "../helpers/apiHelper";

const createGarbage = async (garbage) => {
  try {
    const createdGarbage = await new API().post("garbage", garbage);
    return createdGarbage;
  } catch (error) {
    console.error("Error creating inquiry:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

const getGarbageQr = async (id) => {
  try {
    const res = await new API().get(`garbage/${id}/qr`);
    return res; // { dataUrl, url }
  } catch (err) {
    console.error("Error fetching garbage QR", err.message);
    throw err;
  }
};

const getAllGarbages = async () => {
  try {
    const garbages = await new API().get("garbage", {});
    // console.log("garbagesINjs => ", garbages);
    return garbages;
  } catch (error) {
    console.error("Error fetching garbages:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

const getAllDriverGarbages = async () => {
  try {
    const garbages = await new API().get("garbage/driver-garbage", {});
    // console.log("garbagesINjs => ", garbages);
    return garbages;
  } catch (error) {
    console.error("Error fetching garbages:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

const getUserAllGarbages = async () => {
  try {
    const garbages = await new API().get("garbage/garbage-requests", {});
    // console.log("garbagesINjs => ", garbages);
    return garbages;
  } catch (error) {
    console.error("Error fetching garbages:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

const updateGarbage = async (status, id) => {
  // Ensure the body only contains the status
  const body = { status };

  try {
    const updatedGarbage = await new API().put(
      `garbage/${id}`, // Make sure this URL matches your API endpoint for garbage requests
      body,
    );
    // console.log(updatedGarbage);
    return updatedGarbage;
  } catch (error) {
    console.error("Error updating garbage:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

const deleteGarbage = async (id) => {
  try {
    const deletedGarbage = await new API().delete(`garbage/${id}`);
    // console.log("deletedGarbage => ", deletedGarbage);
    return deletedGarbage; // ApiHelper.delete returns response.data already
  } catch (error) {
    console.error("Error deleting Inquiry:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

export {
  createGarbage,
  getAllGarbages,
  getUserAllGarbages,
  getAllDriverGarbages,
  updateGarbage,
  deleteGarbage,
  getGarbageQr,
};
