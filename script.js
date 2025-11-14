// ===== LOGIN =====
function login() {
    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;

    if (user === "roup" && pass === "king") {
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("app").style.display = "block";
    } else {
        alert("Username atau password salah!");
    }
}


// ===== SIMPAN DATA =====
function simpanData() {
    let nama = document.getElementById("nama").value;
    let kelas = document.getElementById("kelas").value;
    let barang = document.getElementById("barang").value;
    let tanggal = document.getElementById("tanggal").value;

    if (!nama || !kelas || !barang || !tanggal) {
        alert("Lengkapi semua data!");
        return;
    }

    let data = JSON.parse(localStorage.getItem("peminjaman")) || [];

    data.push({
        nama,
        kelas,
        barang,
        tanggal
    });

    localStorage.setItem("peminjaman", JSON.stringify(data));

    muatTabel();

    document.getElementById("nama").value = "";
    document.getElementById("kelas").value = "";
    document.getElementById("barang").value = "";
    document.getElementById("tanggal").value = "";
}


// ===== TAMPILKAN DATA =====
function muatTabel() {
    let data = JSON.parse(localStorage.getItem("peminjaman")) || [];
    let tbody = document.querySelector("#tabelData tbody");
    tbody.innerHTML = "";

    data.forEach((item, index) => {
        let row = `
        <tr>
            <td>${item.nama}</td>
            <td>${item.kelas}</td>
            <td>${item.barang}</td>
            <td>${item.tanggal}</td>
            <td><button onclick="kembalikan(${index})">Kembalikan</button></td>
        </tr>
        `;
        tbody.innerHTML += row;
    });
}


// ===== KEMBALIKAN =====
function kembalikan(index) {
    let data = JSON.parse(localStorage.getItem("peminjaman")) || [];
    data.splice(index, 1);
    localStorage.setItem("peminjaman", JSON.stringify(data));
    muatTabel();
}

window.onload = muatTabel;
