import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import './search.component.css';

const Search = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch(searchTerm);
    };

    const clearSearch = () => {
        setSearchTerm('');
        onSearch('');
    };

    return (
        <form onSubmit={handleSearch} className='search'>
            <div className="flex search-container">
                <FontAwesomeIcon icon={faSearch} className='search-icon' />
                <input 
                    type='search' 
                    placeholder='Search by brands and products' 
                    className='search-input'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                        <FontAwesomeIcon icon={faTimes}  onClick={clearSearch} className='fa-times'/>
                )}
            </div>
            <button type="submit" className='search-button'>Search</button>
        </form>
    );
};

export default Search;