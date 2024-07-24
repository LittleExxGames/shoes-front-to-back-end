import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';


function App() {

  const [selectedOption, setSelectedOption] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [shoes, setShoes] = useState([]);
  const [formFields, setFormFields] = useState({
    shoeId: '0',
    brand: '',
    model: '',
    size: '',
  });
  const search = [{
    shoeId: 0,
    brand: '',
    model: '',
    size: 0,
  }]

  useEffect(() => {
    //fetch(`http://localhost:3001/shoes?start=${1}&limit=${4}`)
    fetch(`http://localhost:3001/shoes`)
      .then(res => res.json())
      .then(response => {
        //setShoes(shoes => [...shoes, ...data.filter(item => typeof item === 'object')]); // Filters out any non-object items.
        if (response.data) {
          const data = response.data.filter(item => typeof item === 'object');
          setShoes(data);
          if (data.length > 0) {
            setSelectedOption(Object.keys(data[0])[0]);
          }
          console.log(data);
        } else {
          console.log('response.data is undefined');
        }
      })
  }, []);

  const handleSearchButton = () => {
    getData(selectedOption, searchTerm);
  };

  const getData = (type, search) => {
    fetch(`http://localhost:3001/search?${type}=${search}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const shoesData = data.data.map(item => JSON.parse(item));
          setShoes(shoesData);
          console.log(shoesData);
        }
        else {
          console.log(data.message);
          setShoes([]);
        }
      })
  };
  const handleSelectChange = (event) => {
    setSelectedOption(event.target.value);
  };
  const handleSearchTerm = (event) => {
    setSearchTerm(event.target.value);
  };
  const handleInputChange = (event) => {
    const value = event.target.name === 'size' ? Number(event.target.value) : event.target.value;
    console.log(typeof value); 
  setFormFields({
    ...formFields,
    [event.target.name]: value
  });
  }
  const handleFormSubmit = () => {
    const allFieldsFilled = Object.values(formFields).every(value => value !== '');
    console.log(formFields);
    if (!allFieldsFilled) {
      alert('Please fill out all fields');
      return;
    }
    fetch(`http://localhost:3001/shoes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formFields),
    })
      .then(res => res.json())
      .then(data => {
        //setShoes([...shoes, data]);
        console.log(data);
      });
  }
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <input type="text" className="Retrieve" value={searchTerm} onChange={handleSearchTerm}></input>
        <div>
          {search.length > 0 && (
            <select value={selectedOption} onChange={handleSelectChange}>
              {Object.keys(search[0]).map((key, index) => (
                <option key={index} value={key}>{key}</option>
              ))}
            </select>
          )}
        </div>
        <button onClick={handleSearchButton}>Search</button>
        {shoes.length > 0 ? (
          shoes.map((shoe, index) => (
            <p key={index}>
              {shoe.brand} - {shoe.model} - {shoe.size}
            </p>
          ))
        ) : (
          <p>No shoes found</p>
        )}
        <input type="text" name="brand" value={formFields.brand.trim()} onChange={handleInputChange} />
        <input type="text" name="model" value={formFields.model.trim()} onChange={handleInputChange} />
        <select name="size" value={formFields.size} onChange={handleInputChange}>
          {Array.from({ length: 20 }, (_, i) => i + 1).map((value) => (
            <option key={value} value={value}>
              Size: {value}
            </option>
          ))}
        </select>
        <button onClick={handleFormSubmit}>Submit new shoe</button>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
        </a>
      </header>
    </div>
  );
}

export default App;