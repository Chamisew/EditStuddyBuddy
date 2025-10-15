import ApiHelper from "../helpers/apiHelper";

const createArea = async (area) => {
  try {
    const createdArea = await new ApiHelper().post("areas", area);
    return createdArea;
  } catch (error) {
    console.error("Error creating area:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

const getAllAreas = async () => {
  try {
    const areas = await new ApiHelper().get("areas", {});
    // console.log(`areas => `, areas);
    return areas;
  } catch (error) {
    console.error("Error fetching areas:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

const getAreaById = async (id) => {
  try {
    const area = await new ApiHelper().get(`areas/${id}`, {});
    return area;
  } catch (error) {
    console.error("Error fetching area:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

const updateArea = async (area, id) => {
  try {
    const updatedArea = await new ApiHelper().put(`areas/${id}`, area);
    return updatedArea;
  } catch (error) {
    console.error("Error updating area:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

const deleteArea = async (id) => {
  try {
    const deletedArea = await new ApiHelper().delete(`areas/${id}`);
    return deletedArea;
  } catch (error) {
    console.error("Error deleting area:", error.message);
    throw error; // Rethrow the error for the component to handle
  }
};

export { createArea, getAllAreas, getAreaById, updateArea, deleteArea };
