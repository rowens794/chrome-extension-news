import { Readability, isProbablyReaderable } from "@mozilla/readability";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const apiEndpoint = "http://localhost:3000";

// Function to check if the page is an article
function isArticle() {
  //check if the page is an article using isProbablyReaderable from readability
  const articleExists = isProbablyReaderable(document);

  return articleExists;
}

// Function to create and insert the summary panel
function createSummaryPanel() {
  const panel = document.createElement("div");
  panel.id = "summary-panel-12-23";
  panel.classList.add("hidden"); // Start hidden
  document.body.appendChild(panel);

  loadPanelContent(panel); // Load the content into the panel

  return panel;
}

// Function to toggle the summary panel
function toggleSummaryPanel() {
  const panel =
    document.getElementById("summary-panel-12-23") || createSummaryPanel();
  if (panel.classList.contains("hidden")) {
    panel.classList.remove("hidden");
    panel.classList.add("visible");
  } else {
    panel.classList.remove("visible");
    panel.classList.add("hidden");
  }
}

// Function to create and insert the icon
function insertButton() {
  const buttonHtml = `<button id="summary-button-12-23">Creating Bullets</button>`;

  const container = document.createElement("div");
  container.innerHTML = buttonHtml;
  const button = container.firstChild;

  button.onclick = function () {
    toggleSummaryPanel();
  };

  document.body.appendChild(button);
}

// get the gemini response -------------------------

const generatePrompt = (article) => {
  let prompt = `
    You are an expert economic analyst and researcher.  Your clients provide you with news articles for analysis.  Your job is the following:
      1. create summaries of the articles in bullet point format.  
      2. provide deeper analysis, your clients usually refer to these as take-aways.  In these take-aways, you are expected to read between the lines of the story and provide unique insights into what the deeper implications of the story might be.  Again, your take-aways should be in bullet point format.
      3. Your clients are very busy and they want to sound informed when speaking to their stakeholders.  The also want a 1 line summary of each story so that if someone asks them about the story, they can quickly respond with a high-level summary. They refer to this is the main idea.

    It is very important that you remember that your response needs to be in JSON format, with the following structure: 

        {
            summary: Array of Strings, 
            takeaways: Array of Strings, 
            main_idea: String
        }

    If you do not follow this format, your response will not be accepted.  Do not add any extraneous text to your response - there should be no extra quotes at the beginning or end of your response and there should be no labeling of the response as JSON.  Begin your response with a { and end your response with }

    Also, it's important to remember that they story content is usually just a raw text dump from a webpage.  The text might be very messy and include elements that are not actually part of the story, like photo captions, advertisements, etc., you can safely ignore these elements.

    Here is the text of the artile: ${article.textContent}

    AI Response: {
    `;

  return prompt;
};

const getGeneratedSummary = async (prompt, googleApiKey) => {
  return new Promise(async (resolve, reject) => {
    const genAI = new GoogleGenerativeAI(googleApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ];

    const parts = [{ text: prompt }];

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
      safetySettings,
    });

    const response = result.response;
    const responseString = response.text();
    const correctedJson = correctJsonInResponse(responseString);
    resolve(correctedJson);
  });
};

const correctJsonInResponse = (response) => {
  let json = `{ ${response}`;
  let correctedJson = JSON.parse(json);
  return correctedJson;
};

function getApiKey() {
  try {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get("apiKey", function (data) {
        if (data.apiKey) {
          resolve(data.apiKey);
        } else {
          resolve(null);
        }
      });
    });
  } catch {
    return null;
  }
}

// --------------------------------------------------

function loadPanelContent(panel) {
  fetch(chrome.runtime.getURL("panel-content.html"))
    .then((response) => response.text())
    .then((data) => {
      panel.innerHTML = data;
      // Load the CSS file
      const link = document.createElement("link");
      link.href = chrome.runtime.getURL("panel-content.css");
      link.type = "text/css";
      link.rel = "stylesheet";
      panel.appendChild(link);
      setupCloseButton(); // Call this after the content is loaded
    })
    .catch((err) => console.error("Failed to load panel content:", err));
}

function closePanel() {
  const panel = document.getElementById("summary-panel-12-23");
  if (panel) {
    panel.classList.remove("visible");
    panel.classList.add("hidden");
  }
}

function setupCloseButton() {
  const closeButton = document.getElementById("close-button-container");
  if (closeButton) {
    closeButton.addEventListener("click", closePanel);
  }
}

function extractContent() {
  // Wait for the DOM to be fully loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", processDocument);
  } else {
    processDocument();
  }
}

async function processDocument() {
  const docClone = document.cloneNode(true); // Clone the document
  const reader = new Readability(docClone);
  const article = reader.parse();

  if (article) {
    let currentUrl = document.location.href; // Get the current page URL

    let data = await getSummary(article, currentUrl);

    //remove the loading screen
    let loadingScreen = document.getElementById("loading-container");
    loadingScreen.remove();

    //add the panel skeleton to "summary-content"
    let summaryContent = document.getElementById("summary-content");
    summaryContent.innerHTML = `
      <div class="section-heading-container-12-23">
        <span class="section-heading-12-23">Summary</span>
        <hr class="section-heading-underline-12-23" />
      </div>

      <ul class="section-list-12-23" id="summary-items"></ul>

      <div class="section-heading-container-12-23">
        <span class="section-heading-12-23">Take-Aways</span>
        <hr class="section-heading-underline-12-23" />
      </div>

      <ul class="section-list-12-23" id="takeaway-items"></ul>
      `;

    //update the summary-button-12-23 to a bg color of #c1edbd
    let summaryButton = document.getElementById("summary-button-12-23");
    summaryButton.style.backgroundColor = "#c1edbd";
    summaryButton.style.color = "#555555";
    summaryButton.style.border = "1px solid #555555";
    summaryButton.innerText = "Bullets Created";

    //open the summary panel if closed
    let summaryPanel = document.getElementById("summary-panel-12-23");
    if (summaryPanel.classList.contains("hidden")) {
      summaryPanel.classList.remove("hidden");
      summaryPanel.classList.add("visible");
    }

    // add an ul with each summary point as an li to id="summary-items"
    let summaryItems = document.getElementById("summary-items");
    summaryItems.innerHTML = "";
    data.response.summary.forEach((item) => {
      let li = document.createElement("li");
      li.classList.add("section-list-item-12-23");
      li.innerText = item;
      summaryItems.appendChild(li);
    });

    // add an ul with each summary point as an li to id="takeaway-items"
    let takeawayItems = document.getElementById("takeaway-items");
    takeawayItems.innerHTML = "";
    data.response.takeaways.forEach((item) => {
      let li = document.createElement("li");
      li.classList.add("section-list-item-12-23");
      li.innerText = item;
      takeawayItems.appendChild(li);
    });
  } else {
    console.error("Failed to parse the article.");
  }
}

async function getSummary(article, url) {
  let prompt = generatePrompt(article);

  //get the google api key from local storage
  let googleApiKey = await getApiKey();

  //get the gemini response
  let json = await getGeneratedSummary(prompt, googleApiKey);

  console.log(json);

  //compile all data into a single object (for when the backend is ready)
  let responseObj = { response: json };

  return responseObj;
}

function startup() {
  //check if the page is an article using the isArticle() function
  const pageIsArticle = isArticle();

  //check if url is in the avoidDomainsList
  let avoidDomainsList = [
    "http://localhost:3000/",
    "https://www.google.com/",
    "https://www.amazon.com/",
  ];

  // get the root domain of the current page
  let currentUrl = document.location.href;

  //test
  console.log(currentUrl);
  console.log(avoidDomainsList.includes(currentUrl));

  // Run the script
  if (pageIsArticle && !avoidDomainsList.includes(currentUrl)) {
    extractContent();
    insertButton();
    createSummaryPanel(); // Create the panel when the page loads
  }
}

startup();
