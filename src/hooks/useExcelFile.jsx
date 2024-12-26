import { utils, writeFile } from "xlsx";

export const useExcelFile = (ref, raporName) => {
  const createExcelFile = (data, name) => {
    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Rapor");
    writeFile(workbook, `${name}.xlsx`, { compression: true });
  };

  const importExcelFile = () => {
    const data = [];
    ref.current.api.forEachNodeAfterFilter((node) => data.push(node.data));
    createExcelFile(data, raporName);
  };

  return { importExcelFile };
};
