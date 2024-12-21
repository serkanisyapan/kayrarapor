import { useEffect, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, CsvExportModule, ModuleRegistry } from 'ag-grid-community'; 
import { ExportButtonSVG } from './ExportButtonSVG';
import { useExcelFile } from './hooks/useExcelFile';
import { gridOptions, butonlar } from './data';
import './App.css'

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule, CsvExportModule]);
const BASE_URL = import.meta.env.VITE_BASE_URL
const TYPE = import.meta.env.DEV ? 'http' : 'https'

function DetayTablo() {
  const gridRef = useRef(null)
  const [detayRaporu, setDetayRaporu] = useState([]);
  const [raporName, setRaporName] = useState('')
  const [cachedRapor, setCachedRapor] = useState({})
  const [loading, setLoading] = useState(false)
  const [colDefs, setColDefs] = useState([])
  const { importExcelFile } = useExcelFile(gridRef, raporName)

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
  
  const siparisleriKapat = async() => {
    const url = `${TYPE}://${BASE_URL}/sipariskapat`;
    const kapatilacakSiparisler = secilenSiparisleriBul()
    if (!kapatilacakSiparisler || kapatilacakSiparisler.length === 0) return
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ siparisler: kapatilacakSiparisler}),
      })
      console.log(await response.json())
    } catch (err) {
      console.err(err)
    }
  }

  const secilenSiparisleriBul = () => {
    const siparisler = gridRef.current.api.getSelectedRows()
    return siparisler.map(siparis => siparis['RecId'])
  }

  const cacheRapor = (fetchedRapor, raporTipi) => {
    setCachedRapor((prevCache) => ({...prevCache, [raporTipi]: fetchedRapor}))
  }

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
          {
            raporName && 
            <button className={"rapor-button"} onClick={() => importExcelFile()}>
              <ExportButtonSVG/> 
              ({raporName}.xlsx)
            </button>
          }
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
        {raporName === 'Açık Sipariş Detay Raporu' && <button className={'rapor-button'} onClick={() => siparisleriKapat()}>Siparişleri Kapat</button>}
    </>
  )}

export default DetayTablo
