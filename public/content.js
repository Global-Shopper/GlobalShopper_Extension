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


  const variants = getSelectedVariantsAmazon()
  const productInfo = {
    url,
    name,
    price,
    mainImage,
    subImages,
    variants
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
    .filter((v, i, arr) => v && arr.indexOf(v) === i);

  const variants = getEbaySelectedVariants()

  const productInfo = {
    url,
    name,
    price,
    mainImage,
    subImages,
    variants
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

  const variants = getAsosSelectedVariants();

  const productInfo = {
    url,
    name,
    price,
    mainImage,
    subImages,
    variants
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



function getSelectedVariantsAmazon() {
  const variants = [];
  const seen = new Set();

  // helper
  const norm = s => (s || "").replace(/\s+/g, " ").trim();
  const isPlaceholder = v => /^(select|chọn|selecione|seleccionar)$/i.test(norm(v));

  // 1) INLINE-TWISTER (các hàng .inline-twister-row)
  document.querySelectorAll('.inline-twister-row').forEach(row => {
    // Ưu tiên label/value hiển thị trong header
    let label = norm(row.querySelector('.dimension-text .a-color-secondary')?.textContent).replace(/:\s*$/, '');
    let value = norm(row.querySelector('.inline-twister-dim-title-value')?.textContent);

    // Fallback: đọc aria-label kiểu "Selected Color is Black. Tap to collapse."
    if ((!label || !value)) {
      const header = row.querySelector('[id^="inline-twister-expander-header-"]');
      const aria = header?.getAttribute('aria-label') || '';
      const m = aria.match(/Selected\s+(.+?)\s+is\s+(.+?)\./i);
      if (m) {
        if (!label) label = norm(m[1]);
        if (!value) value = norm(m[2]);
      }
    }

    if (label && value && !isPlaceholder(value)) {
      const pair = `${label}: ${value}`;
      if (!seen.has(pair)) { seen.add(pair); variants.push(pair); }
    }
  });

  // 2) LEGACY TWISTER (mỗi biến thể nằm trong #variation_*)
  document.querySelectorAll('[id^="variation_"]').forEach(sec => {
    let label =
      norm(sec.querySelector('label.a-form-label')?.textContent).replace(/:\s*$/, '') ||
      // Suy ra từ id: variation_size_name -> Size, variation_color_name -> Color
      norm(sec.id.replace(/^variation_/, '').replace(/_name$/, '').replace(/_/g, ' ')).replace(/\b\w/g, s => s.toUpperCase());

    // Giá trị: ưu tiên .selection (swatches)
    let value =
      norm(sec.querySelector('.selection')?.textContent) ||
      // Dropdown prompt hiển thị (ví dụ "X-Large")
      norm(sec.querySelector('.a-dropdown-prompt')?.textContent) ||
      // Option đang chọn trong <select>
      (function () {
        const opt = sec.querySelector('select option:checked');
        if (!opt) return "";
        return norm(opt.getAttribute('data-a-html-content') || opt.textContent);
      })();

    if (label && value && !isPlaceholder(value)) {
      const pair = `${label}: ${value}`;
      if (!seen.has(pair)) { seen.add(pair); variants.push(pair); }
    }
  });

  // 3) Fallback chung: nếu chưa bắt được gì, thử quét mọi select có prompt/option
  if (variants.length === 0) {
    document.querySelectorAll('select[id^="native_dropdown_selected_"]').forEach(sel => {
      const id = sel.id.replace(/^native_dropdown_selected_/, '').replace(/_name$/, '');
      const label = id.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      const prompt = norm(document.querySelector(`#dropdown_selected_${id}_name .a-dropdown-prompt`)?.textContent);
      const opt = sel.querySelector('option:checked');
      const value = norm(opt?.getAttribute('data-a-html-content') || opt?.textContent || prompt);
      if (label && value && !isPlaceholder(value)) {
        const pair = `${label}: ${value}`;
        if (!seen.has(pair)) { seen.add(pair); variants.push(pair); }
      }
    });
  }

  return variants;
}

function getEbaySelectedVariants(root = document) {
  const containers = root.querySelectorAll('.x-msku-evo[data-testid="x-msku-evo"]');
  const norm = s => (s || "").replace(/\s+/g, " ").trim();
  const isPlaceholder = v => /^select$/i.test(norm(v));
  const variants = [];

  containers.forEach(container => {
    container.querySelectorAll('.vim.x-sku .listbox-button').forEach(box => {
      let label = norm(box.querySelector('.btn__label')?.textContent).replace(/:\s*$/, "");
      let value = norm(box.querySelector('.btn__text')?.textContent);

      // Fallback: nếu nút trống thì tìm option đang active trong listbox popup
      if (!value || isPlaceholder(value)) {
        const active = box.querySelector('.listbox__option--active[aria-selected="true"], .listbox__option--active');
        if (active) {
          value = norm(active.querySelector('.listbox__value')?.textContent || active.textContent);
        }
      }

      // Fallback 2: từ select hidden
      if (!value || isPlaceholder(value)) {
        const native = box.querySelector('select.listbox__native');
        const selOpt = native?.selectedOptions?.[0];
        value = norm(selOpt?.textContent);
      }

      if (label && value && !isPlaceholder(value)) {
        variants.push(`${label}: ${value}`);
      }
    });
  });

  return variants;
}

function getAsosSelectedVariants(root = document) {
  const norm = s => (s || "").replace(/\s+/g, " ").trim();
  const isPlaceholder = v => /^please select$/i.test(norm(v));

  const variants = [];
  let colour = "";
  const colourBlock = root.querySelector('[data-testid="productColour"]');
  if (colourBlock) {
    colour =
      norm(colourBlock.querySelector('.aKxaq, .hEVA6')?.textContent) ||
      norm(
        root
          .querySelector('li[data-testid="facetThumbnail--selected"] [aria-label]')
          ?.getAttribute('aria-label')
      ) ||
      norm(
        root
          .querySelector('li[data-testid="facetThumbnail--selected"] img')
          ?.getAttribute('alt')
      );
  }
  if (colour) variants.push(`Colour: ${colour}`);
  let size = "";
  const sizeSelect =
    root.querySelector('[data-testid="variant-selector"] select') ||
    root.querySelector('#variantSelector');

  if (sizeSelect) {
    const opt =
      sizeSelect.selectedOptions?.[0] ||
      sizeSelect.querySelector('option[selected]');
    const text = norm(opt?.textContent);
    if (opt && opt.value && !isPlaceholder(text)) size = text;
  }
  if (size) variants.push(`Size: ${size}`);

  return variants;
}

