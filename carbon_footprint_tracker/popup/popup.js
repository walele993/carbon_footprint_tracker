document.addEventListener("DOMContentLoaded", () => {
  const sessionElement = document.getElementById("footprintSession");
  const totalElement = document.getElementById("footprintTotal");
  const resetButton = document.getElementById("resetButton");

  // Recupera il totale storico all'apertura del popup
  chrome.storage.local.get({ totalFootprint: 0 }, (result) => {
    totalElement.textContent = `Total Carbon Footprint: ${result.totalFootprint.toFixed(2)} gCO2`;
  });

  // Ascolta i messaggi in tempo reale dal background.js
  chrome.runtime.onMessage.addListener((message) => {
    console.log("🔄 Messaggio ricevuto nel popup:", message);

    if ("sessionFootprint" in message) {
      sessionElement.textContent = `Session Carbon Footprint: ${message.sessionFootprint.toFixed(2)} gCO2`;
    }
    if ("totalFootprint" in message) {
      totalElement.textContent = `Total Carbon Footprint: ${message.totalFootprint.toFixed(2)} gCO2`;
    }
  });

  // Pulsante reset
  resetButton.addEventListener("click", () => {
    console.log("🔄 Resetting history...");
    chrome.runtime.sendMessage({ action: "resetFootprint" }, (response) => {
      if (response.success) {
        totalElement.textContent = "Total Carbon Footprint: 0 gCO2";
      }
    });
  });
});
