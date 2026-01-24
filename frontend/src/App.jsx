import React from "react"
import {
  BrowserRouter as Router, Routes, Route, Navigate, 
} from "react-router-dom";
import { Toaster } from "react-hot-toast"

function App() {

  return (
    <>
     <div className="">

      
      <Toaster
        toastOptions={{
          className: "",
          style: {
            fontSize: "13px"
          }
        }}
      />
     </div>
    </>
  )
}

export default App
