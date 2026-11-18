
const router = require("express").Router();

const { createPayroll, getAllPayroll, getMyPayroll, markPaid } = require("../controllers/payrollController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/my", getMyPayroll);
router.get("/", adminOnly, getAllPayroll);
router.post("/", adminOnly, createPayroll);
router.patch("/:id/pay", adminOnly, markPaid);

module.exports = router;
