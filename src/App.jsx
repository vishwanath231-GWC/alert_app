import { useState, useEffect } from 'react'
import './App.css'
import { IoMdRefresh } from "react-icons/io";
import Alert from './assets/images/alert.png';
import solved from './assets/images/solved.png';
import { CgSpinner } from "react-icons/cg";
import L from 'leaflet';
function App() {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [mapModal, setMapModal] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [mapLocation, setMapLocation] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://alert-iot.onrender.com/read');
      const jsonData = await response.json();
      setData(jsonData.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error fetching data:', error);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);


  const refreshBtn = () => {
    fetchData();
  }


  const updateAlert = (id) => {
    setUpdateLoading(true);
    const data = {
      status: "APPROVED"
    }

    fetch(`https://alert-iot.onrender.com/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(() => {
        setUpdateLoading(false);
        setIsModalOpen(false);
        setSelectedAlert(null);
        fetchData()
      })
      .catch(error => {
        setUpdateLoading(false);
        console.error('Error fetching data:', error);
      });
  }

  const handleModal = (data) => {
    setIsModalOpen(true);
    setSelectedAlert(data);
  }

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAlert(null);
  }

  useEffect(() => {

    if (latitude && longitude) {
      
      // Initialize the map
      const map = L.map("map").setView([0, 0], 2);

      // Add base map layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add a draggable marker
      const marker = L.marker([0, 0], { draggable: true }).addTo(map);

      // Set map view and marker position
      const userLatLng = [latitude, longitude];
      map.setView(userLatLng, 13);
      marker.setLatLng(userLatLng);

      // Fetch address details using OpenStreetMap Nominatim API
      fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      )
      .then((response) => response.json())
      .then((data) => {
        const address = data.address;
        setMapLocation(address);
      })
      .catch((error) => console.error("Error fetching address details:", error));

      return () => {
        map.remove();
      };
    }
    
  }, [latitude, longitude]);

  const handleMapModal = (lat, lon) => {
    setMapModal(true);
    setLatitude(lat);
    setLongitude(lon);
  }
  
  const closeMapModal = () => {
    setMapModal(false);
    setLatitude(null);
    setLongitude(null);
  }


  return (
    <div className='relative'>
      <div>
        <div className='flex items-center justify-between bg-[#0d1b2a] px-3 py-4 border-b border-gray-200 shadow-xs'>
          <div className='text-xl font-semibold text-white'>Alerts</div>
          <button type='button' onClick={refreshBtn}>
            <IoMdRefresh className='text-xl text-white' />
          </button>
        </div>
        {
          loading ? <div className='flex items-center justify-center h-[50vh] '> <CgSpinner className='animate-spin mr-2' /> <span className='font-semibold'>Loading...</span></div> : (
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
                    <button 
                      className='w-full bg-white text-black font-medium border border-gray-200 px-2 py-2 text-sm rounded'
                      onClick={() => handleMapModal(item.Latitude, item.Longitude)}
                    >
                      Location Open in Maps
                    </button>            
                    <div className='w-full'>
                      {
                        item.status === "OPEN" && (
                          <button 
                            className='w-full bg-[#e0e1dd] text-black font-medium border border-gray-200 px-2 py-2 text-sm rounded'
                            onClick={() => handleModal(item)}
                          >
                            Update Alert
                          </button> 
                        )
                      } 
                    </div>          
                  </div>
                </div>
              ))
            }
            </div>
          )
        }
      </div>
      {
        selectedAlert && isModalOpen && (
          <div className='absolute top-0 left-0 w-full h-[100vh] bg_shadow'>
            <div className="flex items-center justify-center mt-12">
                <div className="relative p-4 w-full max-w-2xl max-h-full">
                    <div className="relative bg-white rounded shadow">
                        <div className='p-4'>
                          <div className='mb-3'>
                            {
                              selectedAlert.status === "OPEN" ? (
                                <img src={Alert} alt="OPEN" className='w-7 h-7' />
                              ) : (
                                <img src={solved} alt="SOLVED" className='w-7 h-7' />
                              )
                            }
                          </div>
                          <div className='mb-1'><span className='font-semibold'>Location: </span> {selectedAlert.Location}</div>
                          <div><span className='font-semibold'>Date: </span> {selectedAlert.Timestamp}</div>
                        </div>

                      
                        <div className="flex items-center justify-end p-2 border-t border-gray-200 rounded-b">
                          <button type="button" onClick={() => updateAlert(selectedAlert._id)} className="flex items-center text-white bg-[#0d1b2a] font-medium rounded text-sm px-5 py-2.5 text-center">
                            {updateLoading && <CgSpinner className='animate-spin mr-2' />}
                            Approved
                          </button>
                          <button type="button" onClick={closeModal} className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 bg-white rounded border border-gray-200 hover:bg-gray-100 hover:text-blue-700">Cancle</button>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        )
      }
      
      {
        mapModal && (
          <div className='absolute top-0 left-0 w-full h-[100vh] bg_shadow'>
            <div className="flex items-center justify-center mt-12">
                <div className="relative p-4 w-full max-w-2xl max-h-full">
                    <div className="relative bg-white rounded shadow">

                      <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Map
                          </h3>
                      </div>
                     
                      <div id="map" style={{ height: "200px", width: "100%" }}></div>

                      <div className='mt-2 p-4'>
                        {
                          mapLocation && (
                          <div>
                            <div className='font-bold mb-1'>Location Details:</div>
                            {mapLocation?.city && <div className='font-medium'><span className='font-semibold'>City: </span> {mapLocation?.city}</div>}
                            {mapLocation?.city && <div className='font-medium'><span className='font-semibold'>Postcode: </span> {mapLocation?.postcode}</div>}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-end p-2 border-t border-gray-200 rounded-b">
                        <button type="button" onClick={closeMapModal} className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 bg-white rounded border border-gray-200 hover:bg-gray-100 hover:text-blue-700">Close</button>
                      </div>
                    </div>
                </div>
            </div>
          </div>
        )
      }
    </div>
  )
}

export default App
