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
            console.log("Folders fetched:", folders); // Log folders

            const folderSelect = document.getElementById("folder-select");
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
loadFolders();
