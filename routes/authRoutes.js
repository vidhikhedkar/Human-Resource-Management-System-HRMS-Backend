
const router = require("express").Router();

const {
    login,
    me,
    registerUser,
    logout,
} = require("../controllers/authController");

const {
    protect,
} = require("../middleware/authMiddleware");

router.post("/login", login);
router.post("/register", registerUser);
router.get("/me", protect, me);
router.post("/logout", logout);

module.exports = router;
