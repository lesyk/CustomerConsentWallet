import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import NavBar from './NavBar.js';
import ApplyForConcentForm from './ApplyForConcentForm.js';

class App extends Component {
  render() {
    return (
      <div>
        <NavBar />
        <div className="container theme-showcase" role="main">
          <div className="jumbotron">
              <div className="page-header">
                <h3>Welcome to Data Requestor</h3>
              </div>

              <ApplyForConcentForm />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
