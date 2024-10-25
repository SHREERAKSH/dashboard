import React,{useState,useEffect}from 'react'
import Papa from 'papaparse';
import './Dashboard.css'
import { Bar, Pie, Line } from 'react-chartjs-2';
import 'chart.js/auto';

function Dashboard() {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  useEffect(() => {
    // Fetch the CSV file
    const fetchData = async () => {
      const response = await fetch('/Electric_Vehicle_Population_Data.csv');
      const reader = response.body.getReader();
      const result = await reader.read();
      const decoder = new TextDecoder('utf-8');
      const csvData = decoder.decode(result.value);

      // Parse CSV data
      Papa.parse(csvData, {
        header: true,
        complete: (results) => {
          setData(results.data);
        //   console.log(results.data)
        },
       
      });
    };

    fetchData();
  }, []);

  const totalVehicles = data.length;
  const avgRange = data.reduce((acc, ev) => acc + Number(ev['Electric Range'] || 0), 0) / totalVehicles;

  // Prepare data for charts (e.g., vehicles by make)
  const makeCounts = data.reduce((acc, ev) => {
    acc[ev.Make] = (acc[ev.Make] || 0) + 1;
    return acc;
  }, {});

  const vehicleTypes = data.reduce((acc, ev) => {
    acc[ev['Electric Vehicle Type']] = (acc[ev['Electric Vehicle Type']] || 0) + 1;
    return acc;
  }, {});

  const rangeByYear = data.reduce((acc, ev) => {
    const year = ev['Model Year'];
  
    // Check if the year is valid and is a number
    if (!year || isNaN(year)) {
      return acc; 
    }
  
    // If the year does not exist in the accumulator, initialize it
    if (!acc[year]) {
      acc[year] = { totalRange: 0, count: 0 };
    }
  
    // Add the electric range to the total range and increment the count
    acc[year].totalRange += Number(ev['Electric Range'] || 0);
    acc[year].count += 1;
  
    return acc;  
  }, {});
  
  const chartData = {
    labels: Object.keys(makeCounts),
    datasets: [
      {
        label: 'Number of Vehicles by Make',
        data: Object.values(makeCounts),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const pieData = {
    labels: Object.keys(vehicleTypes),
    datasets: [
      {
        label: 'Vehicle Types',
        data: Object.values(vehicleTypes),
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)'],
      },
    ],
  };

  const lineData = {
    labels: Object.keys(rangeByYear),
    datasets: [
      {
        label: 'Average Electric Range by Model Year',
        data: Object.values(rangeByYear).map((year) => year.totalRange / year.count),
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false,
        tension: 0.1,
      },
    ],
  };

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentData = data.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(totalVehicles / rowsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <>
    <div  className="container">
        <h1 className="my-4">Electric Vehicle Dashboard</h1>

{/* Display Summary Metrics */}
<div className="summary-metrics">
  <h2>Total Vehicles: {totalVehicles}</h2>
  <h2>Average Electric Range: {avgRange.toFixed(2)} miles</h2>
</div>

{/* Bar Chart: Number of Vehicles by Make */}
<div className="chart-container my-4">
  <h3>Vehicles by Manufacturer</h3>
  <Bar data={chartData} />
</div>
      {/* Pie Chart: Vehicle Types */}
      <div className="chart-container my-4">
        <h3>Vehicle Types</h3>
        <Pie data={pieData} />
      </div>
 {/* Line Chart: Average Electric Range by Model Year */}
 <div className="chart-container my-4">
        <h3>Average Electric Range by Model Year</h3>
        <Line data={lineData} />
      </div>
</div>

    <table className="table">
        <thead>
          <tr>
            <th>VIN</th>
            <th>Make</th>
            <th>Model</th>
            <th>Year</th>
            <th>Range</th>
            <th>City</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((ev, index) => (
            <tr key={index}>
              <td>{ev['VIN (1-10)']}</td>
              <td>{ev.Make}</td>
              <td>{ev.Model}</td>
              <td>{ev['Model Year']}</td>
              <td>{ev['Electric Range']}</td>
              <td>{ev.City}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </>
  );
}

export default Dashboard;
