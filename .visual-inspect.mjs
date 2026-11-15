import { writeFile } from "node:fs/promises";

const targets = await (await fetch("http://127.0.0.1:9222/json")).json();
const page = targets.find((target) => target.type === "page");
if (!page) throw new Error("No Chromium page target was found.");

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let nextId = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id) return;
  const task = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) task.reject(new Error(message.error.message));
  else task.resolve(message.result);
});

function command(method, params = {}) {
  const id = ++nextId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

await command("Page.enable");
await command("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await command("Page.navigate", { url: "http://127.0.0.1:5173/" });
await new Promise((resolve) => setTimeout(resolve, 5_000));
const browserInfo = await command("Runtime.evaluate", {
  expression: `JSON.stringify((() => { const canvas = document.querySelector('canvas'); canvas.tabIndex = 0; canvas.focus(); return { focused: document.activeElement === canvas, tabIndex: canvas?.tabIndex, rect: canvas?.getBoundingClientRect().toJSON() }; })())`,
  returnByValue: true,
});
console.log(browserInfo.result?.value ?? "No browser state returned.");
const focusInfo = await command("Runtime.evaluate", {
  expression: `JSON.stringify({ focused: document.activeElement === document.querySelector('canvas') })`,
  returnByValue: true,
});
console.log(focusInfo.result?.value ?? "No canvas focus state returned.");
await command("Input.dispatchKeyEvent", {
  type: "keyDown",
  key: "e",
  code: "KeyE",
  windowsVirtualKeyCode: 69,
  nativeVirtualKeyCode: 69,
  text: "e",
  unmodifiedText: "e",
});
await new Promise((resolve) => setTimeout(resolve, 11_000));
await command("Input.dispatchKeyEvent", {
  type: "keyUp",
  key: "e",
  code: "KeyE",
  windowsVirtualKeyCode: 69,
  nativeVirtualKeyCode: 69,
});
await new Promise((resolve) => setTimeout(resolve, 1_000));

const screenshot = await command("Page.captureScreenshot", { format: "png" });
await writeFile(".visual-elevated.png", Buffer.from(screenshot.data, "base64"));
console.log("Captured elevated Mars view.");
socket.close();
