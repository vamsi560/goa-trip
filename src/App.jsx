import { useState, useRef } from 'react';
import './App.css';
import { authenticate, uploadFileToDrive } from './GoogleDriveService';

const TABS = [
  { label: 'Dashboard', key: 'dashboard', emoji: '📋' },
  { label: 'Itinerary', key: 'itinerary', emoji: '🗺️' },
  { label: 'Expenses', key: 'expenses', emoji: '💸' },
  { label: 'Uploads', key: 'uploads', emoji: '📂' },
];

const FRIENDS = [
  { name: 'You', avatar: '🧑' },
  { name: 'Friend 1', avatar: '👩' },
  { name: 'Friend 2', avatar: '🧑‍🦱' },
  { name: 'Friend 3', avatar: '👨' },
];

const ITINERARY_DETAILS = [
  {
    day: 'Day 1 (17th Oct)',
    activities: [
      {
        name: 'Arrive in Goa, pick up bikes',
        desc: 'Land at Goa, pick up your rental bikes at Galaxy GoBikes near Dabolim Airport.',
        map: 'https://goo.gl/maps/2Qh8Jv6Qw2vQw6Qy7',
      },
      {
        name: 'Check-in at Mushrooms hotel',
        desc: 'Settle into Mushrooms hotel, freshen up and relax.',
        map: 'https://goo.gl/maps/8Qw2vQw6Qy72Qh8Jv6',
      },
      {
        name: 'Relax or visit Bogmalo Beach',
        desc: 'Enjoy the sunset at Bogmalo Beach, a quiet spot near the airport.',
        map: 'https://goo.gl/maps/3Qh8Jv6Qw2vQw6Qy7',
      },
    ],
  },
  {
    day: 'Day 2 (18th Oct)',
    activities: [
      {
        name: 'Visit Old Goa (Basilica of Bom Jesus, Se Cathedral)',
        desc: 'Explore the UNESCO World Heritage churches in Old Goa.',
        map: 'https://goo.gl/maps/4Qh8Jv6Qw2vQw6Qy7',
      },
      {
        name: 'Lunch at Goan restaurant',
        desc: 'Try authentic Goan cuisine at a local restaurant.',
        map: 'https://goo.gl/maps/5Qh8Jv6Qw2vQw6Qy7',
      },
      {
        name: 'Explore Panaji, Miramar Beach, Dona Paula',
        desc: 'Stroll through Panaji, visit Miramar Beach and Dona Paula viewpoint.',
        map: 'https://goo.gl/maps/6Qh8Jv6Qw2vQw6Qy7',
      },
    ],
  },
  {
    day: 'Day 3 (19th Oct)',
    activities: [
      {
        name: 'North Goa beaches (Calangute, Baga, Anjuna)',
        desc: 'Enjoy water sports and beach shacks at Calangute, Baga, and Anjuna.',
        map: 'https://goo.gl/maps/7Qh8Jv6Qw2vQw6Qy7',
      },
      {
        name: 'Visit Fort Aguada',
        desc: 'Explore the historic Fort Aguada overlooking the Arabian Sea.',
        map: 'https://goo.gl/maps/8Qh8Jv6Qw2vQw6Qy7',
      },
      {
        name: 'Anjuna Flea Market, beach shacks',
        desc: 'Shop at Anjuna Flea Market and chill at beach shacks.',
        map: 'https://goo.gl/maps/9Qh8Jv6Qw2vQw6Qy7',
      },
    ],
  },
  {
    day: 'Day 4 (20th Oct)',
    activities: [
      {
        name: 'Relax or visit Colva Beach',
        desc: 'Spend your last morning at Colva Beach in South Goa.',
        map: 'https://goo.gl/maps/10Qh8Jv6Qw2vQw6Qy7',
      },
      {
        name: 'Shopping/café hopping',
        desc: 'Do some last-minute shopping or visit a local café.',
        map: 'https://goo.gl/maps/11Qh8Jv6Qw2vQw6Qy7',
      },
      {
        name: 'Return bikes, depart',
        desc: 'Return your bikes and head to the airport for departure.',
        map: 'https://goo.gl/maps/2Qh8Jv6Qw2vQw6Qy7',
      },
    ],
  },
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef([]);
  const [expandedDay, setExpandedDay] = useState(null);
  const [expandedActivity, setExpandedActivity] = useState({ dayIdx: null, actIdx: null });

  // Confetti trigger on tab change
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1800);
  };

  // Generate confetti emojis
  const confettiEmojis = ['🎉', '🥳', '🍾', '🎊', '🌴', '🍹'];

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

  // Tab content renderers
  const renderDashboard = () => (
    <section className="trip-details fade-in">
      <h2>Trip Details</h2>
      <div className="avatars">
        {FRIENDS.map(f => (
          <span key={f.name} className="avatar" title={f.name}>{f.avatar}</span>
        ))}
      </div>
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
  );

  const renderItinerary = () => (
    <section className="itinerary fade-in">
      <h2>Itinerary <span role="img" aria-label="map">🗺️</span></h2>
      {ITINERARY_DETAILS.map((day, dayIdx) => (
        <div key={dayIdx} className="itinerary-day" onClick={() => setExpandedDay(dayIdx === expandedDay ? null : dayIdx)}>
          <h3>{day.day}</h3>
          <ul>
            {day.activities.map((activity, actIdx) => (
              <li key={actIdx} style={{cursor:'pointer'}} onClick={e => {e.stopPropagation(); setExpandedActivity({ dayIdx, actIdx: actIdx === expandedActivity.actIdx && dayIdx === expandedActivity.dayIdx ? null : actIdx });}}>
                {activity.name}
                {expandedActivity.dayIdx === dayIdx && expandedActivity.actIdx === actIdx && (
                  <div className="activity-detail">
                    <p>{activity.desc}</p>
                    <a href={activity.map} target="_blank" rel="noopener noreferrer">Google Maps Direction</a>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );

  const renderExpenses = () => (
    <section className="expense-tracker fade-in">
      <h2>Expense Tracker <span role="img" aria-label="money">💸</span></h2>
      <div className="avatars">
        {FRIENDS.map(f => (
          <span key={f.name} className="avatar" title={f.name}>{f.avatar}</span>
        ))}
      </div>
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
  );

  const renderUploads = () => (
    <section className="hotel-upload fade-in">
      <h2>Hotel/Booking PDF Upload <span role="img" aria-label="folder">📂</span></h2>
      <p>Upload your PDF files directly to <a href="https://drive.google.com/drive/folders/1ZGPtye_iiqb3lNoIyt9HRejFpxHkXC6x" target="_blank" rel="noopener noreferrer">Google Drive Goa Trip Folder</a>.</p>
      <iframe
        src="https://drive.google.com/embeddedfolderview?id=1ZGPtye_iiqb3lNoIyt9HRejFpxHkXC6x#grid"
        style={{ width: '100%', height: '400px', border: 'none', marginTop: '1rem', borderRadius: '12px' }}
        title="Goa Trip Files"
      ></iframe>
    </section>
  );

  return (
    <div className="container animated-bg">
      <header className="fun-header">
        <h1>
          <span role="img" aria-label="glass">🥂</span> Glassmates Goa Trip <span role="img" aria-label="beach">🏖️</span>
        </h1>
        <nav className="tabs">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? 'active' : ''}
              onClick={() => handleTabChange(tab.key)}
            >
              <span style={{fontSize: '1.2em', marginRight: '0.3em'}}>{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </header>
      <main>
        <div className={`tab-content${showConfetti ? ' hide' : ''}`}>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'itinerary' && renderItinerary()}
          {activeTab === 'expenses' && renderExpenses()}
          {activeTab === 'uploads' && renderUploads()}
        </div>
        {showConfetti && confettiEmojis.map((emoji, i) => (
          <span
            key={i}
            className="confetti"
            style={{ left: `${40 + i * 8}%`, animationDelay: `${i * 0.2}s` }}
            ref={el => confettiRef.current[i] = el}
          >
            {emoji}
          </span>
        ))}
      </main>
    </div>
  );
}

export default App;
