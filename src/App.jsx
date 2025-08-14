import { useState } from "react";

import "./App.css";
import FileReader from "./components/FileReader";
import DataViewer from "./components/DataViewer";

function App() {
  const [data, setData] = useState(null);
  const [headers, setHeaders] = useState([]);

  return (
    <>
      {!data && (
        <div className="w-screen flex items-center">
          <FileReader
            setData={setData}
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
        />
      )}

    </>
  );
}

export default App;
