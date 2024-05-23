import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';



function App() {
  
const [searchTerm, setSearchTerm] = useState('');
const [shoes, setShoes] = useState([]);

useEffect(() => {
  fetch('http://localhost:3001/shoes')
  .then(res => res.json())
  .then(data => {
    setShoes([...shoes, ...data]);
    console.log(data);
    //for commit
  });
}, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <input type="text" className="Retrieve"></input>
        {shoes.map((shoe, index) => (
        <p key={index}>
           {shoe.brand} - {shoe.model} - {shoe.size}
        </p>
      ))}
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
