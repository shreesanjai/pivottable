import { useEffect, useState } from "react";

const Pagination = ({ limit, offset, setLimit, setOffset, totalCount }) => {
  const [totalPage, setTotalPage] = useState(1);

  const decrement = () => {
    if (offset !== 1) setOffset((prev) => prev - 1);
  };

  const increment = () => {
    if (offset < totalPage) setOffset((prev) => prev + 1);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
  };

  useEffect(() => {
    const pageCalc = Math.ceil(totalCount / limit);
    setTotalPage(pageCalc);

    if (offset > pageCalc) setOffset(1);
  }, [limit, offset, totalCount, setOffset]);

  const handleLimitType = (e) => {
    const val = parseInt(e.target.value, 10);

    if (!isNaN(val) && val >= 1 && val <= totalPage) {
      setOffset(val);
    } else {
      setOffset(1);
    }
  };

  return (
    <div className="w-full flex items-baseline justify-between h-auto p-1 font-medium text-sm">
      <select
        name="limit"
        id=""
        className="px-1 h-9 rounded-sm bg-black text-white hover:border-gray-300"
        onChange={handleLimitChange}
        value={limit}
      >
        <option value="10">10 per page</option>
        <option value="50">50 per page</option>
        <option value="100">100 per page</option>
        <option value="500">500 per page</option>
      </select>

      <div className="flex flex-row items-baseline">
        <button onClick={decrement} className="m-1 disabled:cursor-not-allowed">
          {"<"}
        </button>

        <div className="mx-2">
          <input
            type="text"
            onChange={handleLimitType}
            // onChange={(e) => setOffset(Number(e.target.value) || 1)}
            value={offset}
            min={1}
            max={totalPage}
            className="bg-black w-11 text-center p-2 m-1 rounded-lg"
          />
           {" "} of {totalPage}
        </div>

        <button onClick={increment} className="m-1">
          {">"}
        </button>
      </div>

      <div>
        {" "}
        Showing {(offset - 1) * limit + 1} -{" "}
        {Math.min(offset * limit, totalCount)} of {totalCount} data
      </div>
    </div>
  );
};

export default Pagination;
