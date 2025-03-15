import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import './search.component.css';

const Search = () => {
    return(
        <div className='search'>
            <div className="flex">
                <FontAwesomeIcon icon={faSearch} className='search-icon' />
                <input type='search' placeholder='Search by brands and products' className='search-input' />
            </div>
            <button className='search-button'>Search</button>
        </div>
    )
}

export default Search;