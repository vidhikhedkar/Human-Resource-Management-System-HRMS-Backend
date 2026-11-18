
const router = require("express").Router();

const { getEmployees, createEmployee, updateEmployee, deleteEmployee } = require("../controllers/employeeController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect, adminOnly);
router.get("/", getEmployees);
router.post("/", createEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

module.exports = router;
