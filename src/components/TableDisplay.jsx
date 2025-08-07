import React, { useEffect, useMemo, useState } from "react";

import { groupedValue, rowAggregate } from "../utils/calculate";

const TableDisplay = ({ rows, columns, values, data, agg, headers }) => {
  const [tableHeaders, setTableHeaders] = useState([]);
  const [tableRow, setTableRow] = useState([]);

  //const calculus = useMemo(() => rowAggregate(data,rows,agg,values),[data,rows,agg,values])

  useEffect(() => {
    const groupValue = columns.length > 0 ? groupedValue(data, columns) : [];

    const headers = [...(rows || []), ...groupValue, ...(values || [])];

    setTableHeaders(headers);

    const groups = groupedValue(data, rows); 
    const aggs = rowAggregate(data, rows, agg, values); 

    const combined = groups.map((group, i) => ({
      [rows[0]]: group,
      [values[0]]: aggs[i],
    }));


    setTableRow(combined);
  }, [rows, columns, values, data, agg]);

  return (
    <>
      <div>
        {/* {JSON.stringify(tableRow)} */}
        <table className="w-5/6 text-sm md:text-base table-auto bg-white dark:bg-[#1c1c1e] text-gray-900 dark:text-white rounded-xl overflow-hidden shadow-md ring-1 ring-gray-300 dark:ring-gray-700">
          <thead className="bg-gray-100 dark:bg-[#2c2c2e]">
            <tr>
              {tableHeaders &&
                tableHeaders.map((item, idx) => (
                  <th
                    key={idx}
                    className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600"
                  >
                    {item}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {tableRow &&
              tableRow.map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 dark:hover:bg-[#2a2a2e]"
                >
                  <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 font-medium">
                    {item[rows[0]]}
                  </td>
                  {values.length > 0 && (
                    <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      {item[values[0]]}
                    </td>
                  )}
                </tr>
              ))}

            {values.length > 0 && (
              <tr className="bg-gray-100 dark:bg-[#2c2c2e] font-semibold">
                <td className="px-4 py-3 border-t border-gray-300 dark:border-gray-600">
                  Grand Total
                </td>

                <td className="px-4 py-3 border-t border-gray-300 dark:border-gray-600">
                  {tableRow != null
                    ? tableRow
                        .filter((x) => x[values[0]] !== undefined)
                        .reduce((acc, val) => acc + Number(val[values[0]]), 0)
                        .toFixed(2)
                    : " "}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TableDisplay;
