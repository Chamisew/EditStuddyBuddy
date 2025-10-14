import express from "express";
import {
    createWMA,
    getAllWMAs,
    loginWMA,
    logoutCurrentWMA,
    getCurrentWMAProfile,
    updateCurrentWMAProfile,
    deleteWMAById,
    getWMAById,
    updateWMAById,
} from "../controllers/wmaController.js";

import { authenticate, authenticateWMA, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(createWMA)
  .get(authenticate, authorizeAdmin,getAllWMAs);
router.post("/auth", loginWMA);
router.post("/logout", authenticateWMA, logoutCurrentWMA); 

router
  .route("/wmaprofile")
  .get(authenticateWMA, getCurrentWMAProfile)
  .put(authenticateWMA, updateCurrentWMAProfile);

// Administrator Routes
router
  .route("/:id")
  .delete( deleteWMAById)
  .get(authenticate,authorizeAdmin, getWMAById)
  .put(authenticate, authorizeAdmin,updateWMAById);

export default router;
