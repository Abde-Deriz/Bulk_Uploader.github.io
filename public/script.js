document.getElementById("upload-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const folderName = document.getElementById("folder-name").value.trim();
    const files = document.getElementById("file-input").files;

    if (!folderName || files.length === 0) {
        alert("Please provide a folder name and select images.");
        return;
    }

    const formData = new FormData();
    formData.append("folderName", folderName);
    Array.from(files).forEach((file) => formData.append("images", file));

    const progressText = document.getElementById("progress-text");
    progressText.textContent = "Uploading images...";

    try {
        const response = await fetch("/upload", {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            progressText.textContent = "Upload complete! Click 'Download URLs' to get the file.";
            document.getElementById("download-btn").style.display = "block";

            // Enable download button
            document.getElementById("download-btn").onclick = () => {
                const folderName = document.getElementById("folder-name").value.trim();
                if (folderName) {
                    window.location.href = `/download?folder=${encodeURIComponent(folderName)}`;
                } else {
                    alert("Folder name is required to download the URLs file.");
                }
            };
            
        } else {
            progressText.textContent = "Error uploading images.";
        }
    } catch (error) {
        console.error(error);
        progressText.textContent = "Error uploading images.";
    }
});


/////////////////////////

// Fetch folders and populate the dropdown
async function loadFolders() {
    try {
        const response = await fetch("/folders");
        if (response.ok) {
            const folders = await response.json();
            console.log("Folders fetched:", folders); // Debug log

            const folderSelect = document.getElementById("folder-select");
            folderSelect.innerHTML = ""; // Clear previous options

            folders.forEach((folder) => {
                const option = document.createElement("option");
                option.value = folder;
                option.textContent = folder;
                folderSelect.appendChild(option);
            });
        } else {
            console.error("Failed to fetch folders:", response.statusText);
        }
    } catch (error) {
        console.error("Error loading folders:", error);
    }
}



// Handle folder selection and download
document.getElementById("folder-download-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const selectedFolder = document.getElementById("folder-select").value;
    if (selectedFolder) {
        window.location.href = `/download?folder=${encodeURIComponent(selectedFolder)}`;
    } else {
        alert("Please select a folder.");
    }
});

// Load folders on page load
document.addEventListener("DOMContentLoaded", () => {
    loadFolders(); // Load folders when the DOM is ready
});


///////////////////////////////
document.getElementById("file-input").addEventListener("change", function (event) {
    const imageGallery = document.getElementById("image-gallery");
    const files = event.target.files;

    // Loop through uploaded images
    Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();

            // Display image after loading
            reader.onload = function (e) {
                const img = document.createElement("img");
                img.src = e.target.result;
                img.alt = file.name;

                // Add click event to show full-screen image
                img.addEventListener("click", () => showFullScreenImage(e.target.result));
                imageGallery.appendChild(img);
            };

            reader.readAsDataURL(file);
        }
    });
});

// Full-screen image functionality
function showFullScreenImage(src) {
    const modal = document.getElementById("full-screen-modal");
    const modalImage = document.getElementById("full-screen-image");

    modalImage.src = src;
    modal.style.display = "flex";
}

function closeFullScreenImage() {
    const modal = document.getElementById("full-screen-modal");
    modal.style.display = "none";
}

///////////////////

// script.js

// script.js

// Handle the folder deletion
document.getElementById("delete-folder-btn").addEventListener("click", function() {
    const selectedFolder = document.getElementById("folder-select").value;

    if (!selectedFolder) {
        alert("Please select a folder to delete.");
        return;
    }

    fetch(`/delete-folder?folder=${selectedFolder}`, {
        method: "DELETE", // Use DELETE method to remove the folder
    })
    .then(response => {
        if (response.ok) {
            alert("Folder deleted successfully.");
            location.reload(); // Reload the page to reflect the changes
        } else {
            alert("Failed to delete folder.");
        }
    })
    .catch(error => {
        console.error("Error deleting folder:", error);
        alert("Error deleting folder.");
    });
});
