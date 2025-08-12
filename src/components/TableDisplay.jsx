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

// Fixed version of your recursive approach
const recursiveRowMapper = (rows, tableValues,isValidNumber) => {
  let globalRowIndex = 0;
  
  const mapRows = (nodes) => {
    const result = [];
    
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        
        node.children.forEach((child, childIndex) => {
          if (child.children && child.children.length > 0) {

            child.children.forEach((grandChild, grandChildIndex) => {
              const cells = [];
              

              if (childIndex === 0 && grandChildIndex === 0) {
                cells.push(
                  <td
                    key={`parent-${node.title}`}
                    rowSpan={node.span}
                    className="px-4 py-1 border-b border-gray-200 dark:border-gray-700 font-medium border-r"
                  >
                    {node.title}
                  </td>
                );
              }

              if (grandChildIndex === 0) {
                cells.push(
                  <td
                    key={`child-${child.title}`}
                    rowSpan={child.span}
                    className="px-4 py-1 border-b border-gray-200 dark:border-gray-700 font-medium border-r"
                  >
                    {child.title}
                  </td>
                );
              }
              
              // Add grandchild cell
              cells.push(
                <td
                  key={`grandchild-${grandChild.title}`}
                  className="px-4 py-1 border-b border-gray-200 dark:border-gray-700 border-r"
                >
                  {grandChild.title}
                </td>
              );
              
              // Add table values
              if (tableValues && tableValues[globalRowIndex]) {
                tableValues[globalRowIndex].forEach((value, valueIndex) => {
                  cells.push(
                    <td
                      key={`value-${globalRowIndex}-${valueIndex}`}
                      className="px-4 py-1 border-b border-gray-200 dark:border-gray-700"
                    >
                      {isValidNumber(value)}
                    </td>
                  );
                });
              }
              
              result.push(
                <tr key={`row-${globalRowIndex}`}>
                  {cells}
                </tr>
              );
              
              globalRowIndex++;
            });
          } else {
            // Direct child without further nesting
            const cells = [];
            
            // Add parent cell with rowSpan only on first child
            if (childIndex === 0) {
              cells.push(
                <td
                  key={`parent-${node.title}`}
                  rowSpan={node.span}
                  className="px-4 py-1 border-b border-gray-200 dark:border-gray-700 font-medium border-r"
                >
                  {node.title}
                </td>
              );
            }
            
            // Add child cell
            cells.push(
              <td
                key={`child-${child.title}`}
                className="px-4 py-1 border-b border-gray-200 dark:border-gray-700 border-r"
              >
                {child.title}
              </td>
            );
            
            // Add table values
            if (tableValues && tableValues[globalRowIndex]) {
              tableValues[globalRowIndex].forEach((value, valueIndex) => {
                cells.push(
                  <td
                    key={`value-${globalRowIndex}-${valueIndex}`}
                    className="px-4 py-1 border-b border-gray-200 dark:border-gray-700 border-r"
                  >
                    {value}
                  </td>
                );
              });
            }
            
            result.push(
              <tr key={`row-${globalRowIndex}`}>
                {cells}
              </tr>
            );
            
            globalRowIndex++;
          }
        });
      }
    });
    
    return result;
  };
  
  return mapRows(rows);
};


const TableDisplay = ({ rows, columns, values, data, agg, headers }) => {
  const [tableValues, setTableValues] = useState([]);

  const pivotRows = useMemo(() => buildTree(data, rows), [data, rows]);
  const pivotColumns = useMemo(
    () => buildTree(data, columns, values, true),
    [data, columns, values]
  );
  const [flattenedRowTree,setFlattenedRowTree] = useState([]);

  useEffect(() => {
    console.log(JSON.stringify(pivotRows));
    console.log(JSON.stringify(pivotColumns));

    console.table(flattenTree(pivotRows));
    console.table(flattenTree(pivotColumns));
    setFlattenedRowTree(flattenRowTree(pivotRows));
  }, [rows, columns, values, data, agg]);

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

      if(pivotColumns.length > 1)
      {
        const rowAggregateValue = rowWiseAggregation(
          tableRow,
          values.length,
          agg === "count" ? "sum" : agg
        );
        tableRow.push(...rowAggregateValue);
      }

      tempTableValues.push([...tableRow]);
    }

    // call the separate function
    const aggregateRow = columnWiseAggregation(
      tempTableValues,
      agg === "count" ? "sum" : agg
    );
    setTableValues([...tempTableValues, aggregateRow]);

  }, [pivotRows, pivotColumns, agg]);

  useEffect(() => console.table(tableValues), [tableValues]);

  return (
    <>
      <div>
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
              ) : columns.length <= 0 && rows.length > 0 ? (
                <td>Total</td>
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
            {/* {pivotRows.length > 0 &&
              pivotRows.map((item, idx) => {
                return (
                  <tr>
                    {item.title && (
                      <th
                        className="px-4 py-1 border-b border-gray-200 dark:border-gray-700 font-medium border-r "
                        key={idx}
                        // rowSpan={item.span}
                      >
                        {item.title}
                      </th>
                    )}
                    {tableValues.length >= pivotRows.length &&
                      tableValues[idx].map((item, idx) => (
                        <td
                          className="px-4 py-1 border-b border-gray-200 dark:border-gray-700 font-medium border-r "
                          key={idx}
                        >
                          {isValidNumber(item)}
                        </td>
                      ))}
                  </tr>
                );
              })} */}

            {/* {console.log(JSON.stringify(flattenRowTree(pivotRows)))} */}

            {flattenedRowTree.length > 0 && flattenedRowTree.map((item,idx) => {
              return (
                <tr>
                  {item.map(x => (
                    <td rowSpan={x.span=== 0 ? 1 : x.span} className="px-4 py-1 border-b border-gray-200 dark:border-gray-700 font-medium border-r ">{x.title}</td>
                  ))}
                  {tableValues.length >= flattenedRowTree.length && tableValues[idx].map((item,idx) => {
                    return (
                      <td className="px-4 py-1 border-b border-gray-200 dark:border-gray-700 font-medium border-r">{isValidNumber(item)}</td>
                    )
                  })}
                </tr>
              )
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
      </div>
    </>
  );
};

export default TableDisplay;
