import { useState } from "react";

import "./App.css";
import FileReader from "./components/FileReader";
import DataViewer from "./components/DataViewer";

function App() {
  const [data, setData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState(null);

  return (
    <>
      {!data && (
        <div className="w-screen flex items-center">
          <FileReader
            setData={setData}
            setHeaders={setHeaders}
            setFileName={setFileName}
          />
        </div>
      )}
      {fileName && (
        <div className="w-fit">
          <div className="text-sm font-semibold rounded-lg bg-[#161414] focus:border-0 mx-5 py-2 text-gray-100 w-fit pr-3 my-2">
            <span className="p-2 bg-gradient-to-br from-[#38383b] to-[#1f1f20] rounded-l-lg border border-gray-700 mr-2">Current File</span>
            {fileName}
          </div>
        </div>
      )}
      {data && (
        <DataViewer
          data={data}
          headers={headers}
          setData={setData}
          setHeaders={setHeaders}
          setFileName={setFileName}
        />
      )}
    </>
  );
}

export default App;
