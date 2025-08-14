import React, { useEffect, useState } from "react";
import "./dataviewer.css";
import TableDisplay from "./TableDisplay";
import FileReader from "./FileReader";

const DataViewer = ({ data, headers, setData, setHeaders, setFileName }) => {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [measures, setMeasures] = useState([]);

  const [activeDrag, setActiveDrag] = useState(null);
  const [mainHeaders, setMainHeaders] = useState(null);
  const [aggregateArray, setAggregateArray] = useState([]);

  useEffect(() => {
    const mainHeaders = Object.entries(headers).map(([key, value]) => {
      return {
        id: key.toLowerCase(),
        headerName: key,
        type: value,
        parent_id: "headers",
      };
    });
    setMainHeaders(mainHeaders);
  }, [headers]);

  const handleAggregationChange = (value, index) => {
    const measureAggregate = [...aggregateArray];
    measureAggregate[index] = value;
    setAggregateArray(measureAggregate);
  };

  // --------------------------- Drag drop
  const handleDragStart = (e, header) => {
    setActiveDrag(header.id);
  };

  const allowDrop = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, target) => {
    e.preventDefault();

    setMainHeaders((prevHeaders) => {
      const headerIndex = prevHeaders.findIndex(
        (header) => header.id === activeDrag
      );
      if (headerIndex === -1) return prevHeaders;

      const header = prevHeaders[headerIndex];
      const updatedHeaders = [...prevHeaders];
      const headerName = header.headerName;

      const isValidrop =
        (target === "values" && header.type === "number") ||
        target !== "values";

      if (header.parent_id !== target && isValidrop) {
        updatedHeaders[headerIndex] = { ...header, parent_id: target };

        if (target === "rows")
          setRows((prev) =>
            prev.includes(headerName) ? prev : [...prev, headerName]
          );
        if (target === "columns" && !columns.includes(headerName))
          setColumns((prev) =>
            prev.includes(headerName) ? prev : [...prev, headerName]
          );
        if (target === "values" && !columns.includes(headerName)) {
          setMeasures((prev) =>
            prev.includes(headerName) ? prev : [...prev, headerName]
          );
          handleAggregationChange("sum", measures.length);
        }
      }

      return updatedHeaders;
    });
  };

  const removeItem = (value, idx, target) => {
    setMainHeaders((prev) =>
      prev.map((header) =>
        header.id === value.toLowerCase()
          ? { ...header, parent_id: "headers" }
          : header
      )
    );

    if (target === "rows") setRows((prev) => prev.filter((_, i) => i !== idx));
    if (target === "columns")
      setColumns((prev) => prev.filter((_, i) => i !== idx));
    if (target === "measures") {
      setMeasures((prev) => prev.filter((_, i) => i !== idx));
      setAggregateArray((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const resetAllData = () => {
    setRows([]);
    setColumns([]);
    setMeasures([]);
  };

  return (
    <div className="main-frame">
      <div className="table-frame no-scrollbar">
        {mainHeaders && (
          <TableDisplay
            rows={rows}
            columns={columns}
            measures={measures}
            aggegateArray={aggregateArray}
            data={data}
          />
        )}
      </div>

      <div className="container-frame">
        <div className="flex items-center w-full">
          <FileReader
            setData={setData}
            setHeaders={setHeaders}
            resetData={resetAllData}
            setFileName={setFileName}
          />
        </div>

        {/* ----------- Headers ----------- */}

        {mainHeaders && (
          <div className="p-1">
            <h4 className="font-semibold text-lg text-white mb-2">Headers</h4>
            <div className="h-40 flex flex-wrap gap-2 p-3 bg-black rounded-xl shadow-inner min-h-full overflow-y-auto no-scrollbar">
              {mainHeaders
                .filter((header) => header.parent_id === "headers")
                .map((header) => (
                  <div
                    key={header.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, header)}
                    onDragEnd={() => setActiveDrag(null)}
                    className="h-item flex px-4 h-min py-2 text-white rounded-lg shadow text-sm font-medium cursor-grab active:cursor-grabbing transition duration-150 ease-in-out select-none"
                  >
                    {headers[header.headerName] === "number" ? "∑ " : ""}
                    {header.headerName}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ---------- Row & Column ---------- */}
        <div className="flex p-1 gap-3">
          <div className="flex-2">
            <h4 className="font-semibold text-lg text-white mb-2">Rows</h4>
            <div
              className="h-70 bg-black rounded-lg mb-2 p-3 overflow-y-auto no-scrollbar"
              onDrop={(e) => handleDrop(e, "rows")}
              onDragOver={allowDrop}
              onDragEnd={() => setActiveDrag(null)}
            >
              {rows.map((row, idx) => (
                <div
                  key={idx}
                  //draggable
                  className="h-item mb-2 flex justify-between px-4 h-min py-2 text-white rounded-lg shadow text-sm font-medium cursor-grab active:cursor-grabbing transition duration-150 ease-in-out select-none "
                >
                  {row}{" "}
                  <span
                    className="ml-2 text-red-400 cursor-pointer hover:text-red-600"
                    onClick={() => removeItem(row, idx, "rows")}
                  >
                    ❌
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-2">
            <h4 className="font-semibold text-lg text-white mb-2">Columns</h4>
            <div
              className="h-70 bg-black rounded-lg mb-2 p-3 overflow-y-auto no-scrollbar"
              onDrop={(e) => handleDrop(e, "columns")}
              onDragOver={allowDrop}
              onDragEnd={() => setActiveDrag(null)}
            >
              {columns.map((col, idx) => (
                <div
                  key={idx}
                  className="h-item mb-2 flex justify-between px-4 h-min py-2 text-white rounded-lg shadow text-sm font-medium cursor-grab active:cursor-grabbing transition duration-150 ease-in-out select-none"
                >
                  {col}{" "}
                  <span
                    className="ml-2 text-red-400 cursor-pointer hover:text-red-600"
                    onClick={() => removeItem(col, idx, "columns")}
                  >
                    ❌
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ---------- Values (Only numbers allowed) ---------- */}
        <div className="p-1">
          <h4 className="font-semibold text-lg text-white mb-2">
            Values (∑ Numbers Only)
          </h4>
          <div
            className="h-50 bg-black rounded-lg mb-2 p-3 overflow-y-auto no-scrollbar"
            onDrop={(e) => handleDrop(e, "values")}
            onDragOver={allowDrop}
            onDragEnd={() => setActiveDrag(null)}
          >
            {measures.map((val, idx) => (
              <div
                key={idx}
                className="h-item mb-2 flex justify-between items-baseline px-4 h-min py-2 text-white rounded-lg shadow text-sm font-medium cursor-grab active:cursor-grabbing transition duration-150 ease-in-out select-none"
              >
                {val}{" "}
                <select
                  onChange={(e) => handleAggregationChange(e.target.value, idx)}
                  className="px-1 py-1 rounded-sm bg-black text-white hover:border-gray-300"
                  value={aggregateArray[idx]}
                >
                  <option value="sum">Sum</option>
                  <option value="avg">Average</option>
                  <option value="count">Count</option>
                  <option value="max">Max</option>
                  <option value="min">Min</option>
                </select>
                <span
                  className="ml-2 text-red-400 cursor-pointer hover:text-red-600"
                  onClick={() => removeItem(val, idx, "measures")}
                >
                  ❌
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataViewer;
