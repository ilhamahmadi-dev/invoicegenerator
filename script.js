const formInput = document.getElementById('form-input')
const barangInput = document.getElementById('barang')
const jumlahInput = document.getElementById('jumlah')
const hargaSatuanInput = document.getElementById('harga-satuan')

// Elemen Baru: Keterangan Nota
const keteranganNotaInput = document.getElementById('keterangan-nota')

// Elemen Tanggal Nota
const tanggalNotaInput = document.getElementById('tanggal-nota')
const displayTanggal = document.getElementById('display-tanggal')

// Ambil elemen display keterangan
const displayKeterangan = document.getElementById('display-keterangan')

const tabelBody = document.querySelector('#tabel-nota tbody')
const grandTotalElement = document.getElementById('grand-total')
const printBtn = document.getElementById('print-btn')
const clearBtn = document.getElementById('clear-btn')
const infoKosong = document.getElementById('info-kosong')

let notaItems = [] // Array untuk menyimpan data barang
let tanggalNota = '' // Variabel untuk menyimpan tanggal nota
let keteranganNota = '' // Variabel untuk menyimpan keterangan nota

// Fungsi untuk memformat angka menjadi Rupiah (tanpa Rp)
function formatRupiah(angka) {
  const cleanedAngka = Math.round(angka)
  return new Intl.NumberFormat('id-ID').format(cleanedAngka)
}

// Fungsi untuk memformat tanggal (YYYY-MM-DD menjadi DD-MM-YYYY)
function formatDateDisplay(dateStr) {
  if (!dateStr) return '--/--/----'
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`
  }
  return dateStr
}

// Fungsi untuk memuat data dari LocalStorage
function loadNotaData() {
  const storedItems = localStorage.getItem('notaReimburseItems')
  if (storedItems) {
    notaItems = JSON.parse(storedItems)
  }

  const storedDate = localStorage.getItem('notaReimburseDate')
  if (storedDate) {
    tanggalNota = storedDate
    tanggalNotaInput.value = storedDate // Set nilai input
  } else {
    // Set tanggal hari ini jika belum ada data
    const today = new Date().toISOString().split('T')[0]
    tanggalNota = today
    tanggalNotaInput.value = today
  }

  // Muat Keterangan Nota
  const storedKeterangan = localStorage.getItem('notaReimburseKeterangan')
  if (storedKeterangan) {
    keteranganNota = storedKeterangan
    keteranganNotaInput.value = storedKeterangan
  }
}

// Fungsi untuk menyimpan data ke LocalStorage
function saveNotaData() {
  localStorage.setItem('notaReimburseItems', JSON.stringify(notaItems))
  localStorage.setItem('notaReimburseDate', tanggalNota)
  localStorage.setItem('notaReimburseKeterangan', keteranganNota) // Simpan keterangan
}

// Fungsi untuk menggambar ulang tabel nota
function renderNota() {
  tabelBody.innerHTML = ''
  let totalKeseluruhan = 0

  // Tampilkan tanggal dan keterangan (di elemen tersembunyi untuk print)
  displayTanggal.textContent = formatDateDisplay(tanggalNota)
  displayKeterangan.textContent = keteranganNota || 'Tidak ada keterangan.'

  if (notaItems.length === 0) {
    infoKosong.style.display = 'block'
    printBtn.disabled = true
    clearBtn.disabled = true
    grandTotalElement.textContent = 'Rp 0'
    return
  }

  infoKosong.style.display = 'none'
  printBtn.disabled = false
  clearBtn.disabled = false

  notaItems.forEach((item, index) => {
    const total = item.jumlah * item.hargaSatuan
    totalKeseluruhan += total

    const row = tabelBody.insertRow()

    row.insertCell(0).textContent = index + 1
    row.insertCell(1).textContent = item.nama

    // Sel-sel yang membutuhkan perataan kanan (text-end)
    const cellJumlah = row.insertCell(2)
    cellJumlah.classList.add('text-end')
    cellJumlah.textContent = formatRupiah(item.jumlah)

    const cellHarga = row.insertCell(3)
    cellHarga.classList.add('text-end')
    cellHarga.textContent = 'Rp ' + formatRupiah(item.hargaSatuan)

    const cellTotal = row.insertCell(4)
    cellTotal.classList.add('text-end')
    cellTotal.textContent = 'Rp ' + formatRupiah(total)

    // Tombol Hapus RE-ADDED untuk UI Live
    const actionCell = row.insertCell(5)
    const deleteButton = document.createElement('button')
    deleteButton.textContent = 'Hapus'
    deleteButton.classList.add('btn', 'btn-sm', 'btn-danger', 'delete-btn')
    deleteButton.setAttribute('title', 'Hapus Item')
    deleteButton.onclick = () => deleteItem(index)
    actionCell.appendChild(deleteButton)
  })

  // Perbarui Grand Total
  grandTotalElement.textContent = 'Rp ' + formatRupiah(totalKeseluruhan)
}

// Fungsi untuk menghapus item
function deleteItem(index) {
  if (confirm('Yakin ingin menghapus item ini?')) {
    notaItems.splice(index, 1)
    saveNotaData()
    renderNota()
  }
}

// Event Listener untuk submit form barang
formInput.addEventListener('submit', (e) => {
  e.preventDefault()

  const newItem = {
    nama: barangInput.value,
    jumlah: parseInt(jumlahInput.value),
    hargaSatuan: parseInt(hargaSatuanInput.value),
  }

  notaItems.push(newItem)
  saveNotaData()
  renderNota()

  // Bersihkan input barang, biarkan tanggal tetap
  barangInput.value = ''
  jumlahInput.value = ''
  hargaSatuanInput.value = ''
  barangInput.focus()
})

// Event Listener untuk perubahan input tanggal nota
tanggalNotaInput.addEventListener('change', () => {
  tanggalNota = tanggalNotaInput.value
  saveNotaData()
  renderNota()
})

// Event Listener untuk perubahan Keterangan Nota
keteranganNotaInput.addEventListener('input', () => {
  keteranganNota = keteranganNotaInput.value
  saveNotaData()
  renderNota()
})

// Event Listener untuk tombol Cetak
printBtn.addEventListener('click', () => {
  window.print()
})

// Event Listener untuk tombol Bersihkan Nota
clearBtn.addEventListener('click', () => {
  if (
    confirm(
      'Yakin ingin membersihkan semua data nota? Data akan hilang dari browser ini.'
    )
  ) {
    notaItems = []
    keteranganNota = '' // Bersihkan juga keterangan

    // Reset tanggal ke hari ini saat membersihkan
    const today = new Date().toISOString().split('T')[0]
    tanggalNota = today
    tanggalNotaInput.value = today
    keteranganNotaInput.value = '' // Kosongkan input keterangan

    saveNotaData()
    renderNota()
  }
})

// Inisialisasi: Muat data saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
  loadNotaData()
  renderNota()
})
