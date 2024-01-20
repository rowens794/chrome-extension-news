document.addEventListener(
  "DOMContentLoaded",
  async function () {
    setupGeminiInput();
    let key = await getApiKey();
    if (key) {
      establishGeminiKeyEntered(key);
    } else {
    }
  },
  false
);

function setApiKey(apiKey) {
  return new Promise((resolve, reject) => {
    if (apiKey.length > 0) {
      chrome.storage.sync.set({ apiKey: apiKey }, function () {
        establishGeminiKeyEntered(apiKey);
        resolve();
      });
    } else {
      reject("API key is empty");
    }
  });
}

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

function deleteApiKey() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.remove("apiKey", function () {
      setupGeminiInput();
      resolve();
    });
  });
}

function establishGeminiKeyEntered(key) {
  return new Promise((resolve, reject) => {
    //remove the element with id='api-key'
    let apiKeyElement = document.getElementById("api-key");
    apiKeyElement.remove();

    //remove the button with the id='api-key-submit'
    let apiKeySubmit = document.getElementById("api-key-submit");
    apiKeySubmit.remove();

    //delete the contents of gemini-input-container
    document.getElementById("gemini-input-container").innerHTML = `
      <div id="gemini-input-container">
        <p id="api-key-input-heading">Your Gemini API Key</p>

        <div id="api-key-request-container">
          <p id="api-key-entered">${key.substring(0, 4)}****************</p>
          <button id="api-key-delete">Delete</button>
        </div>
      </div>
    `;

    document
      .getElementById("api-key-delete")
      .addEventListener("click", function () {
        deleteApiKey()
          .then(() => {
            console.log("API key deleted successfully");
            // Additional code to execute after successful deletion
          })
          .catch((error) => {
            console.error(error);
            // Handle errors, maybe show a message to the user
          });
      });

    resolve();
  });
}

function setupGeminiInput() {
  //delete the contents of gemini-input-container
  document.getElementById("gemini-input-container").innerHTML = "";

  //insert html into the gemini-input-container
  document.getElementById("gemini-input-container").insertAdjacentHTML(
    "beforeend",
    `
    <p id="api-key-input-heading">Google Gemini API Key:</p>

    <div id="api-key-request-container">
      <input id="api-key" />
      <button id="api-key-submit" class="api-key-submit-inactive">
        Save
      </button>
    </div>
  `
  );

  //check if input if valid
  let apiKeyInput = document.getElementById("api-key");
  apiKeyInput.addEventListener("input", function () {
    let apiKeySubmit = document.getElementById("api-key-submit");
    if (apiKeyInput.value.length > 0) {
      apiKeySubmit.classList.add("api-key-submit-active");
      apiKeySubmit.classList.remove("api-key-submit-inactive");
    } else {
      apiKeySubmit.classList.add("api-key-submit-inactive");
      apiKeySubmit.classList.remove("api-key-submit-active");
    }
  });

  //add the click event listener to the button
  document
    .getElementById("api-key-submit")
    .addEventListener("click", function () {
      const apiKey = document.getElementById("api-key").value;
      setApiKey(apiKey)
        .then(() => {
          console.log("API key saved successfully");
          // Additional code to execute after successful saving
        })
        .catch((error) => {
          console.error(error);
          // Handle errors, maybe show a message to the user
        });
    });
}
