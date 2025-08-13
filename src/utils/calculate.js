// Get unique group values from the row field
export const groupedValue = (data, row) => {
  return [...new Set(data.map((item) => item[row]))];
};

export const rowAggregate = (items, agg) => {
  const sum = items.reduce((acc, val) => acc + Number(val), 0);
  const count = items.length;
  switch (agg) {
    case "sum": {
      return {
        value: isNaN(sum) ? count : sum,
        sum: sum,
        length: count,
      };
    }

    case "avg": {
      return {
        value: isNaN(sum / count) ? sum : sum / count,
        sum: sum,
        length: count,
      };
    }

    case "max": {
      const max = items.reduce(
        (acc, val) => Math.max(acc, Number(val)),
        -Infinity
      );
      return {
        value: max,
        sum: sum,
        length: count,
      };
    }

    case "min": {
      const min = items.reduce(
        (acc, val) => Math.min(acc, Number(val)),
        Infinity
      );
      return {
        value: min,
        sum: sum,
        length: count,
      };
    }

    case "count": {
      return {
        value: count,
        sum: sum,
        length: count,
      };
    }
    default:
      return null;
  }
};

export const rowWiseAggregation = (arr, step = 1, agg) => {
  if (arr.length === 0) return [];
  if (!step || step <= 0) {
    //console.error("Invalid step value:", step);
    return [];
  }

  const result = Array.from({ length: step }, () => []);
  const res = [];

  if (!arr) return;

  function forNotAverage() {
    arr.map((value, index) => {
      const groupIndex = index % step;
      result[groupIndex].push(value.value);
    });
    for (var i = 0; i < result.length; i++) {
      res.push(rowAggregate(result[i], agg === "count" ? "sum" : agg));
    }
  }

  if (agg !== "avg") forNotAverage();
  else {
    const summation = Array.from({ length: step }, () => []);
    const totalCount = Array.from({ length: step }, () => []);
    arr.map((value, index) => {
      const groupIndex = index % step;
      summation[groupIndex].push(value.sum);
    });

    arr.map((value, index) => {
      const groupIndex = index % step;
      totalCount[groupIndex].push(value.length);
    });

    for (var i = 0; i < result.length; i++) {
      res.push({
        value:
          rowAggregate(summation[i], "sum").value /
          rowAggregate(totalCount[i], "sum").value,
        sum: rowAggregate(summation[i], "sum").value,
        length: rowAggregate(totalCount[i], "sum").value,
      });
    }
  }
  //console.log(res);

  return res;
};

export const columnWiseAggregation = (values, agg) => {
  if (!values.length) return [];

  const colLength = values[0].length;
  const aggregateRow = [];

  if (agg !== "avg") {
    for (let i = 0; i < colLength; i++) {
      const colValues = values.map((row) => row[i].value);
      aggregateRow.push(rowAggregate(colValues, agg));
    }
  } else {
    for (let i = 0; i < colLength; i++) {
      const summation = rowAggregate(
        values.map((row) => row[i].sum),
        "sum"
      ).sum;
      const totalCount = rowAggregate(
        values.map((row) => row[i].length),
        "sum"
      ).value;

      aggregateRow.push({
        value: summation / totalCount,
        sum: summation,
        length: totalCount,
      });
    }
  }

  return aggregateRow;
};

export const buildTree = (
  data,
  fields,
  values = [],
  includeValuesAtLeaf = false
) => {
  const build = (level, parentData) => {
    const key = fields[level];
    const distinctValues = groupedValue(parentData, key).sort();

    return distinctValues.map((value) => {
      let children = [];

      if (level + 1 < fields.length) {
        const filtered = parentData.filter((item) => item[key] === value);
        children = build(level + 1, filtered);
      } else if (includeValuesAtLeaf) {
        children = values.map((v) => ({ title: v, children: [], span: 0 }));
      }

      const span =
        children.length > 0
          ? children.reduce(
              (sum, child) => sum + child.span + (child.span === 0 ? 1 : 0),
              0
            )
          : 1;

      return {
        title: value,
        children,
        span,
      };
    });
  };

  return build(0, data);
};

export const flattenTree = (nodes, path = []) => {
  return nodes.flatMap((node) => {
    const currentPath = [...path, node.title];
    return node.children.length
      ? flattenTree(node.children, currentPath)
      : [currentPath.join("|")];
  });
};

export const flattenRowTree = (data) => {
  const result = [];
  let lastPath = [];

  function traverse(nodes, path = []) {
    for (const node of nodes) {
      const newPath = [...path, { title: node.title, span: node.span }];

      if (node.children && node.children.length > 0) {
        traverse(node.children, newPath);
      } else {
        let i = 0;
        while (
          i < newPath.length &&
          i < lastPath.length &&
          newPath[i].title === lastPath[i].title
        ) {
          i++;
        }
        result.push(newPath.slice(i));
        lastPath = newPath;
      }
    }
  }

  traverse(data);
  return result;
};

export const isValidNumber = (item) => {
  return Number(item.value) === 0.0 ||
    item.value === Infinity ||
    item.value == -Infinity ||
    isNaN(item.value)
    ? ""
    : item.value % 1 !== 0
    ? item.value.toFixed(3)
    : item.value.toString();
};

export const headerWord = (item) => {
  switch(item)
  {
    case "sum":
      return "Sum Of ";
    case "avg":
      return "Average Of "
    case "count":
      return "Count Of "
    case "max":
      return "Maximum Of "
    case "min":
      return "Minimum Of "
  }
}
