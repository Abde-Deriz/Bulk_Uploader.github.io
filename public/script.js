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
                window.location.href = "/download";
            };
        } else {
            progressText.textContent = "Error uploading images.";
        }
    } catch (error) {
        console.error(error);
        progressText.textContent = "Error uploading images.";
    }
});
