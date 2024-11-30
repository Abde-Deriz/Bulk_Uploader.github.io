const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000; // Port for Render

// Setup multer to upload files to the 'public/uploads' folder
const upload = multer({
    dest: "uploads/temp/",
    limits: {
        fileSize: 5 * 1024 * 1024, // 20 MB per file
        files: 10000,               // Allow up to 5000 files
    },
});
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint for uploading images
app.post("/upload", upload.array("images", 10000), (req, res) => {
    const folderName = req.body.folderName;
    const uploadPath = path.join(__dirname, "public", "uploads", folderName);

    // Create folder if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    const urls = [];

    req.files.forEach((file) => {
        const newFilePath = path.join(uploadPath, file.originalname);
        fs.renameSync(file.path, newFilePath);

        // Update URL to match public-facing domain on Render
        const fileUrl = `https://bulk-uploader-github-io.onrender.com/uploads/${folderName}/${file.originalname}`;
        urls.push(fileUrl);
    });

    // Save URLs to output.txt
    const outputPath = path.join(uploadPath, "output.txt");
    fs.writeFileSync(outputPath, urls.join("\n"));

    res.sendStatus(200);
});

// Endpoint for downloading output.txt
app.get("/download", (req, res) => {
    const folderName = req.query.folder;

    if (!folderName) {
        return res.status(400).send("Folder name is required.");
    }

    const filePath = path.join(__dirname, "public", "uploads", folderName, "output.txt");

    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send("File not found. Make sure the folder exists and images were uploaded.");
    }
});

// Serve static files (uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// Endpoint for retrieving folder names
app.get("/folders", (req, res) => {
    const uploadsPath = path.join(__dirname, "public", "uploads");

    fs.readdir(uploadsPath, { withFileTypes: true }, (err, files) => {
        if (err) {
            console.error("Error reading uploads directory:", err);
            return res.status(500).send("Error retrieving folders.");
        }

        const folders = files
            .filter((file) => file.isDirectory()) // Only directories
            .map((folder) => folder.name);

        console.log("Folders found:", folders); // Debug log
        res.json(folders);
    });
});


// Endpoint to delete a folder
app.delete("/delete-folder", (req, res) => {
    const folderName = req.query.folder;
    const folderPath = path.join(__dirname, "uploads", folderName);

    if (!folderName) {
        return res.status(400).send("Folder name is required.");
    }

    if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, { recursive: true, force: true });
        res.status(200).send("Folder deleted successfully.");
    } else {
        res.status(404).send("Folder not found.");
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
