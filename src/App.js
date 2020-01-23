import React, { Component } from 'react';
import Carrerasel2 from './Carrerasel2.js';

class App extends Component {
  render() {
    const id = this.props.id;
    const isComponent = ( 'undefined' == typeof window.carrerasel2 );
    return (
        <Carrerasel2
        origChildren={this.props.origChildren}
        isComponent={isComponent}
        id={id} />
    );
  }
}

export default App;
