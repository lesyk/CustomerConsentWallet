import React, { Component } from 'react';

class NavBar extends React.Component {
  render() {
    
    return (
      <nav className="navbar navbar-inverse navbar-fixed-top">
        <div className="container">
          <div id="navbar" className="navbar-collapse collapse">
            <ul className="nav navbar-nav">
              <li><a href="/">Home</a></li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
}

export default NavBar;