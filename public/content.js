/*global chrome */
console.log("✅ GSHOP Grabber inject!");

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("📩 Nhận message:", msg);

  if (msg.action === "GET_TITLE") {
    sendResponse({ title: document.title });
  } else if (msg.action === "ADD_PRODUCT") {
    const platform = getPlatform(window.location.href)
    const response = getProductInfo(platform)
    sendResponse(response)
  }
});

const getPlatform = (url) => {
  const host = new URL(url).hostname;
  console.log(host)
  if (host.includes("amazon.")) {
    return "Amazon"
  } else if (host.includes("ebay.")) {
    return "Ebay"
  } else if (host.includes("asos.")) {
    return "Asos"
  } else if (host.includes("gmarket.")) {
    return "Gmarket"
  } else {
    return "OTHER"
  }
}

const getProductInfo = (platform) => {
  let response = null;
  switch (platform) {
    case 'Amazon':
      response = getAmazonProductInfo()
      break
    case 'Ebay':
      response = getEbayProductInfo()
      break
    case 'Asos':
      response = getAsosProductInfo()
      break
    case 'Gmarket':
      response = getGmarketProductInfo()
      break
    default:
      return null
  }
  return {...response, platform: platform}
}

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

const getEbayProductInfo = () => {
  const url = window.location.href;

  const name = document.querySelector("#itemTitle")?.innerText.replace("Details about", "").trim()
            || document.querySelector("h1.x-item-title__mainTitle")?.innerText.trim()
            || null;

  const price = document.querySelector("#prcIsum")?.innerText.trim()
             || document.querySelector("#mm-saleDscPrc")?.innerText.trim()
             || document.querySelector(".x-price-approx__price")?.innerText.trim()
             || null;

  const mainImgEl = document.querySelector("#icImg") 
                 || document.querySelector(".ux-image-carousel-item img");
  const mainImage = mainImgEl?.src || null;

  const subImages = [...document.querySelectorAll("#vi_main_img_fs img, .ux-image-carousel-item img")]
    .map(img => img.src)
    .filter((v, i, arr) => v && arr.indexOf(v) === i); // lọc trùng

  const productInfo = {
    url,
    name,
    price,
    mainImage,
    subImages
  };

  console.log("Thông tin sản phẩm eBay:", productInfo);
  return productInfo;
}
const getAsosProductInfo = () => {
  const url = window.location.href;

  const name = document.querySelector("h1[data-test-id='product-title']")?.innerText.trim()
            || document.querySelector("h1")?.innerText.trim()
            || null;

  const price = document.querySelector("[data-testid='current-price']")?.innerText.trim()
             || document.querySelector(".product-price")?.innerText.trim()
             || null;

  let mainImage = null;
  const mainImgEl = document.querySelector('.fullImageContainer img[alt*="1 of"]')
                  || document.querySelector('.fullImageContainer img');
  if (mainImgEl) {
    mainImage = mainImgEl.src;
  }

  const subImages = [...document.querySelectorAll(".gallery-thumbnail img, [data-testid='image-thumbnail'] img")]
    .map(img => img.src)
    .filter((v, i, arr) => v && arr.indexOf(v) === i);

  const productInfo = {
    url,
    name,
    price,
    mainImage,
    subImages
  };

  console.log("Thông tin sản phẩm ASOS:", productInfo);
  return productInfo;
}
const getGmarketProductInfo = () => {
  const url = window.location.href;

  const name = document.querySelector(".text__item-title")?.innerText.trim() || null;

  const priceSelling = document.querySelector(".text__price-selling")?.innerText.trim() || null;
  const priceFinal = document.querySelector(".text__price-decide .text__price-foreign")?.innerText.trim()
                  || document.querySelector(".text__price-decide .text__price-won")?.innerText.trim()
                  || null;
  const price = priceFinal || priceSelling;

  const mainImgEl = document.querySelector(".box__viewer-img .box__thumb--gallery img");
  const mainImage = mainImgEl ? (mainImgEl.src.startsWith("//") ? "https:" + mainImgEl.src : mainImgEl.src) : null;

  const subImages = [...document.querySelectorAll(".list__thumb img")].map(img => {
    const src = img.src;
    return src.startsWith("//") ? "https:" + src : src;
  });

  const productInfo = {
    url,
    name,
    price,
    mainImage,
    subImages
  };

  console.log("Thông tin sản phẩm Gmarket:", productInfo);
  return productInfo;
}


