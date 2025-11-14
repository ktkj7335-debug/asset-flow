// Login
function login() {
  let user = document.getElementById("username").value;
  let pass = document.getElementById("password").value;

  if (user === "roup" && pass === "king") {
      document.querySelector(".login-box").style.display = "none";
      document.getElementById("main").style.display = "block";
      updateSelect();
  } else {
      alert("Username / Password salah");
  }
}

// Simpan data
function simpanData() {
  let nama = document.getElementById("nama").value;
  let kelas = document.getElementById("kelas").value;
  let barang = document.getElementById("barang").value;
  let tanggal = document.getElementById("tanggal").value;
  let foto = document.getElementById("fotoPinjam").files[0];

  if (!nama || !kelas || !barang || !tanggal || !foto) {
      alert("Harap isi semua data!");
      return;
  }

  let reader = new FileReader();
  reader.onload = function(e) {
      let row = `
          <tr>
              <td>${nama}</td>
              <td>${kelas}</td>
              <td>${barang}</td>
              <td>${tanggal}</td>
              <td><img src="${e.target.result}"></td>
              <td><button onclick="hapusRow(this)">Hapus</button></td>
          </tr>
      `;
      document.querySelector("#tabelData tbody").innerHTML += row;
      updateSelect();
  }
  reader.readAsDataURL(foto);
}

// Hapus data
function hapusRow(btn) {
  btn.parentElement.parentElement.remove();
  updateSelect();
}

// Update dropdown pengembalian
function updateSelect() {
  let select = document.getElementById("selectPeminjam");
  let rows = document.querySelectorAll("#tabelData tbody tr");

  select.innerHTML = "<option value=''>Pilih Peminjam</option>";

  rows.forEach(row => {
      let nama = row.children[0].innerText;
      select.innerHTML += `<option value="${nama}">${nama}</option>`;
  });
}

// Kembalikan barang
function kembalikan() {
  let select = document.getElementById("selectPeminjam").value;
  if (!select) {
      alert("Pilih peminjam!");
      return;
  }

  let rows = document.querySelectorAll("#tabelData tbody tr");
  rows.forEach(row => {
      if (row.children[0].innerText === select) {
          row.remove();
      }
  });

  updateSelect();
}
