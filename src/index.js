import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

const c2generateUniqueID = () => {
  const uid = '_nlnlnnlnllnnl';
  return uid.replace(/[nl]/g, (c) => {
    switch( c ) {
      case 'n': {
        return Math.floor( Math.random() * 9.99 ).toString();
      }
      case 'l': {
        return String.fromCharCode(97 + Math.floor( Math.random() * 25.99 ) );
      }
    }
  })
}


const placeholderQuery = (window && window.carrerasel2 && window.carrerasel2.containerQuery) ? window.carrerasel2.containerQuery : '.c2_placeholder';
const placeholders = document.querySelectorAll( placeholderQuery );
if ( placeholders.length ) {
  placeholders.forEach( el => {
    const origChildren = el.innerHTML;
    if ( !el.id || !el.id.length ) {
      el.id = c2generateUniqueID();
    }
    ReactDOM.render(<App origChildren={origChildren} id={el.id} />, el);
  });
}
