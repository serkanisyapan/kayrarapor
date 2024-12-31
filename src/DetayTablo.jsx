import {
  AllCommunityModule,
  CsvExportModule,
  ModuleRegistry,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ExportButtonSVG } from "./ExportButtonSVG";
import { butonlar, gridOptions } from "./data";
import { useCopyCell } from "./hooks/useCopyCell";
import { useExcelFile } from "./hooks/useExcelFile";
import resetfilter from "./resetfilter.png";
import "./App.css";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule, CsvExportModule]);

function DetayTablo() {
  const gridRef = useRef(null);
  const [detayRaporu, setDetayRaporu] = useState([]);
  const [raporName, setRaporName] = useState("");
  const [cachedRapor, setCachedRapor] = useState({});
  const [loading, setLoading] = useState(false);
  const [colDefs, setColDefs] = useState([]);
  const [seciliSiparisSayisi, setSeciliSiparisSayisi] = useState(0);
  const { importExcelFile } = useExcelFile(gridRef, raporName);
  useCopyCell(gridRef);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const fetchDetayRaporu = async (raporTipi) => {
    setLoading(true);
    const url = `${BASE_URL}/detayraporlari?rapor=${raporTipi}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const json = await response.json();
      const getRaporName = butonlar.find((buton) => buton.sorgu === raporTipi);
      setDetayRaporu(json.recordset);
      cacheRapor(json.recordset, raporTipi);
      setRaporName(getRaporName.butonAdi);
      setLoading(false);
    } catch {
      toast.error("Bir hata oluştu. Tekrar denemek için tıkla.", {
        onClick: () => fetchDetayRaporu(raporTipi),
      });
      setLoading(false);
    }
  };

  const siparisleriKapat = async () => {
    const url = `${BASE_URL}/sipariskapat`;
    const kapatilacakSiparisler = secilenSiparisleriBul();
    const isConfirmed = confirm(
      `Siparişleri kapatmak istiyor musunuz? (${kapatilacakSiparisler.length} sipariş)`,
    );
    if (
      !kapatilacakSiparisler ||
      kapatilacakSiparisler.length === 0 ||
      !isConfirmed
    )
      return;
    await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ siparisler: kapatilacakSiparisler }),
    })
      .then((response) => response.json())
      .then((data) => {
        const findRapor = butonlar.find(
          (buton) => buton.butonAdi === raporName,
        );
        toast.success(data.message);
        fetchDetayRaporu(findRapor.sorgu);
        gridRef.current.api.setFilterModel(null);
      })
      .catch(() => toast.error("Siparişler kapatılamadı"));
  };

  const secilenSiparisleriBul = () => {
    const siparisler = gridRef.current.api.getSelectedRows();
    return siparisler.map((siparis) => siparis.recId);
  };

  const cacheRapor = (fetchedRapor, raporTipi) => {
    setCachedRapor((prevCache) => ({
      ...prevCache,
      [raporTipi]: fetchedRapor,
    }));
  };

  useEffect(() => {
    if (detayRaporu.length === 0) return;
    const getColDefs = (detayRaporu) => {
      const firstEntry = detayRaporu[0];
      // biome-ignore lint/performance/noDelete: <explanation>
      delete firstEntry.recId;
      return Object.keys(firstEntry).map((key) => ({
        field: key,
        filter: true,
        floatingFilter: true,
      }));
    };
    const newColDef = getColDefs(detayRaporu);
    setColDefs(newColDef);
  }, [detayRaporu]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "95%" }}>
        <select
          title="Görüntülemek istediğiniz raporu seçin"
          style={{ marginBottom: "20px" }}
          disabled={loading}
          defaultValue={""}
          onChange={(event) => {
            if (cachedRapor[event.target.value]) {
              const findRaporName = butonlar.find(
                (buton) => buton.sorgu === event.target.value,
              );
              setDetayRaporu(cachedRapor[event.target.value]);
              setRaporName(findRaporName.butonAdi);
              return;
            }
            fetchDetayRaporu(event.target.value);
          }}
        >
          <option value="" disabled>
            Rapor seçin
          </option>
          {butonlar.map((buton) => (
            <option key={buton.sorgu} value={buton.sorgu}>
              {buton.butonAdi}
            </option>
          ))}
        </select>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <button
            title="Filtreleri sıfırla"
            style={{ marginRight: "30%", background: "none", border: "none" }}
            className="rapor-button"
            type="button"
            onClick={() => gridRef.current.api.setFilterModel(null)}
          >
            <img src={resetfilter} alt="reset filter" />
          </button>
          <h2>{raporName}</h2>
          {raporName && (
            <button
              title="Raporu excel'e aktar"
              type="button"
              className={"rapor-button"}
              onClick={() => importExcelFile()}
            >
              <ExportButtonSVG />({raporName}.xlsx)
            </button>
          )}
        </div>
        <div style={{ height: 630 }}>
          <AgGridReact
            ref={gridRef}
            rowData={detayRaporu}
            columnDefs={colDefs}
            {...gridOptions}
            onSelectionChanged={() => {
              const seciliSiparisler = gridRef.current.api.getSelectedRows();
              setSeciliSiparisSayisi(seciliSiparisler.length);
            }}
          />
        </div>
        {raporName === "Açık Sipariş Detay Raporu" && (
          <button
            title="Seçili siparişleri kapat"
            style={{ marginTop: "20px" }}
            type="button"
            disabled={!seciliSiparisSayisi}
            className={"rapor-button"}
            onClick={() => siparisleriKapat()}
          >
            Siparişleri Kapat ({`${seciliSiparisSayisi} sipariş`})
          </button>
        )}
      </div>
    </div>
  );
}

export default DetayTablo;
