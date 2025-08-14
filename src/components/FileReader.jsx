import Papa from "papaparse";

const FileReader = ({ setData, setHeaders, resetData = () => {} }) => {
  const getFile = (e) => {
    const file = e.target.files[0];

    resetData();

    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      console.error("Select CSV File");

      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (res) {
        setData(res.data);

        const data = res.data[1];

        const headers = {};

        for (let head in data) {
          const value = data[head];

          if (!isNaN(Number(value)) && value !== null && value !== "")
            headers[head] = "number";
          else headers[head] = "string";
        }
        setHeaders(headers);
      },
      error: function (err) {
        console.log(err);
      },
    });
  };

  return (
    <>
      <input
        type="file"
        onChange={getFile}
        accept=".csv"
        id="fileGetter"
        hidden
      />
      <button
        className="input-button"
        onClick={() => document.querySelector("#fileGetter").click()}
      >
        Import CSV
      </button>
    </>
  );
};

export default FileReader;
