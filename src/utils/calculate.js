// Get unique group values from the row field
export const groupedValue = (data, row) => {
  return [...new Set(data.map((item) => item[row]))];
};

// Aggregation logic
export const rowAggregate = (items, agg) => {
  switch (agg) {
    case "sum": {
      const sum = items.reduce((acc, val) => acc + Number(val), 0);
      return isNaN(sum) ? items.length : sum;
    }

    case "avg": {
      const sum = items.reduce((acc, val) => acc + Number(val), 0);
      const avg = items.length > 0 ? sum / items.length : 0;
      return isNaN(avg) ? items.length : avg;
    }

    case "max": {
      const max = items.reduce(
        (acc, val) => Math.max(acc, Number(val)),
        -Infinity
      );
      return isNaN(max) ? items.length : max;
    }

    case "min": {
      const min = items.reduce(
        (acc, val) => Math.min(acc, Number(val)),
        Infinity
      );
      return isNaN(min) ? items.length : min;
    }

    case "count": {
      return items.length;
    }
    default:
      return null;
  }
};

export const rowWiseAggregation = (arr, step = 1, agg) => {
  if (!Array.isArray(arr) || arr.length === 0) return [];
  if (!step || step <= 0) {
    console.error("Invalid step value:", step);
    return [];
  }

  console.log(arr);

  const result = Array.from({ length: step }, () => []);
  const res = [];

  if (!arr) return;

  arr.map((value, index) => {
    const groupIndex = index % step;
    result[groupIndex].push(value);
  });

  for (var i = 0; i < result.length; i++) {
    console.log(result[i]);
    
    res.push(rowAggregate(result[i], agg === "count" ? "sum" : agg));
  }

  console.log(res);

  return res;
};

export const columnWiseAggregation = (values, agg) => {
  if (!values.length) return [];

  const colLength = values[0].length;
  const aggregateRow = [];

  for (let i = 0; i < colLength; i++) {
    const colValues = values.map((row) => row[i]);
    aggregateRow.push(rowAggregate(colValues, agg));
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
          : 0;

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
        while (i < newPath.length && i < lastPath.length && newPath[i].title === lastPath[i].title) {
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
  return Number(item) === 0.0 ||
    item === Infinity ||
    item == -Infinity ||
    isNaN(item)
    ? ""
    : item % 1 !== 0
    ? item.toFixed(2)
    : item.toString();
};


