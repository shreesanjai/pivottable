export const groupedValue = (data, row) => {
  return [...new Set(data.map((item) => item[row]))];
};

export const rowAggregate = (data, row, agg, values) => {
  const groupValue = groupedValue(data, row);
  switch (agg) {
    case "sum":
      return groupValue.map((item) => 
        // row: item,
        // value: data
        data
          .filter((x) => x[row] === item)
          .reduce((acc, val) => acc + Number(val[values[0]]), 0).toFixed(2)
      );

    case "avg":
      const groupData = groupValue.map((item) => {
        const filterData = data.filter((x) => x[row] === item);
        const sum = filterData.reduce((acc, val) => acc + Number(val[values[0]]),0);
        const avg = filterData.length > 0 ? sum / filterData.length : 0;
        // return {
        // //   row: item,
        //   value: avg,
        // };
        return avg.toFixed(2)
      });
      return groupData;

    case "max":
      return groupValue.map((item) => 
        // row: item,
        // value: data
        data
          .filter((x) => x[row] === item)
          .reduce((acc, val) => {
            return Math.max(acc, Number(val[values[0]]));
          }, 0).toFixed(2),
      );

    case "count":
      return groupValue.map((item) => 
        // row: item,
        // value: data
        data
          .filter((x) => x[row] === item)
          .length
      );

    case "min":
      return groupValue.map((item) => 
        // row: item,
        // value: data
        data
          .filter((x) => x[row] === item)
          .reduce((acc, val) => {
            return Math.min(acc, Number(val[values[0]]));
          }, Infinity).toFixed(2),
      );
  }
};
