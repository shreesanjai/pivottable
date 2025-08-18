import { useEffect, useMemo, useState } from "react";

import {
  buildTree,
  flattenTree,
  isValidNumber,
  rowAggregate,
  rowWiseAggregation,
  columnWiseAggregation,
  flattenRowTree,
  headerWord,
} from "../utils/calculate";

const TableDisplay = ({
  rows,
  columns,
  measures,
  data,
  aggegateArray,
  setTotalRows,
  limit,
  offset,
  totalCount,
}) => {
  const [tableValues, setTableValues] = useState([]);
  const [flattenedRowTree, setFlattenedRowTree] = useState([]);

  const pivotRows = useMemo(() => buildTree(data, rows), [data, rows]);
  const pivotColumns = useMemo(
    () => buildTree(data, columns, measures, true),
    [data, columns, measures]
  );

  // useEffect(() => {

  // }, [pivotRows]);

  useEffect(() => {
    if (pivotRows.length > 0) {
      console.log(pivotRows);
      
      const flattenedRowtree = flattenRowTree(pivotRows);
      console.log(flattenedRowtree);
      
      setFlattenedRowTree(
        flattenedRowtree.slice(
          (offset - 1) * limit,
          Math.min(offset * limit, totalCount)
        )
      );
      setTotalRows(flattenedRowtree.length);
    }
    if (measures.length > 0) {
      const flattenedRow = flattenTree(pivotRows).slice(
        (offset - 1) * limit,
        Math.min(offset * limit, totalCount)
      );
      const flattenedColumn = flattenTree(pivotColumns);
      const tempTableValues = [];

      for (let row of flattenedRow) {
        row = row.split("|").filter((prev) => prev !== "");

        const rowFilter = data.filter((item) =>
          rows.every((key, index) => item[key] === row[index])
        );

        const tableRow = [];

        for (let [index, col] of flattenedColumn.entries()) {
          col = col.split("|").filter((prev) => prev !== "");
          const columnFilter = rowFilter
            .filter((item) =>
              columns.every((key, idx) => item[key] === col[idx])
            )
            .map((x) => x[col[col.length - 1]]);

          tableRow.push(
            rowAggregate(columnFilter, aggegateArray[index % measures.length])
          );
        }

        if (pivotColumns.length > 1) {
          const rowAggregateValue = rowWiseAggregation(
            tableRow,
            measures.length,
            aggegateArray
          );
          tableRow.push(...rowAggregateValue);
        }
        tempTableValues.push([...tableRow]);
      }

      const aggregateRow = columnWiseAggregation(
        tempTableValues,
        measures.length,
        aggegateArray
      );
      setTableValues([...tempTableValues, aggregateRow]);
    } else setTableValues([]);
  }, [
    data,
    rows,
    columns,
    measures,
    pivotRows,
    pivotColumns,
    aggegateArray,
    limit,
    offset,
    totalCount,
    setTotalRows
  ]);

  const createPivotColumnHeader = (pivotLevel) => {
    if (!pivotLevel || pivotLevel.length === 0) return null;

    return (
      <>
        <tr>
          {pivotLevel.map((item, idx) => (
            <td
              className="text-center px-4 py-1 border-gray-600 font-medium border"
              key={idx}
              colSpan={item.span}
            >
              {item.children.length === 0 &&
                headerWord(aggegateArray[idx % measures.length])}
              {item.title}
            </td>
          ))}
        </tr>
        {pivotLevel.every((item) => item.children.length > 0) &&
          createPivotColumnHeader(pivotLevel.flatMap((item) => item.children))}
      </>
    );
  };

  return (
    <>
      <div className="rounded-sm">
        {(rows.length > 0 || columns.length > 0 || measures.length > 0) && (
          <table className="text-sm md:text-base border-gray-600 bg-[#1c1c1e] rounded-lg text-white overflow-hidden border">
            <thead className="bg-[#2c2c2e]">
              <tr className="text-center px-4 py-3 font-medium text-gray-100 border-gray-600 border">
                {rows.map((item, idx) => (
                  <td
                    rowSpan={columns.length + 1}
                    key={idx}
                    className="px-4 py-1 border-gray-600 font-medium border"
                  >
                    {item}
                  </td>
                ))}
                {pivotColumns.length > 1 &&
                  pivotColumns.map((item, idx) => (
                    <td
                      colSpan={item.span}
                      key={idx}
                      className="px-4 py-1 border-gray-600 font-medium border"
                    >
                      {item.title}
                    </td>
                  ))}
                {measures.length > 0 &&
                  measures.map((item, idx) => (
                    <td
                      rowSpan={columns.length + 1}
                      key={idx}
                      className="px-4 py-1 border-gray-600 font-medium border"
                    >
                      {"Total "}
                      {headerWord(aggegateArray[idx % measures.length])}
                      {item}
                    </td>
                  ))}
              </tr>

              {pivotColumns.length > 1 &&
                createPivotColumnHeader(
                  pivotColumns.flatMap((pc) => pc.children)
                )}
            </thead>

            <tbody>
              {flattenedRowTree.length > 0 &&
                flattenedRowTree.map((item, idx) => {
                  return (
                    <tr key={idx}>
                      {item.map((x, idx) => {
                        if (x.title === undefined) return;
                        return (
                          <td
                            key={idx}
                            rowSpan={x.span}
                            className="px-4 py-1 border-gray-600 font-medium border"
                          >
                            {x.title}
                          </td>
                        );
                      })}
                      {tableValues.length >= flattenedRowTree.length &&
                        tableValues[idx].map((item, idx) => {
                          return (
                            <td
                              className="px-4 py-1 border-gray-600 font-medium border"
                              key={idx}
                            >
                              {isValidNumber(item)}
                            </td>
                          );
                        })}
                    </tr>
                  );
                })}
            </tbody>

            <tfoot className=" bg-gray-100 dark:bg-[#2c2c2e]">
              {tableValues.length > 2 && (
                <tr className="text-left px-4 py-3 font-medium text-white border-gray-600 border">
                  <td
                    className="px-4 py-1 border-gray-600 font-medium border"
                    colSpan={rows.length}
                  >
                    Total
                  </td>

                  {tableValues.length > 0 &&
                    tableValues[tableValues.length - 1].map((item, idx) => (
                      <td
                        className="text-left px-4 py-1 text-white border-gray-600 font-medium border"
                        key={idx}
                      >
                        {isValidNumber(item)}
                      </td>
                    ))}
                </tr>
              )}
            </tfoot>
          </table>
        )}
      </div>
    </>
  );
};

export default TableDisplay;
