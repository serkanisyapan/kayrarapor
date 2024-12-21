import { useCallback, useEffect, useRef, useState } from 'react';
import { utils, writeFile } from "xlsx"
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, CsvExportModule, ModuleRegistry } from 'ag-grid-community'; 
import { AG_GRID_LOCALE_TR } from '@ag-grid-community/locale';
import './App.css'
import { ExportButtonSVG } from './ExportButtonSVG';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule, CsvExportModule]);
const butonlar = [
  {
    butonAdi: "Sevk Fiş Detayları Raporu",
    sorgu: "sevkFis"
  },
  {
    butonAdi: "Açık Sipariş Detay Raporu",
    sorgu: "acikSiparis"
  },
  {
    butonAdi: "Satın Alma Detay Raporu",
    sorgu: "satinAlmaDetay"
  },
  {
    butonAdi: "Teklif Detay Raporu",
    sorgu: "teklifDetay"
  },
  {
    butonAdi: "Mal Alım Fiş Detayları Raporu",
    sorgu: "malAlimFisDetay"
  },
  {
    butonAdi: "Açık Siparişler Özet Raporu",
    sorgu: "acikSiparisOzet"
  },
  {
    butonAdi: "Bütün Siparişler Özet Raporu",
    sorgu: "butunSiparisOzet"
  },
  {
    butonAdi: "Teklifler",
    sorgu: "teklifler"
  },
  {
    butonAdi: "Stok Kartları Raporu",
    sorgu: "stokKartlari"
  },
  {
    butonAdi: "Ön Maliyet Çalışmaları",
    sorgu: "onMaliyet"
  },
  {
    butonAdi: "Kayra İş Emri Raporu",
    sorgu: "kayraIsEmri"
  },
  {
    butonAdi: "Kayra Kesilen e-irsaliyeler",
    sorgu: "kayraEIrsaliye"
  },
]
const gridOptions = {
  localeText: AG_GRID_LOCALE_TR,
  pagination: true,
  paginationPageSize: 50,
  paginationPageSizeSelector: [50, 100, 200],
  animateRows:false,
  enableCellTextSelection: true,
  rowSelection: { mode: 'multiRow', selectAll:'filtered' }
}
const BASE_URL = import.meta.env.VITE_BASE_URL
const TYPE = import.meta.env.DEV ? 'http' : 'https'

function DetayTablo() {
  const gridRef = useRef(null)
  const [detayRaporu, setDetayRaporu] = useState([]);
  const [raporName, setRaporName] = useState('')
  const [cachedRapor, setCachedRapor] = useState({})
  const [loading, setLoading] = useState(false)
  const [colDefs, setColDefs] = useState([])

  useEffect(() => {
    if (detayRaporu.length === 0) return
    const getColDefs = (detayRaporu) => {
        const firstEntry = detayRaporu[0];
        delete firstEntry['RecId']
        return Object.keys(firstEntry).map(key => ({field: key, filter: true}))
    }
    const newColDef = getColDefs(detayRaporu)
    setColDefs(newColDef)
  }, [detayRaporu])

  const fetchDetayRaporu = async (raporTipi) => {
    setLoading(true)
    const url = `${TYPE}://${BASE_URL}/detayraporlari?rapor=${raporTipi}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const json = await response.json();
      const getRaporName = butonlar.find(buton => buton.sorgu === raporTipi)
      setDetayRaporu(json.recordset);
      cacheRapor(json.recordset, raporTipi)
      setRaporName(getRaporName.butonAdi)
      setLoading(false)
    } catch(error) {
      console.log(error.message);
    }}

  const cacheRapor = (fetchedRapor, raporTipi) => {
    setCachedRapor((prevCache) => ({...prevCache, [raporTipi]: fetchedRapor}))
  }

  const exportExcelFile = (data, name) => {
    const worksheet = utils.json_to_sheet(data)
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, "Rapor")
    writeFile(workbook, `${name}.xlsx`, { compression: true })
  }
  
  const getFilteredData = useCallback(() => {
    const data = []
    gridRef.current.api.forEachNodeAfterFilter(node => data.push(node.data))
    exportExcelFile(data, raporName)
  }, [raporName]);

  return (
    <>
        <div>
          <select
            disabled={loading}
            defaultValue={""}
            onChange={(event) => {
              if (cachedRapor[event.target.value]) {
                const findRaporName = butonlar.find(buton => buton.sorgu === event.target.value)
                setDetayRaporu(cachedRapor[event.target.value])
                setRaporName(findRaporName.butonAdi)
                return;
              }
              fetchDetayRaporu(event.target.value)
            }}
          >
            <option value="" disabled>
              Rapor seçin 
            </option>
            {butonlar.map((buton, index) => (
              <option key={index} value={buton.sorgu}>
                {buton.butonAdi}
              </option>
            ))}
          </select>
        </div>
        <div style={{display: "flex", gap: "10px", justifyContent: "center", alignItems: "center"}}>
          <h2>{raporName}</h2>
          {raporName && <button className={"rapor-button"} onClick={() => getFilteredData()}><ExportButtonSVG/> ({raporName}.xlsx)</button>}
        </div>
        {detayRaporu.length > 0 && 
        <div style={{height: 600}}>
          <AgGridReact 
            ref={gridRef}
            rowData={detayRaporu} 
            columnDefs={colDefs}
            {...gridOptions}
          />
        </div>}
    </>
  )}

export default DetayTablo
