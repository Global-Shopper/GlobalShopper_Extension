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

export const utils = {getPlatform}