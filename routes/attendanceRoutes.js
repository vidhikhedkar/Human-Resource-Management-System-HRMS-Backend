
const router = require("express").Router();

const { checkIn, checkOut, myAttendance, allAttendance } = require("../controllers/attendanceController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect);
router.post("/check-in", checkIn);
router.post("/check-out", checkOut);
router.get("/my", myAttendance);
router.get("/all", adminOnly, allAttendance);

module.exports = router;
