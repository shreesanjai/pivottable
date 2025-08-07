import { useEffect, useState } from "react";

import "./App.css";
import FileReader from "./components/FileReader";
import DataViewer from "./components/DataViewer";

function App() {
  const [data, setData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setError("");
    }, 5000);
  }, [error]);

  return (
    <>
      {!data && (
        <div className="w-screen flex items-center">
          <FileReader
            setData={setData}
            setError={setError}
            setHeaders={setHeaders}
          />
        </div>
      )}

      {data && (
        <DataViewer
          data={data}
          headers={headers}
          setData={setData}
          setHeaders={setHeaders}
          setError={setError}
        />
      )}

      {error && <div className="error">{error}</div>}
    </>
  );
}

export default App;
