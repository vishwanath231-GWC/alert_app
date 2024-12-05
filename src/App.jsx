import { useState, useEffect } from 'react'
import './App.css'

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
      <div className='text-xl text-center'>Text</div>

        {
          data?.map((item) => (
            <div key={item._id}>
              <div>{item.Location}</div>
            </div>
          ))
        }

    </>
  )
}

export default App
