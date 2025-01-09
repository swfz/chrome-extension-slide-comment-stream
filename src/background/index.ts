import { Storage } from "@plasmohq/storage";

const storage = new Storage({ area: "local" });

storage.watch({
  status: (c) => {
    const values = Object.values(c.newValue).filter((v) => v !== undefined);
    if (values.length === 0) {
      chrome.action.setBadgeBackgroundColor({ color: "#c8c8c8" }, () => {});
      chrome.action.setBadgeText({ text: "-" }, () => {});
    }

    const ready = values.every((v) => v !== null);
    if (ready) {
      // green-600
      chrome.action.setBadgeBackgroundColor({ color: "#16a34a" }, () => {});
      chrome.action.setBadgeText({ text: "o" }, () => {});
    } else {
      // red-600
      chrome.action.setBadgeBackgroundColor({ color: "#dc2626" }, () => {});
      chrome.action.setBadgeText({ text: "x" }, () => {});
    }
  },
});

console.log("background script loaded.");
