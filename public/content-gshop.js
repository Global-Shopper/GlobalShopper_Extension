/*global chrome */
console.log("✅ GSHOP Grabber inject!");

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "SHOW_PRODUCT_LIST") {
      window.postMessage({ type: "FROM_EXTENSION", products: msg.products }, "*");
    }
  });