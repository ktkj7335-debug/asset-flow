// script.js
document.addEventListener('DOMContentLoaded', () => {

  // DOM refs
  const loginCard = document.getElementById('loginCard');
  const loginBtn = document.getElementById('loginBtn');
  const usernameEl = document.getElementById('username');
  const passwordEl = document.getElementById('password');

  const appArea = document.getElementById('appArea');
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

  const imgModal = document.getElementById('imgModal');
  const modalImg = document.getElementById('modalImg');
  const closeModal = document.getElementById('closeModal');

  const toast = document.getElementById('toast');

  // default date
  if (inputTanggal) inputTanggal.valueAsDate = new Date();

  // helper toast
  function showToast(msg, t=1800){
    toast.textContent = msg;
    toast.style.display = 'block';
    toast.setAttribute('aria-hidden','false');
    setTimeout(()=>{ toast.style.display='none'; toast.setAttribute('aria-hidden','true'); }, t);
  }

  // escape HTML
  function esc(s){ return String(s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }

  // STORAGE helpers
  function getData(){ return JSON.parse(localStorage.getItem('peminjaman')||'[]'); }
  function setData(d){ localStorage.setItem('peminjaman', JSON.stringify(d)); }

  // LOGIN handler (username: king / password: roup)
  loginBtn.addEventListener('click', () => {
    const u = usernameEl.value.trim();
    const p = passwordEl.value.trim();
    if (u === 'king' && p === 'roup') {
      loginCard.style.display = 'none';
      appArea.style.display = 'flex';
      renderTable();
      populateSelect();
      showToast('Login berhasil', 1200);
    } else {
      alert('Username / Password salah!');
    }
  });

  // SAVE data
  saveBtn.addEventListener('click', () => {
    const nama = inputPeminjam.value.trim();
    const kelas = inputKelas.value.trim();
    const barang = inputBarang.value.trim();
    const tgl = inputTanggal.value;
    const fotoFile = inputFotoPinjam.files[0];
    const jam = new Date().toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit',second:'2-digit'});

    if (!nama || !kelas || !barang || !tgl || !fotoFile) {
      alert('Lengkapi semua data dan foto terlebih dahulu!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = getData();
      data.push({
        nama, kelas, barang, tgl, jam,
        fotoPinjam: e.target.result,
        tglKembali: '',
        fotoKembali: ''
      });
      setData(data);
      renderTable();
      populateSelect();

      // reset form
      inputPeminjam.value = '';
      inputKelas.value = '';
      inputBarang.value = '';
      inputFotoPinjam.value = '';
      inputTanggal.valueAsDate = new Date();
      showToast('Data tersimpan');
    };
    reader.readAsDataURL(fotoFile);
  });

  // renderTable
  function renderTable(){
    const data = getData();
    dataTableBody.innerHTML = '';
    data.forEach((rec, idx) => {
      const tr = document.createElement('tr');

      const fotoCell = rec.fotoPinjam ? `<img src="${rec.fotoPinjam}" class="preview" data-src="${rec.fotoPinjam}" alt="foto pinjam">` : '-';
      const fotoKembaliCell = rec.fotoKembali ? `<img src="${rec.fotoKembali}" class="preview" data-src="${rec.fotoKembali}" alt="foto kembali">` : '-';
      const aksi = !rec.tglKembali ? `<button class="return-row" data-i="${idx}">Kembalikan</button>` : 'Selesai';

      tr.innerHTML = `
        <td>${esc(rec.nama)}</td>
        <td>${esc(rec.kelas)}</td>
        <td>${esc(rec.barang)}</td>
        <td>${esc(rec.tgl)}</td>
        <td>${esc(rec.jam)}</td>
        <td>${fotoCell}</td>
        <td>${esc(rec.tglKembali || '-')}</td>
        <td>${fotoKembaliCell}</td>
        <td>${aksi}</td>
      `;
      dataTableBody.appendChild(tr);
    });

    // attach events
    document.querySelectorAll('.return-row').forEach(btn=>{
      btn.addEventListener('click', e=>{
        const i = parseInt(e.currentTarget.dataset.i,10);
        returnFromTable(i);
      });
    });

    document.querySelectorAll('.preview').forEach(img=>{
      img.addEventListener('click', e=>{
        modalImg.src = e.currentTarget.dataset.src;
        imgModal.style.display = 'flex';
        imgModal.setAttribute('aria-hidden','false');
      });
    });
  }

  // populate select with index values (prevents duplicate-name problem)
  function populateSelect(){
    const data = getData();
    selectPeminjam.innerHTML = '<option value="">Pilih peminjam</option>';
    data.forEach((rec, idx) => {
      if (!rec.tglKembali) {
        const opt = document.createElement('option');
        opt.value = String(idx); // index
        opt.textContent = `${rec.nama} — ${rec.barang}`;
        selectPeminjam.appendChild(opt);
      }
    });
  }

  // return via form
  returnBtn.addEventListener('click', () => {
    const idxStr = selectPeminjam.value;
    const tgl = inputTglKembali.value;
    const file = inputFotoKembali.files[0];

    if (idxStr === '' || !tgl || !file) {
      alert('Lengkapi data pengembalian!');
      return;
    }
    const idx = parseInt(idxStr, 10);
    const data = getData();
    if (!data[idx]) {
      alert('Data tidak ditemukan atau sudah dikembalikan.');
      populateSelect();
      renderTable();
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      data[idx].tglKembali = tgl;
      data[idx].fotoKembali = e.target.result;
      setData(data);
      renderTable();
      populateSelect();
      inputTglKembali.value = '';
      inputFotoKembali.value = '';
      selectPeminjam.value = '';
      showToast('Barang dikembalikan');
    };
    reader.readAsDataURL(file);
  });

  // return from table (prompt date + file chooser)
  function returnFromTable(index){
    const defaultDate = new Date().toISOString().split('T')[0];
    const tgl = prompt('Masukkan tanggal kembali (YYYY-MM-DD):', defaultDate);
    if (!tgl) return;

    const tmp = document.createElement('input');
    tmp.type = 'file';
    tmp.accept = 'image/*';
    tmp.addEventListener('change', e=>{
      const file = e.target.files[0];
      if (!file) { alert('Foto pengembalian belum dipilih'); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const data = getData();
        if (!data[index]) { alert('Data tidak ditemukan'); return; }
        data[index].tglKembali = tgl;
        data[index].fotoKembali = ev.target.result;
        setData(data);
        renderTable();
        populateSelect();
        showToast('Barang dikembalikan');
      };
      reader.readAsDataURL(file);
    });
    tmp.click();
  }

  // modal close
  closeModal && closeModal.addEventListener('click', () => {
    imgModal.style.display = 'none';
    imgModal.setAttribute('aria-hidden','true');
  });
  imgModal.addEventListener('click', (e) => {
    if (e.target === imgModal) { imgModal.style.display='none'; imgModal.setAttribute('aria-hidden','true'); }
  });

  // initial render
  renderTable();
  populateSelect();
});
