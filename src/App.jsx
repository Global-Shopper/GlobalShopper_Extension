/* global chrome */
import { useState, useEffect } from "react";
import "./App.css";
import ProductCard from "./components/ProductCard";

function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    chrome.storage.local.get("products", (res) => {
      if (res.products) {
        setProducts(res.products);
      }
    });
  }, []);

  const updateProducts = (newProducts) => {
    setProducts(newProducts);
    chrome.storage.local.set({ products: newProducts });
  };

  const addProduct = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "ADD_PRODUCT" }, (response) => {
        if (response) {
          updateProducts([...products, response]);
        }
      });
    });
  };

  const removeProduct = (index) => {
    updateProducts(products.filter((_, i) => i !== index));
  };

  const sendToGShop = () => {
    if (products.length === 0) {
      alert("Chưa có sản phẩm nào trong giỏ!");
      return;
    }

    chrome.tabs.query({}, (allTabs) => {
      const gshopTab = allTabs.find(
        (t) =>
          t.url?.includes("gshop.io.vn") ||
          t.url?.includes("http://localhost:5173/")
      );
      const sendMessage = (tabId) => {
        console.log("Send Message: ",products)
        chrome.tabs.sendMessage(tabId, {
          action: "SHOW_PRODUCT_LIST",
          products: products,
        });
      };

      if (gshopTab) {
        sendMessage(gshopTab.id);
      } else {
        chrome.tabs.create({ url: "https://gshop.io.vn" }, (newTab) => {
          chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
            if (tabId === newTab.id && info.status === "complete") {
              sendMessage(newTab.id);
              chrome.tabs.onUpdated.removeListener(listener);
            }
          });
        });
      }
    });
  };

  return (
    <div className="p-1 w-72">
      <h1 className="mb-2">GSHOP Grabber</h1>

      <button
        onClick={addProduct}
        className="px-3 py-1 rounded mb-3 w-full"
      >
        ➕ Thêm sản phẩm
      </button>

      {products.map((p, i) => (
        <ProductCard
          key={i}
          product={p}
          onRemove={() => removeProduct(i)}
        />
      ))}

      <button
        onClick={sendToGShop}
        className="bg-green-600 px-3 py-1 rounded w-full"
      >
        🛍️ Mua hàng
      </button>
    </div>
  );
}

export default App;
