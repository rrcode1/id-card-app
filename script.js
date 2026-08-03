// ---- Firebase setup ----
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCdYRoNkG-H1G4YqO7djiVwrDPaQhnkCKE",
  authDomain: "my-id-67723.firebaseapp.com",
  databaseURL: "https://my-id-67723-default-rtdb.firebaseio.com",
  projectId: "my-id-67723",
  storageBucket: "my-id-67723.firebasestorage.app",
  messagingSenderId: "412752951188",
  appId: "1:412752951188:web:77b4f2396d25246664c181"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function getCardId() {
  let id = localStorage.getItem('myCardId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('myCardId', id);
  }
  return id;
}

function compressImage(file, maxWidth, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round(height * (maxWidth / width));
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatDate(isoDate) {
  if (!isoDate) return '—';
  const [year, month, day] = isoDate.split('-');
  return `${day}-${month}-${year}`;
}

function wireImageUpload(areaEl, inputEl, previewEl, placeholderEl, maxWidth, quality, onSaved) {
  areaEl.addEventListener('click', () => inputEl.click());
  inputEl.addEventListener('change', async () => {
    const file = inputEl.files[0];
    if (!file) return;
    const dataUrl = await compressImage(file, maxWidth, quality);
    previewEl.src = dataUrl;
    previewEl.style.display = 'block';
    if (placeholderEl) placeholderEl.style.display = 'none';
    onSaved(dataUrl);
  });
}

// =================== VIEW PAGE (index.html) ===================
if (document.getElementById('viewIdNumber')) {
  const bannerAreaView = document.getElementById('bannerAreaView');

  function populateViewPage() {
    const saved = localStorage.getItem('myIdCard');
    if (!saved) return;
    const data = JSON.parse(saved);

    document.getElementById('viewIdNumber').textContent = data.idNumber || '—';
    document.getElementById('viewDob').textContent = formatDate(data.dob);
    document.getElementById('viewName').textContent = data.fullName || '—';
    document.getElementById('viewAddress').textContent = data.address || '—';
    document.getElementById('viewExpiry').textContent = formatDate(data.expiryDate);

    const viewPhoto = document.getElementById('viewPhoto');
    const viewPhotoPlaceholder = document.getElementById('viewPhotoPlaceholder');
    if (data.photo && data.photo.startsWith('data:')) {
      viewPhoto.src = data.photo;
      viewPhoto.style.display = 'block';
      viewPhotoPlaceholder.style.display = 'none';
    }

    const viewLogo = document.getElementById('viewLogo');
    if (data.logo && data.logo.startsWith('data:')) {
      viewLogo.src = data.logo;
      viewLogo.style.display = 'block';
    }

    if (data.banner) {
      bannerAreaView.style.backgroundImage = `url(${data.banner})`;
      bannerAreaView.style.backgroundSize = '100% 100%';
      bannerAreaView.style.backgroundPosition = 'center';
      bannerAreaView.style.backgroundRepeat = 'no-repeat';
    }

    document.getElementById('viewEmail').textContent = data.email || '—';
    document.getElementById('viewPhone').textContent = data.phone || '—';
    document.getElementById('viewFamilyName').textContent = data.familyName || '—';
    document.getElementById('viewConditions').textContent = data.conditions || '—';

    const viewBarcode = document.getElementById('viewBarcode');
    const viewBarcodePlaceholder = document.getElementById('viewBarcodePlaceholder');
    if (data.barcode && data.barcode.startsWith('data:')) {
      viewBarcode.src = data.barcode;
      viewBarcode.style.display = 'block';
      viewBarcodePlaceholder.style.display = 'none';
    }

    const viewExtraImage = document.getElementById('viewExtraImage');
    const viewExtraImagePlaceholder = document.getElementById('viewExtraImagePlaceholder');
    if (data.extraImage && data.extraImage.startsWith('data:')) {
      viewExtraImage.src = data.extraImage;
      viewExtraImage.style.display = 'block';
      viewExtraImagePlaceholder.style.display = 'none';
    }
    document.getElementById('viewExtraSubtitle').textContent = data.extraSubtitle || '';
  }

  window.addEventListener('load', populateViewPage);
}

// =================== EDIT PAGE (edit.html) ===================
if (document.getElementById('saveBtn')) {

  const photoArea = document.getElementById('photoArea');
  const photoInput = document.getElementById('photoInput');
  const photoPreview = document.getElementById('photoPreview');
  const photoPlaceholder = document.getElementById('photoPlaceholder');
  wireImageUpload(photoArea, photoInput, photoPreview, photoPlaceholder, 500, 0.7, () => {});

  const bannerAreaEdit = document.getElementById('bannerAreaEdit');
  const bannerInput = document.getElementById('bannerInput');
  let bannerDataUrl = '';

  bannerAreaEdit.addEventListener('click', (e) => {
    if (e.target.closest('#logoAreaEdit')) return;
    bannerInput.click();
  });

  bannerInput.addEventListener('change', async () => {
    const file = bannerInput.files[0];
    if (!file) return;
    bannerDataUrl = await compressImage(file, 700, 0.6);
    bannerAreaEdit.style.backgroundImage = `url(${bannerDataUrl})`;
    bannerAreaEdit.style.backgroundSize = '100% 100%';
    bannerAreaEdit.style.backgroundPosition = 'center';
    bannerAreaEdit.style.backgroundRepeat = 'no-repeat';
    localStorage.setItem('myIdBanner', bannerDataUrl);
  });

  const logoAreaEdit = document.getElementById('logoAreaEdit');
  const logoInput = document.getElementById('logoInput');
  const logoPreview = document.getElementById('logoPreview');
  const logoPlaceholder = document.getElementById('logoPlaceholder');
  let logoDataUrl = '';

  logoAreaEdit.addEventListener('click', (e) => {
    e.stopPropagation();
    logoInput.click();
  });

  logoInput.addEventListener('change', async () => {
    const file = logoInput.files[0];
    if (!file) return;
    logoDataUrl = await compressImage(file, 150, 0.7);
    logoPreview.src = logoDataUrl;
    logoPreview.style.display = 'block';
    logoPlaceholder.style.display = 'none';
    localStorage.setItem('myIdLogo', logoDataUrl);
  });

  const barcodeArea = document.getElementById('barcodeArea');
  const barcodeInput = document.getElementById('barcodeInput');
  const barcodePreview = document.getElementById('barcodePreview');
  const barcodePlaceholder = document.getElementById('barcodePlaceholder');
  wireImageUpload(barcodeArea, barcodeInput, barcodePreview, barcodePlaceholder, 500, 0.7, () => {});

  const extraImageArea = document.getElementById('extraImageArea');
  const extraImageInput = document.getElementById('extraImageInput');
  const extraImagePreview = document.getElementById('extraImagePreview');
  const extraImagePlaceholder = document.getElementById('extraImagePlaceholder');
  wireImageUpload(extraImageArea, extraImageInput, extraImagePreview, extraImagePlaceholder, 500, 0.7, () => {});

  document.getElementById('saveBtn').addEventListener('click', async () => {
    const data = {
      idNumber: document.getElementById('idNumber').value,
      dob: document.getElementById('dob').value,
      fullName: document.getElementById('fullName').value,
      sex: document.getElementById('sex').value,
      address: document.getElementById('address').value,
      expiryDate: document.getElementById('expiryDate').value,
      photo: photoPreview.src,

      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      familyName: document.getElementById('familyName').value,
      conditions: document.getElementById('conditions').value,
      barcode: barcodePreview.src,

      extraImage: extraImagePreview.src,
      extraSubtitle: document.getElementById('extraSubtitle').value,

      banner: bannerDataUrl || localStorage.getItem('myIdBanner') || '',
      logo: logoDataUrl || localStorage.getItem('myIdLogo') || ''
    };

    localStorage.setItem('myIdCard', JSON.stringify(data));

    const saveBtn = document.getElementById('saveBtn');
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;

    try {
      const cardId = getCardId();
      await setDoc(doc(db, "cards", cardId), data);
    } catch (err) {
      console.error(err);
      alert('Saved locally, but the online upload failed: ' + err.message);
      saveBtn.textContent = 'Save';
      saveBtn.disabled = false;
      return;
    }

    window.location.href = 'index.html';
  });

  window.addEventListener('load', () => {
    const saved = localStorage.getItem('myIdCard');
    if (saved) {
      const data = JSON.parse(saved);
      document.getElementById('idNumber').value = data.idNumber || '';
      document.getElementById('dob').value = data.dob || '';
      document.getElementById('fullName').value = data.fullName || '';
      document.getElementById('sex').value = data.sex || '';
      document.getElementById('address').value = data.address || '';
      document.getElementById('expiryDate').value = data.expiryDate || '';
      if (data.photo && data.photo.startsWith('data:')) {
        photoPreview.src = data.photo;
        photoPreview.style.display = 'block';
        photoPlaceholder.style.display = 'none';
      }

      document.getElementById('email').value = data.email || '';
      document.getElementById('phone').value = data.phone || '';
      document.getElementById('familyName').value = data.familyName || '';
      document.getElementById('conditions').value = data.conditions || '';
      if (data.barcode && data.barcode.startsWith('data:')) {
        barcodePreview.src = data.barcode;
        barcodePreview.style.display = 'block';
        barcodePlaceholder.style.display = 'none';
      }

      if (data.extraImage && data.extraImage.startsWith('data:')) {
        extraImagePreview.src = data.extraImage;
        extraImagePreview.style.display = 'block';
        extraImagePlaceholder.style.display = 'none';
      }
      document.getElementById('extraSubtitle').value = data.extraSubtitle || '';

      if (data.logo && data.logo.startsWith('data:')) {
        logoDataUrl = data.logo;
        logoPreview.src = data.logo;
        logoPreview.style.display = 'block';
        logoPlaceholder.style.display = 'none';
      }
    }

    const savedBanner = localStorage.getItem('myIdBanner');
    if (savedBanner) {
      bannerDataUrl = savedBanner;
      bannerAreaEdit.style.backgroundImage = `url(${savedBanner})`;
      bannerAreaEdit.style.backgroundSize = '100% 100%';
      bannerAreaEdit.style.backgroundPosition = 'center';
      bannerAreaEdit.style.backgroundRepeat = 'no-repeat';
    }
  });
}
