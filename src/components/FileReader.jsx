import Papa from "papaparse";

const FileReader = ({ setData, setError, setHeaders }) => {
  const getFile = (e) => {
    const file = e.target.files[0];

    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      setError("Select CSV File");

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
          else 
            headers[head] = "string";
        }
        setHeaders(headers);
      },
      error: function (err) {
        setError(err);
      },
    });
  };

  return (
    <>
      <input type="file" onChange={getFile} id="fileGetter" hidden />
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
