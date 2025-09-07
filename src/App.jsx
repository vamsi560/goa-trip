import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { authenticate, uploadFileToDrive } from './GoogleDriveService'

function App() {
  // Trip details
  const tripDetails = {
    flights: [
      {
        from: 'Hyderabad',
        to: 'Goa',
        date: '17th October',
        time: '17:00 - 18:15',
        airline: 'IndiGo',
        flightNo: '6E-6974',
      },
      {
        from: 'Goa',
        to: 'Hyderabad',
        date: '20th October',
        time: '21:40 - 22:55',
        airline: 'Air India',
        flightNo: 'IX-2938',
      },
    ],
    hotel: {
      name: 'Mushrooms',
      cost: '11,450 INR (3 Nights)',
    },
    bikeRental: {
      name: 'Galaxy GoBikes',
      location: 'Near Daoblim Airport',
    },
  };

  // Sample itinerary
  const itinerary = [
    {
      day: 'Day 1 (17th Oct)',
      activities: [
        'Arrive in Goa, pick up bikes',
        'Check-in at Mushrooms hotel',
        'Relax or visit Bogmalo Beach',
      ],
    },
    {
      day: 'Day 2 (18th Oct)',
      activities: [
        'Visit Old Goa (Basilica of Bom Jesus, Se Cathedral)',
        'Lunch at Goan restaurant',
        'Explore Panaji, Miramar Beach, Dona Paula',
      ],
    },
    {
      day: 'Day 3 (19th Oct)',
      activities: [
        'North Goa beaches (Calangute, Baga, Anjuna)',
        'Water sports',
        'Visit Fort Aguada',
        'Anjuna Flea Market, beach shacks',
      ],
    },
    {
      day: 'Day 4 (20th Oct)',
      activities: [
        'Relax or visit Colva Beach',
        'Shopping/café hopping',
        'Return bikes, depart',
      ],
    },
  ];

  // Expense Tracker State
  const [expenses, setExpenses] = useState([]);
  const [expenseInput, setExpenseInput] = useState({ desc: '', amount: '', paidBy: '', splitWith: '' });

  // Handle expense add
  const addExpense = (e) => {
    e.preventDefault();
    if (!expenseInput.desc || !expenseInput.amount || !expenseInput.paidBy || !expenseInput.splitWith) return;
    setExpenses([
      ...expenses,
      { ...expenseInput, amount: parseFloat(expenseInput.amount) }
    ]);
    setExpenseInput({ desc: '', amount: '', paidBy: '', splitWith: '' });
  };

  // Calculate split
  const getSplitSummary = () => {
    const summary = {};
    expenses.forEach(exp => {
      const splitters = exp.splitWith.split(',').map(s => s.trim());
      const splitAmount = exp.amount / splitters.length;
      splitters.forEach(person => {
        if (!summary[person]) summary[person] = 0;
        summary[person] += splitAmount;
      });
      if (!summary[exp.paidBy]) summary[exp.paidBy] = 0;
      summary[exp.paidBy] -= exp.amount;
    });
    return summary;
  };

  // File upload state
  const [hotelFile, setHotelFile] = useState(null);
  const [hotelFileName, setHotelFileName] = useState('');

  // Handle hotel PDF upload
  const handleHotelFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setHotelFile(file);
      setHotelFileName(file.name);
    } else {
      setHotelFile(null);
      setHotelFileName('');
      alert('Please upload a PDF file.');
    }
  };

  // Google Drive upload handler
  const handleDriveUpload = async () => {
    if (!hotelFile) {
      alert('Please select a PDF file first.');
      return;
    }
    try {
      const accessToken = await authenticate();
      const result = await uploadFileToDrive(accessToken, hotelFile);
      alert('Uploaded to Google Drive! File ID: ' + result.id);
    } catch (err) {
      alert('Google Drive upload failed: ' + err);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Goa Trip Dashboard</h1>
      </header>
      <section className="trip-details">
        <h2>Trip Details</h2>
        <div>
          <h3>Flights</h3>
          <ul>
            {tripDetails.flights.map((flight, idx) => (
              <li key={idx}>
                {flight.from} to {flight.to} ({flight.date}, {flight.time})<br />
                {flight.airline} Flight No: {flight.flightNo}
              </li>
            ))}
          </ul>
          <h3>Hotel</h3>
          <p>{tripDetails.hotel.name} - {tripDetails.hotel.cost}</p>
          <h3>Bike Rental</h3>
          <p>{tripDetails.bikeRental.name} - {tripDetails.bikeRental.location}</p>
        </div>
      </section>
      <section className="itinerary">
        <h2>Itinerary</h2>
        {itinerary.map((day, idx) => (
          <div key={idx} className="itinerary-day">
            <h3>{day.day}</h3>
            <ul>
              {day.activities.map((activity, i) => (
                <li key={i}>{activity}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      {/* Expense Tracker */}
      <section className="expense-tracker">
        <h2>Expense Tracker</h2>
        <form onSubmit={addExpense} className="expense-form">
          <input
            type="text"
            placeholder="Description"
            value={expenseInput.desc}
            onChange={e => setExpenseInput({ ...expenseInput, desc: e.target.value })}
          />
          <input
            type="number"
            placeholder="Amount"
            value={expenseInput.amount}
            onChange={e => setExpenseInput({ ...expenseInput, amount: e.target.value })}
          />
          <input
            type="text"
            placeholder="Paid By (Name)"
            value={expenseInput.paidBy}
            onChange={e => setExpenseInput({ ...expenseInput, paidBy: e.target.value })}
          />
          <input
            type="text"
            placeholder="Split With (comma separated names)"
            value={expenseInput.splitWith}
            onChange={e => setExpenseInput({ ...expenseInput, splitWith: e.target.value })}
          />
          <button type="submit">Add Expense</button>
        </form>
        <ul>
          {expenses.map((exp, idx) => (
            <li key={idx}>
              {exp.desc}: ₹{exp.amount} paid by {exp.paidBy}, split with {exp.splitWith}
            </li>
          ))}
        </ul>
        <h3>Split Summary</h3>
        <ul>
          {Object.entries(getSplitSummary()).map(([person, amt], idx) => (
            <li key={idx}>{person}: ₹{amt.toFixed(2)}</li>
          ))}
        </ul>
      </section>
      {/* Hotel/Booking PDF Upload */}
      <section className="hotel-upload">
        <h2>Hotel/Booking PDF Upload</h2>
        <p>Upload your PDF files directly to <a href="https://drive.google.com/drive/folders/1ZGPtye_iiqb3lNoIyt9HRejFpxHkXC6x" target="_blank" rel="noopener noreferrer">Google Drive Goa Trip Folder</a>.</p>
        <iframe
          src="https://drive.google.com/embeddedfolderview?id=1ZGPtye_iiqb3lNoIyt9HRejFpxHkXC6x#grid"
          style={{ width: '100%', height: '400px', border: 'none', marginTop: '1rem' }}
          title="Goa Trip Files"
        ></iframe>
      </section>
    </div>
  );
}

export default App
