import { useState, useEffect } from 'react'
import './App.css'
import { IoMdRefresh } from "react-icons/io";
import Alert from './assets/images/alert.png';
import solved from './assets/images/solved.png';
function App() {

  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetch('https://alert-iot.onrender.com/read')
      .then(response => response.json())
      .then(data => {
        if (data) {
          setData(data?.data);
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);



  return (
    <>
      <div className='flex items-center justify-between bg-[#0d1b2a] px-3 py-4 border-b border-gray-200 shadow-xs'>
        <div className='text-xl font-semibold text-white'>Alerts</div>
        <button>
          <IoMdRefresh className='text-xl text-white' />
        </button>
      </div>
      <div className='mt-5 p-3 grid grid-cols-1 gap-3'>
      {
        data?.map((item) => (
          <div key={item._id} className={ item.status === "OPEN" ? "bg-red-50 relative shadow-sm border border-gray-200 p-4 rounded" : "bg-green-50 relative shadow-sm border border-gray-200 p-4 rounded"}>
            <div className='absolute top-1 right-4 text-xs font-semibold'>{item.Timestamp}</div>
            <div className='flex items-center gap-3'>
            {
              item.status === "OPEN" ? (
                <img src={Alert} alt="OPEN" className='w-7 h-7' />
              ) : (
                <img src={solved} alt="SOLVED" className='w-7 h-7' />
              )
            }
            <div className='font-semibold text-lg'>{item.Location}</div>
            </div>
            <div className='flex items-center gap-3 mt-5'>
               <button className='w-full bg-white text-black font-medium border border-gray-200 text-white px-2 py-2 text-sm rounded'>Location Open in Maps</button>            
               <button className='w-full bg-[#e0e1dd] text-black font-medium border border-gray-200 text-white px-2 py-2 text-sm rounded'>Update Alert</button>            
            </div>
          </div>
        ))
      }
      </div>
    </>
  )
}

export default App
