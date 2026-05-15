// ============================================================
//  CONFIGURACIÓN
// ============================================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzj5vaLvCW2MJV8b7U4oVYHsDQl8TkzfTkxspQycfvpIxChmh3Pbim5bWwB-uNV79ATTw/exec";
// ============================================================

// ---- Traducciones ----
const translations = {
  en: {
    title: "W-9 Form Generator",
    subtitle: "Securely Fill, Sign and Submit Your W-9 in Seconds",
    name: "Full Name (as shown on your income tax return)",
    business: "Business Name (if different from above)",
    taxClass: "Federal Tax Classification",
    individual: "Individual / Sole Proprietor",
    ccorp: "C Corporation", scorp: "S Corporation",
    partnership: "Partnership", trust: "Trust/Estate",
    llc: "Limited Liability Company",
    llcType: "LLC Tax Classification",
    address: "Address (Number, Street, and Apt/Suite no.)",
    city: "City", state: "State", zip: "ZIP Code",
    tin: "Taxpayer Identification Number (TIN)",
    ssn: "Social Security Number (SSN)",
    ein: "Employer Identification Number (EIN)",
    signature: "Signature", clear: "Clear",
    download: "Download Only →",
    generate: "Download & Submit W-9 →",
    downloading: "Generating PDF...",
    generating: "Sending W-9...",
    langText: "Ver en Español",
    successMsg: "✅ W-9 downloaded and sent!",
    downloadMsg: "✅ W-9 downloaded successfully!",
    errorMsg: "Error: ",
    signWarn: "Please provide a signature."
  },
  es: {
    title: "Generador de forma W-9",
    subtitle: "Llena, Firma y Envía tu W-9 en Segundos",
    name: "Nombre completo (como aparece en su declaración de impuestos)",
    business: "Nombre del Negocio (si es diferente al anterior)",
    taxClass: "Clasificación de Impuestos Federales",
    individual: "Individuo / Propietario Único",
    ccorp: "Corporación C", scorp: "Corporación S",
    partnership: "Asociación (Partnership)", trust: "Fideicomiso / Sucesión",
    llc: "Sociedad Limitada (LLC)",
    llcType: "Clasificación de Impuestos LLC",
    address: "Dirección (Número, Calle y Apt/Suite no.)",
    city: "Ciudad", state: "Estado", zip: "Código Postal",
    tin: "Número de Identificación (TIN)",
    ssn: "Número de Seguro Social (SSN)",
    ein: "Número Empleador (EIN)",
    signature: "Firma", clear: "Borrar",
    download: "Solo Descargar →",
    generate: "Descargar & Enviar →",
    downloading: "Generando W-9...",
    generating: "Enviando W-9...",
    langText: "View in English",
    successMsg: "✅ ¡W-9 descargado y enviado!",
    downloadMsg: "✅ ¡W-9 descargado exitosamente!",
    errorMsg: "Error: ",
    signWarn: "Por favor firme el documento."
  }
};
let currentLang = 'en';

// ---- DOM ----
const form = document.getElementById('w9Form');
const btnClear = document.getElementById('btnClear');
const btnSubmit = document.getElementById('btnSubmit');
const btnDownload = document.getElementById('btnDownload');
const canvas = document.getElementById('sigCanvas');
const tinInput = document.getElementById('tinInput');
const llcContainer = document.getElementById('llcTypeContainer');
const toast = document.getElementById('toast');
const themeBtn = document.getElementById('themeBtn');
const langBtn = document.getElementById('langBtn');
const langEN = document.getElementById('langEN');
const langES = document.getElementById('langES');
const html = document.documentElement;

// ---- Dark Mode (data-theme attribute, like SafeDrive) ----
const savedTheme = localStorage.getItem('theme');
if (savedTheme) html.setAttribute('data-theme', savedTheme);
themeBtn.addEventListener('click', () => {
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
});

// ---- Firma ----
let signaturePad;
function resizeCanvas() {
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = 200 * ratio;
  canvas.style.height = "200px";
  canvas.getContext("2d").scale(ratio, ratio);
  if (signaturePad) signaturePad.clear();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
signaturePad = new SignaturePad(canvas, { penColor: "black" });
btnClear.addEventListener('click', () => signaturePad.clear());

// ---- Toast ----
function showToast(msg, type) {
  toast.textContent = msg;
  toast.className = 'toast ' + type;
  setTimeout(() => toast.classList.add('hidden'), 4000);
}

// ---- Idioma (pill toggle EN | ES) ----
langBtn.addEventListener('click', () => {
  currentLang = currentLang === 'en' ? 'es' : 'en';
  langEN.classList.toggle('active', currentLang === 'en');
  langES.classList.toggle('active', currentLang === 'es');
  updateLang();
});
function updateLang() {
  const t = translations[currentLang];
  const ids = ['title', 'subtitle', 'name', 'business', 'taxClass', 'individual', 'ccorp', 'scorp',
    'partnership', 'trust', 'llc', 'llcType', 'address', 'city', 'state', 'zip', 'tin', 'ssn', 'ein', 'signature'];
  ids.forEach(id => { const el = document.getElementById('t_' + id); if (el) el.textContent = t[id]; });
  document.getElementById('btnClear').textContent = t.clear;
  if (!btnSubmit.disabled) document.getElementById('t_generate').textContent = t.generate;
  if (!btnDownload.disabled) document.getElementById('t_download').textContent = t.download;
  document.getElementById('name').placeholder = currentLang === 'en' ? "John Doe" : "Juan Pérez";
  document.getElementById('businessName').placeholder = currentLang === 'en' ? "Acme Corp LLC" : "Mi Negocio LLC";
  document.getElementById('address').placeholder = currentLang === 'en' ? "123 Main St, Apt 4B" : "123 Calle Principal, Apt 4B";
  document.getElementById('city').placeholder = currentLang === 'en' ? "New York" : "Nueva York";
  document.getElementById('state').placeholder = currentLang === 'en' ? "NY" : "NY";
  document.getElementById('zip').placeholder = currentLang === 'en' ? "10001" : "10001";
}

// ---- Inputs dinámicos ----
document.getElementById('taxClass').addEventListener('change', e => {
  llcContainer.style.display = e.target.value === 'llc' ? 'flex' : 'none';
});
document.getElementById('tinType').addEventListener('change', e => {
  tinInput.placeholder = e.target.value === 'ssn' ? 'XXX-XX-XXXX' : 'XX-XXXXXXX';
});

// ============================================================
//  FUNCIÓN CENTRAL: Genera el PDF y retorna { base64, fileName }
// ============================================================
async function buildPDF() {
  const pdfBytes = await fetch('fw9.pdf').then(r => r.arrayBuffer());
  const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
  const pdfForm = pdfDoc.getForm();

  const F = {
    name: 'topmostSubform[0].Page1[0].f1_01[0]',
    businessName: 'topmostSubform[0].Page1[0].f1_02[0]',
    individual: 'topmostSubform[0].Page1[0].Boxes3a-b_ReadOrder[0].c1_1[0]',
    cCorp: 'topmostSubform[0].Page1[0].Boxes3a-b_ReadOrder[0].c1_1[1]',
    sCorp: 'topmostSubform[0].Page1[0].Boxes3a-b_ReadOrder[0].c1_1[2]',
    partnership: 'topmostSubform[0].Page1[0].Boxes3a-b_ReadOrder[0].c1_1[3]',
    trust: 'topmostSubform[0].Page1[0].Boxes3a-b_ReadOrder[0].c1_1[4]',
    llc: 'topmostSubform[0].Page1[0].Boxes3a-b_ReadOrder[0].c1_1[5]',
    llcText: 'topmostSubform[0].Page1[0].Boxes3a-b_ReadOrder[0].f1_03[0]',
    address: 'topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_07[0]',
    cityStateZip: 'topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_08[0]',
    ssn1: 'topmostSubform[0].Page1[0].f1_11[0]', ssn2: 'topmostSubform[0].Page1[0].f1_12[0]', ssn3: 'topmostSubform[0].Page1[0].f1_13[0]',
    ein1: 'topmostSubform[0].Page1[0].f1_14[0]', ein2: 'topmostSubform[0].Page1[0].f1_15[0]'
  };

  const setText = (k, v) => { try { pdfForm.getTextField(k).setText(v); } catch (_) { } };
  const setCheck = (k) => { try { pdfForm.getCheckBox(k).check(); } catch (_) { } };

  // Leer datos
  const city = document.getElementById('city').value.trim();
  const state = document.getElementById('state').value.trim();
  const zip = document.getElementById('zip').value.trim();

  const d = {
    name: document.getElementById('name').value,
    businessName: document.getElementById('businessName').value,
    taxClass: document.getElementById('taxClass').value,
    llcType: document.getElementById('llcType').value,
    address: document.getElementById('address').value,
    cityStateZip: `${city}, ${state} ${zip}`,
    tinType: document.getElementById('tinType').value,
    tin: tinInput.value
  };

  setText(F.name, d.name);
  setText(F.businessName, d.businessName);
  switch (d.taxClass) {
    case 'individual': setCheck(F.individual); break;
    case 'ccorp': setCheck(F.cCorp); break;
    case 'scorp': setCheck(F.sCorp); break;
    case 'partnership': setCheck(F.partnership); break;
    case 'trust': setCheck(F.trust); break;
    case 'llc': setCheck(F.llc); setText(F.llcText, d.llcType); break;
  }
  setText(F.address, d.address);
  setText(F.cityStateZip, d.cityStateZip);

  const clean = d.tin.replace(/\D/g, '');
  if (d.tinType === 'ssn' && clean.length >= 9) {
    setText(F.ssn1, clean.substring(0, 3));
    setText(F.ssn2, clean.substring(3, 5));
    setText(F.ssn3, clean.substring(5, 9));
  } else if (clean.length >= 9) {
    setText(F.ein1, clean.substring(0, 2));
    setText(F.ein2, clean.substring(2, 9));
  }

  // Firma: si hay dibujo, incrustar imagen; si no, escribir el nombre como texto
  const page = pdfDoc.getPages()[0];
  if (!signaturePad.isEmpty()) {
    const sigImg = await pdfDoc.embedPng(await fetch(signaturePad.toDataURL('image/png')).then(r => r.arrayBuffer()));
    const sH = 33, sW = sH * (sigImg.width / sigImg.height);
    page.drawImage(sigImg, { x: 160, y: 183, width: sW, height: sH });
  } else {
    const sigFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
    page.drawText(d.name, { x: 165, y: 200, size: 14, font: sigFont });
  }

  // Fecha
  const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
  const now = new Date();
  page.drawText(`${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`, { x: 470, y: 195, size: 11, font });

  // Generar nombre de archivo
  const fileName = `W9_${d.name.replace(/\s+/g, '_')}_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.pdf`;

  // Retornar base64 y nombre
  const base64 = await pdfDoc.saveAsBase64();
  return { base64, fileName, submittedBy: d.name };
}

// ---- Descarga local del PDF ----
function downloadPDF(base64, fileName) {
  const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ---- Validación de campos requeridos ----
function validateForm() {
  // Verificar campos required del formulario
  const requiredInputs = form.querySelectorAll('[required]');
  for (const input of requiredInputs) {
    if (!input.value.trim()) {
      input.focus();
      input.reportValidity();
      return false;
    }
  }
  // Si no hay firma, se usará el nombre como texto — no bloquear
  return true;
}

// ---- Deshabilitar / habilitar ambos botones ----
function setButtonsDisabled(disabled) {
  btnSubmit.disabled = disabled;
  btnDownload.disabled = disabled;
}

// ============================================================
//  BOTÓN 1: Solo Descargar
// ============================================================
btnDownload.addEventListener('click', async () => {
  if (!validateForm()) return;
  const t = translations[currentLang];

  setButtonsDisabled(true);
  document.getElementById('t_download').textContent = t.downloading;

  try {
    const { base64, fileName } = await buildPDF();
    downloadPDF(base64, fileName);
    showToast(t.downloadMsg, 'success');
  } catch (err) {
    console.error(err);
    showToast(t.errorMsg + err.message, 'error');
  } finally {
    setButtonsDisabled(false);
    document.getElementById('t_download').textContent = t.download;
    document.getElementById('t_generate').textContent = t.generate;
  }
});

// ============================================================
//  BOTÓN 2: Generar + Enviar a Google Drive (y también descargar)
// ============================================================
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  const t = translations[currentLang];

  setButtonsDisabled(true);
  document.getElementById('t_generate').textContent = t.generating;

  try {
    const { base64, fileName, submittedBy } = await buildPDF();

    // Enviar a Google Apps Script
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ fileName, base64, submittedBy })
    });
    const result = await res.json();
    if (result.status !== 'ok') throw new Error(result.message || 'Unknown error');

    // También descargar localmente
    downloadPDF(base64, fileName);
    showToast(t.successMsg, 'success');

  } catch (err) {
    console.error(err);
    showToast(t.errorMsg + err.message, 'error');
  } finally {
    setButtonsDisabled(false);
    document.getElementById('t_generate').textContent = t.generate;
    document.getElementById('t_download').textContent = t.download;
  }
});
