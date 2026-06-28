const {Router} = require("express");
const multer = require("multer");
const path = require("path");
const { getSalaryPDF } = require("../controllers/iaHelper.controller");

const uploadPath = path.join(__dirname, "../uploads")

const router = Router();
const upload = multer({
    dest: uploadPath,
    limits: { fileSize: 6 * 1024 * 1024 } 
})

router.post("/api/pdfParser", upload.single('pdfFile'), (req, res) => {
    getSalaryPDF(req, res)
})

module.exports = router;