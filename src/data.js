import { AG_GRID_LOCALE_TR } from "@ag-grid-community/locale";

const gridOptions = {
  localeText: AG_GRID_LOCALE_TR,
  pagination: true,
  paginationPageSize: 50,
  paginationPageSizeSelector: [50, 100, 200],
  animateRows: false,
  enableCellTextSelection: true,
  rowSelection: { mode: "multiRow", selectAll: "filtered" },
};

const butonlar = [
  {
    butonAdi: "Sevk Fiş Detayları Raporu",
    sorgu: "sevkFis",
  },
  {
    butonAdi: "Açık Sipariş Detay Raporu",
    sorgu: "acikSiparis",
  },
  {
    butonAdi: "Satın Alma Detay Raporu",
    sorgu: "satinAlmaDetay",
  },
  {
    butonAdi: "Teklif Detay Raporu",
    sorgu: "teklifDetay",
  },
  {
    butonAdi: "Mal Alım Fiş Detayları Raporu",
    sorgu: "malAlimFisDetay",
  },
  {
    butonAdi: "Açık Siparişler Özet Raporu",
    sorgu: "acikSiparisOzet",
  },
  {
    butonAdi: "Bütün Siparişler Özet Raporu",
    sorgu: "butunSiparisOzet",
  },
  {
    butonAdi: "Teklifler",
    sorgu: "teklifler",
  },
  {
    butonAdi: "Stok Kartları Raporu",
    sorgu: "stokKartlari",
  },
  {
    butonAdi: "Ön Maliyet Çalışmaları",
    sorgu: "onMaliyet",
  },
  {
    butonAdi: "Kayra İş Emri Raporu",
    sorgu: "kayraIsEmri",
  },
  {
    butonAdi: "Kayra Kesilen e-irsaliyeler",
    sorgu: "kayraEIrsaliye",
  },
  {
    butonAdi: "2024 Yıl Sonu Lüleburgaz Sayım Raporu",
    sorgu: "luleburgaz2024",
  },
  {
    butonAdi: "2024 Yıl Sonu İstanbul Sayım Raporu",
    sorgu: "istanbul2024",
  },
];

export { gridOptions, butonlar };
