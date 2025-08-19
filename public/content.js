/*global chrome */
console.log("✅ GSHOP Grabber inject!");

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("📩 Nhận message:", msg);

  if (msg.action === "GET_TITLE") {
    sendResponse({ title: document.title });
  } else if (msg.action === "ADD_PRODUCT") {
    const response =getAmazonProductInfo()
    sendResponse(response)
  }
});


function getAmazonProductInfo() {
  const url = window.location.href;

  const name = document.querySelector("#productTitle")?.innerText.trim() || null;

  const price = document.querySelector(
    "#priceblock_ourprice, #priceblock_dealprice, .a-price .a-offscreen"
  )?.innerText.trim() || null;

  const mainImgEl = document.querySelector(".a-dynamic-image, #landingImage");
  const mainImage = mainImgEl?.getAttribute("data-old-hires")
                  || mainImgEl?.src
                  || null;

  const subImages = [...document.querySelectorAll("#altImages img")].map(img =>
    img.getAttribute("data-old-hires") || img.src
  );

  const productInfo = {
    url,
    name,
    price,
    mainImage,
    subImages
  };

  console.log("Thông tin sản phẩm:", productInfo);
  return productInfo;
}