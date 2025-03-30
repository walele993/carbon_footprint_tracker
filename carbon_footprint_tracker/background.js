// Carbon intensity factor (grams of CO2 per KB)
const carbonIntensity = 0.5; 

// Variabile per il totale della sessione
let sessionFootprint = 0;

// Calcola la CO2 emessa
function calculateCarbonFootprint(dataTransferred) {
  return (dataTransferred / 1024) * carbonIntensity; // Convert bytes to KB
}

// Intercetta le risposte HTTP
chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    const contentLengthHeader = details.responseHeaders.find(
      (header) => header.name.toLowerCase() === "content-length"
    );

    if (!contentLengthHeader) return;

    const dataTransferred = parseInt(contentLengthHeader.value, 10) || 0;
    if (dataTransferred === 0) return;

    const carbonFootprint = calculateCarbonFootprint(dataTransferred);
    
    // Aggiorna il totale della sessione
    sessionFootprint += carbonFootprint;
    console.log(`🌱 Session Total: ${sessionFootprint.toFixed(2)} gCO2`);

    // Aggiorna lo storico salvato
    chrome.storage.local.get({ totalFootprint: 0 }, (result) => {
      const updatedTotal = result.totalFootprint + carbonFootprint;
      chrome.storage.local.set({ totalFootprint: updatedTotal });

      // Invia i dati al popup
      chrome.runtime.sendMessage({
        sessionFootprint,
        totalFootprint: updatedTotal,
      });
    });
  },
  { urls: ["<all_urls>"], types: ["main_frame", "xmlhttprequest"] },
  ["responseHeaders"]
);

// Ascolta il reset dello storico dal popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📩 Messaggio ricevuto per reset:", message);
  if (message.action === "resetFootprint") {
    chrome.storage.local.set({ totalFootprint: 0 }, () => {
      console.log("🔄 Storico resettato");
      sendResponse({ success: true });
    });
    return true; // Mantiene il canale di risposta aperto
  }
});