const API_URL = "https://script.google.com/macros/s/AKfycbyaypLkWVzB3Ro-Vg-bD62fU2O9PsbIOHD74IevIK9uRcxCIIvVOJu9sRzrCB8vwmB2/exec";

let referensi = {}, semuaLaporan = [];

async function fetchReferensi() {
  const res = await fetch(API_URL + "?action=referensi");
  referensi = await res.json();

  const lokasiSelect = document.querySelector("select[name='lokasi']");
  const filterLokasi = document.getElementById("filterLokasi");
  referensi.lokasi.forEach(l => {
    lokasiSelect.innerHTML += `<option value="${l}">${l}</option>`;
    filterLokasi.innerHTML += `<option value="${l}">${l}</option>`;
  });

  updateKategori();
}

function updateKategori() {
  const tipe = document.getElementById("tipeSelect").value;
  const kategoriSelect = document.querySelector("select[name='kategori']");
  const dataKategori = referensi.kategori[tipe] || [];
  kategoriSelect.innerHTML = "";
  dataKategori.forEach(k => {
    kategoriSelect.innerHTML += `<option value="${k}">${k}</option>`;
  });
}

document.getElementById("tipeSelect").addEventListener("change", updateKategori);

document.getElementById("laporanForm").addEventListener("submit", async e => {
  e.preventDefault();
  const form = e.target;
  const data = {
    tanggal: form.tanggal.value,
    lokasi: form.lokasi.value,
    tipe: form.tipe.value,
    kategori: form.kategori.value,
    nominal: form.nominal.value,
    keterangan: form.keterangan.value
  };

  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(data)
  });

  const result = await res.json();
  if (result.status === "success") {
    showPopup();
    form.reset();
    updateKategori();
    loadLaporan();
  }
});

async function loadLaporan() {
  const res = await fetch(API_URL + "?action=laporan");
  semuaLaporan = await res.json();
  tampilkanLaporan();
}

function tampilkanLaporan() {
  const tbody = document.getElementById("tabelLaporan");
  tbody.innerHTML = "";

  const fLokasi = document.getElementById("filterLokasi").value;
  const fTipe = document.getElementById("filterTipe").value;
  const fAwal = document.getElementById("filterAwal").value;
  const fAkhir = document.getElementById("filterAkhir").value;

  const hasil = semuaLaporan.filter(item => {
    if (fLokasi && item.lokasi !== fLokasi) return false;
    if (fTipe && item.tipe !== fTipe) return false;
    if (fAwal && item.tanggal < fAwal) return false;
    if (fAkhir && item.tanggal > fAkhir) return false;
    return true;
  });

  let totalPemasukan = 0;
  let totalPengeluaran = 0;

  hasil.forEach(row => {
    const tanggal = new Date(row.tanggal);
    const tglFormat = new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(tanggal);

    tbody.innerHTML += `<tr>
      <td>${tglFormat}</td>
      <td>${row.lokasi}</td>
      <td>${row.tipe}</td>
      <td>${row.kategori}</td>
      <td>${Number(row.nominal).toLocaleString("id-ID")}</td>
      <td>${row.keterangan || "-"}</td>
    </tr>`;

    const nominal = Number(row.nominal);
    if (row.tipe === "pemasukan") totalPemasukan += nominal;
    else if (row.tipe === "pengeluaran") totalPengeluaran += nominal;
  });

  // Update summary
  document.getElementById("totalPemasukan").textContent = totalPemasukan.toLocaleString("id-ID");
  document.getElementById("totalPengeluaran").textContent = totalPengeluaran.toLocaleString("id-ID");
  document.getElementById("saldoBersih").textContent = (totalPemasukan - totalPengeluaran).toLocaleString("id-ID");
}


function showPopup() {
  const popup = document.getElementById("popupSuccess");
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 3000);
}

// Inisialisasi
fetchReferensi().then(loadLaporan);
