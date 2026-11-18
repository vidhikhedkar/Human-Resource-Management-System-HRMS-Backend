
const router = require("express").Router();

const {applyLeave,myLeaves,allLeaves,updateLeaveStatus} = require("../controllers/leaveController");
const {protect,adminOnly} = require("../middleware/authMiddleware");

router.use(protect);
router.post("/", applyLeave);
router.get("/my", myLeaves);
router.get("/all", adminOnly, allLeaves);
router.patch("/:id/status", adminOnly, updateLeaveStatus);

module.exports = router;
