import { useEffect, useMemo, useState } from "react";

import {
  buildTree,
  flattenTree,
  isValidNumber,
  rowAggregate,
  rowWiseAggregation,
  columnWiseAggregation,
  flattenRowTree,
} from "../utils/calculate";

const createPivotColumnHeader = (pivotLevel) => {
  if (!pivotLevel || pivotLevel.length === 0) return null;

  return (
    <>
      <tr>
        {pivotLevel.map((item, idx) => (
          <td
            className="text-center px-4 py-1 border-b border-gray-200 dark:border-gray-700 font-medium border-r"
            key={idx}
            colSpan={item.span}
          >
            {item.title}
          </td>
        ))}
      </tr>
      {pivotLevel.every((item) => item.children.length > 0) &&
        createPivotColumnHeader(pivotLevel.flatMap((item) => item.children))}
    </>
  );
};

const TableDisplay = ({ rows, columns, values, data, agg }) => {
  const [tableValues, setTableValues] = useState([]);

  const pivotRows = useMemo(() => buildTree(data, rows), [data, rows]);
  const pivotColumns = useMemo(
    () => buildTree(data, columns, values, true),
    [data, columns, values]
  );

  const [flattenedRowTree, setFlattenedRowTree] = useState([]);

  useEffect(() => {
    setFlattenedRowTree(flattenRowTree(pivotRows));
  }, [pivotRows]);

  useEffect(() => {
    const flattenedRow = flattenTree(pivotRows);
    const flattenedColumn = flattenTree(pivotColumns);
    const tempTableValues = [];

    for (let row of flattenedRow) {
      row = row.split("|");

      const rowFilter = data.filter((item) =>
        rows.every((key, index) => item[key] === row[index])
      );

      const tableRow = [];

      for (let col of flattenedColumn) {
        col = col.split("|");
        const columnFilter = rowFilter
          .filter((item) =>
            columns.every((key, index) => item[key] === col[index])
          )
          .map((x) => x[col[col.length - 1]]);

        tableRow.push(rowAggregate(columnFilter, agg));
      }

      if (pivotColumns.length > 1) {
        const rowAggregateValue = rowWiseAggregation(
          tableRow,
          values.length === 0 ? 1 : values.length,
          agg === "count" ? "sum" : agg
        );
        tableRow.push(...rowAggregateValue);
      }
      tempTableValues.push([...tableRow]);
    }

    const aggregateRow = columnWiseAggregation(
      tempTableValues,
      agg === "count" ? "sum" : agg
    );
    setTableValues([...tempTableValues, aggregateRow]);
  }, [data, rows, columns, values, pivotRows, pivotColumns, agg]);

  return (
    <>
      <div>
        {(rows.length > 0 || columns.length > 0) && (
          <table className="w-5/6 text-sm md:text-base table-auto bg-white dark:bg-[#1c1c1e] text-gray-900 rounded-sm dark:text-white overflow-hidden">
            <thead className="bg-gray-100 dark:bg-[#2c2c2e]">
              <tr className="text-center px-4 py-3 font-medium text-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-gray-600">
                {rows.map((item, idx) => (
                  <td
                    rowSpan={columns.length + 1}
                    key={idx}
                    className="px-4 py-1 border-b border-gray-200 dark:border-gray-700 font-medium border-r "
                  >
                    {item}
                  </td>
                ))}
                {pivotColumns.length > 1 &&
                  pivotColumns.map((item, idx) => (
                    <td
                      colSpan={item.span}
                      key={idx}
                      className="px-4 py-1 border-b border-gray-200 dark:border-gray-700 font-medium border-r "
                    >
                      {item.title}
                    </td>
                  ))}
                {values.length > 0 ? (
                  values.map((item, idx) => (
                    <td
                      rowSpan={columns.length + 1}
                      key={idx}
                      className="px-4 py-1 border-b border-gray-200 dark:border-gray-700 font-medium border-r "
                    >
                      {item}
                    </td>
                  ))
                ) : (columns.length <= 0 && rows.length > 0) ||
                  values.length <= 0 ? (
                  <td
                    rowSpan={columns.length + 1}
                    className="px-4 py-1 border-b border-gray-200 dark:border-gray-700 font-medium border-r "
                  >
                    Total
                  </td>
                ) : (
                  <></>
                )}
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
                      {item.map((x) => {
                        if (x.title === undefined) return;
                        return (
                          <td
                            rowSpan={x.span}
                            className="px-4 py-1 border-b border-gray-200 dark:border-gray-700 font-medium border-r "
                          >
                            {x.title}
                          </td>
                        );
                      })}
                      {tableValues.length >= flattenedRowTree.length &&
                        tableValues[idx].map((item,idx) => {
                          return (
                            <td className="px-4 py-1 border-b border-gray-200 dark:border-gray-700 font-medium border-r" key={idx}>
                              {isValidNumber(item)}
                            </td>
                          );
                        })}
                    </tr>
                  );
                })}
            </tbody>
            <tfoot>
              {rows.length > 0 && (
                <tr className="text-center px-4 py-3 font-medium text-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-[#2c2c2e]">
                  <td
                    className="text-center px-4 py-1 border-b border-gray-200 dark:border-gray-700 font-medium border-r "
                    colSpan={rows.length}
                  >
                    Total
                  </td>

                  {tableValues.length > 0 &&
                    tableValues[tableValues.length - 1].map((item, idx) => (
                      <td
                        className="text-left px-4 py-1 border-b border-gray-200 dark:border-gray-700 font-medium border-r "
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
