// ⚠️  ՍԱ ՓՈԽԻՐ քո backend-ի հասցեով (Render.com-ից կստանաս)
const BACKEND_URL = "https://ՔՈ-ՀԱՍՑԵՆ.onrender.com";

let direction = "grabar-ashkharhabar";

// ── Direction ──────────────────────────────────────
function setDir(d) {
  direction = d;
  document.getElementById("btn-ga").classList.toggle("active", d === "grabar-ashkharhabar");
  document.getElementById("btn-ag").classList.toggle("active", d === "ashkharhabar-grabar");

  if (d === "grabar-ashkharhabar") {
    document.getElementById("src-label").textContent = "Գրաբար";
    document.getElementById("tgt-label").textContent = "Աշխարհաբար";
    document.getElementById("src-text").placeholder = "Գրէ՛ Գրաբարէն…";
  } else {
    document.getElementById("src-label").textContent = "Աշխարհաբար";
    document.getElementById("tgt-label").textContent = "Գրաբար";
    document.getElementById("src-text").placeholder = "Գրի՛ Աշխարհաբարից…";
  }
  resetOutput();
}

function swapDir() {
  const currentOut = document.getElementById("output").dataset.plain || "";
  setDir(direction === "grabar-ashkharhabar" ? "ashkharhabar-grabar" : "grabar-ashkharhabar");
  document.getElementById("src-text").value = currentOut;
  updateCharCount();
  resetOutput();
}

// ── Output helpers ─────────────────────────────────
function resetOutput() {
  const o = document.getElementById("output");
  o.textContent = "Թարգմանութիւնը կը հայտնուի այստեղ…";
  o.className = "output placeholder-text";
  o.dataset.plain = "";
  document.getElementById("copy-btn").style.display = "none";
}

function onInput() {
  updateCharCount();
  resetOutput();
}

function updateCharCount() {
  const len = document.getElementById("src-text").value.length;
  document.getElementById("char-count").textContent = `${len} / 2000`;
}

function clearAll() {
  document.getElementById("src-text").value = "";
  updateCharCount();
  resetOutput();
}

function copyResult() {
  const text = document.getElementById("output").dataset.plain;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById("copy-btn");
    btn.textContent = "✓ Պատճ.";
    setTimeout(() => { btn.textContent = "⧉ Պատճ."; }, 2000);
  });
}

// ── Translate ──────────────────────────────────────
async function translate() {
  const text = document.getElementById("src-text").value.trim();
  if (!text) return;
  if (text.length > 2000) {
    alert("Տեքստը 2000 նիշից երկար է։");
    return;
  }

  const btn = document.getElementById("translate-btn");
  const output = document.getElementById("output");

  btn.disabled = true;
  btn.textContent = "Թարգմանւում է…";
  output.className = "output loading-dots";
  output.textContent = "Թարգմանւում է";
  output.dataset.plain = "";
  document.getElementById("copy-btn").style.display = "none";

  try {
    const res = await fetch(`${BACKEND_URL}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, direction }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      output.className = "output";
      output.textContent = "⚠️ Սխալ՝ " + (data.error || "Անհայտ սխալ");
      return;
    }

    output.className = "output";
    output.textContent = data.translation;
    output.dataset.plain = data.translation;
    document.getElementById("copy-btn").style.display = "inline-block";

  } catch (err) {
    output.className = "output";
    output.textContent = "⚠️ Կապի սխալ։ Համոզվի՛ր, որ backend-ը աշխատում է։";
  } finally {
    btn.disabled = false;
    btn.textContent = "Թարգմանել";
  }
}

// Enter key support (Ctrl+Enter / Cmd+Enter)
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") translate();
});
