import { useEffect } from "react";

export const useCopyCell = (ref) => {
  const handleCopyCellValue = () => {
    const api = ref.current.api;
    const focusedCell = api.getFocusedCell();
    const row = api.getDisplayedRowAtIndex(focusedCell.rowIndex);
    const cellValue = api.getCellValue({
      rowNode: row,
      colKey: focusedCell.column,
    });
    navigator.clipboard.writeText(cellValue);
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === "c" || event.key === "C")
      ) {
        handleCopyCellValue();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  });
};
