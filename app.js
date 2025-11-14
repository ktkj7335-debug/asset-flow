// file: app.js
// Pastikan file ini dipanggil dengan `defer` di index.html atau setelah DOM siap.

document.addEventListener('DOMContentLoaded', () => {

  // --- Elemen DOM (gunakan getElementById agar tidak mengandalkan global id vars) ---
  const loginPage = document.getElementById('loginPage');
  const mainApp = document.getElementById('mainApp');

  const usernameEl = document.getElementById('username');
  const passwordEl = document.getElementById('password');
  const loginBtn = document.getElementById('loginBtn');

  const inputPeminjam = document.getElementById('inputPeminjam');
  const inputKelas = document.getElementById('inputKelas');
  const inputBarang = document.getElementById('inputBarang');
  const inputTanggal = document.getElementById('inputTanggal');
  const inputFotoPinjam = document.getElementById('inputFotoPinjam');
  const saveBtn = document.getElementById('saveBtn');

  const selectPeminjam = document.getElementById('selectPeminjam');
  const inputTglKembali = document.getElementById('inputTglKembali');
  const inputFotoKembali = document.getElementById('inputFotoKembali');
  const returnBtn = document.getElementById('returnBtn');

  const dataTableBody = document.querySelector('#dataTable tbody');

  const stars = document.getElementById('stars');
  const themeBtn = document.getElementById('themeBtn');

  const imgModal = document.getElementById('imgModal');
  const modalImg = document.getElementById('modalImg');
  const closeModalBtn = document.getElementById('closeModalBtn');

  // Set tanggal pinjam default = hari ini
  if (inputTanggal) inputTanggal.valueAsDate = new Date();

  // --- Login ---
  loginBtn && loginBtn.addEventListener('click', () => {
    const u = usernameEl.value.trim();
    const p = passwordEl.value.trim();
    if (u === 'roup' && p === 'roup') {
      loginPage.style.display = 'none';
      mainApp.style.display = 'block';
      mainApp.removeAttribute('aria-hidden');
      loginPage.setAttribute('aria-hidden', 'true');
      // refresh view
      renderTable();
      populateSelect();
    } else {
      alert('Username / Password salah!');
    }
  });

  // --- Simpan Data (Simpan Data Peminjaman) ---
  saveBtn && saveBtn.addEventListener('click', () => {
    const nama = inputPeminjam.value.trim();
    const kelas = inputKelas.value.trim();
    const barang = inputBarang.value.trim();
    const tgl = inputTanggal.value;
    const fotoFile = inputFotoPinjam.files[0];
    const jam = new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit', second:'2-digit'});

    if (!nama || !kelas || !barang || !fotoFile) {
      alert('Lengkapi semua data dan foto sebelum menyimpan!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const newRecord = {
        nama, kelas, barang, tgl, jam,
        fotoPinjam: e.target.result,
        tglKembali: '',
        fotoKembali: ''
      };

      const data = JSON.parse(localStorage.getItem('peminjaman') || '[]');
      data.push(newRecord);
      localStorage.setItem('peminjaman', JSON.stringify(data));

      // update tampilan
      renderTable();
      populateSelect();

      // reset form
      inputPeminjam.value = '';
      inputKelas.value = '';
      inputBarang.value = '';
      inputFotoPinjam.value = '';
      inputTanggal.valueAsDate = new Date();

      // fokus ke nama untuk input cepat
      inputPeminjam.focus();
    };
    reader.readAsDataURL(fotoFile);
  });

  // --- Render tabel dari localStorage ---
  function renderTable() {
    const data = JSON.parse(localStorage.getItem('peminjaman') || '[]');
    dataTableBody.innerHTML = '';

    data.forEach((rec, idx) => {
      const tr = document.createElement('tr');

      const fotoCell = rec.fotoPinjam ? `<img src="${rec.fotoPinjam}" class="preview" alt="foto pinjam" data-src="${rec.fotoPinjam}">` : '-';
      const fotoKembaliCell = rec.fotoKembali ? `<img src="${rec.fotoKembali}" class="preview" alt="foto kembali" data-src="${rec.fotoKembali}">` : '-';

      const aksiCell = !rec.tglKembali
        ? `<button data-index="${idx}" class="return-btn">Kembalikan</button>`
        : 'Selesai';

      tr.innerHTML = `
        <td>${escapeHtml(rec.nama)}</td>
        <td>${escapeHtml(rec.kelas)}</td>
        <td>${escapeHtml(rec.barang)}</td>
        <td>${escapeHtml(rec.tgl)}</td>
        <td>${escapeHtml(rec.jam)}</td>
        <td>${fotoCell}</td>
        <td>${rec.tglKembali || '-'}</td>
        <td>${fotoKembaliCell}</td>
        <td>${aksiCell}</td>
      `;
      dataTableBody.appendChild(tr);
    });

    // Pasang event listener untuk tombol kembalikan pada setiap baris
    document.querySelectorAll('.return-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const i = parseInt(e.currentTarget.dataset.index, 10);
        handleReturnFromTable(i);
      });
    });

    // Pasang event listener preview image
    document.querySelectorAll('.preview').forEach(img => {
      img.addEventListener('click', (e) => {
        const src = e.currentTarget.getAttribute('data-src');
        openModal(src);
      });
    });
  }

  // --- Populate dropdown peminjam yang belum kembali ---
  function populateSelect() {
    selectPeminjam.innerHTML = '<option value="">Pilih peminjam</option>';
    const data = JSON.parse(localStorage.getItem('peminjaman') || '[]');
    data.forEach((rec, idx) => {
      if (!rec.tglKembali) {
        const opt = document.createElement('option');
        // gunakan index agar aman jika ada nama sama - memilih berdasarkan index
        opt.value = String(idx);
        opt.textContent = `${rec.nama} — ${rec.barang}`;
        selectPeminjam.appendChild(opt);
      }
    });
  }

  // --- Kembalikan via form (menggunakan index dari select value) ---
  returnBtn && returnBtn.addEventListener('click', () => {
    const selectedIndex = selectPeminjam.value;
    const tgl = inputTglKembali.value;
    const file = inputFotoKembali.files[0];

    if (selectedIndex === '' || !tgl || !file) {
      alert('Lengkapi data pengembalian!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(localStorage.getItem('peminjaman') || '[]');
      const idx = parseInt(selectedIndex, 10);
      if (!data[idx]) {
        alert('Data peminjaman tidak ditemukan (mungkin sudah dikembalikan).');
        populateSelect();
        renderTable();
        return;
      }
      data[idx].tglKembali = tgl;
      data[idx].fotoKembali = e.target.result;
      localStorage.setItem('peminjaman', JSON.stringify(data));

      // refresh UI
      renderTable();
      populateSelect();

      // reset form kembali
      inputTglKembali.value = '';
      inputFotoKembali.value = '';
      selectPeminjam.value = '';
    };
    reader.readAsDataURL(file);
  });

  // --- Kembalikan dari tombol di tabel (menggunakan prompt untuk tanggal) ---
  function handleReturnFromTable(index) {
    const defaultDate = new Date().toISOString().split('T')[0];
    const tgl = prompt('Masukkan tanggal kembali (YYYY-MM-DD):', defaultDate);
    if (!tgl) return; // user cancel

    // buat input file sementara agar user pilih foto
    const tempInput = document.createElement('input');
    tempInput.type = 'file';
    tempInput.accept = 'image/*';
    tempInput.addEventListener('change', (ev) => {
      const file = ev.target.files[0];
      if (!file) {
        alert('Foto pengembalian belum dipilih.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = JSON.parse(localStorage.getItem('peminjaman') || '[]');
        if (!data[index]) {
          alert('Data tidak ditemukan.');
          return;
        }
        data[index].tglKembali = tgl;
        data[index].fotoKembali = e.target.result;
        localStorage.setItem('peminjaman', JSON.stringify(data));
        renderTable();
        populateSelect();
      };
      reader.readAsDataURL(file);
    });
    tempInput.click();
  }

  // --- Modal preview gambar ---
  function openModal(src) {
    modalImg.src = src;
    imgModal.style.display = 'block';
    imgModal.setAttribute('aria-hidden', 'false');
  }
  closeModalBtn && closeModalBtn.addEventListener('click', () => {
    imgModal.style.display = 'none';
    imgModal.setAttribute('aria-hidden', 'true');
  });

  // close modal when click outside image
  imgModal.addEventListener('click', (e) => {
    if (e.target === imgModal) {
      imgModal.style.display = 'none';
      imgModal.setAttribute('aria-hidden', 'true');
    }
  });

  // --- Theme toggle ---
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    themeBtn.textContent = document.body.classList.contains('dark') ? '🌙' : '☀️';
  });

  // --- Stars background (simple) ---
  function createStars() {
    for (let i = 0; i < 40; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      s.style.left = Math.random() * 100 + '%';
      s.style.width = s.style.height = (Math.random() * 3 + 1) + 'px';
      s.style.animationDuration = (Math.random() * 2 + 1) + 's';
      stars.appendChild(s);
    }
  }
  createStars();

  // --- Utility: escape HTML to avoid injection in table ---
  function escapeHtml(unsafe) {
    if (unsafe === undefined || unsafe === null) return '';
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial render (when page loaded)
  renderTable();
  populateSelect();
});
