import { Router } from "express";
import { getActivityLogs, deleteEachActivityLog, deleteAllActivityLogs } from "../controllers/activity.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = Router()

router.route("/get-logs").get(protect, getActivityLogs)
router.route('/delete-each').delete(protect, deleteEachActivityLog)
router.route('/delete-all').delete(protect, deleteAllActivityLogs)

export default router