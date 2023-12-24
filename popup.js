document.addEventListener(
  "DOMContentLoaded",
  function () {
    var summarizeButton = document.getElementById("summarize-button");
    summarizeButton.addEventListener(
      "click",
      function () {
        // Placeholder for summary request logic
        document.getElementById("status").textContent = "Generating summary...";

        // Here you will add the logic to send a message to your content script
        // to start the summarization process.
      },
      false
    );
  },
  false
);
