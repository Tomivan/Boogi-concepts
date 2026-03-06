import { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
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
                <FaSearch className='search-icon' />
                <input 
                    type='search' 
                    placeholder='Search by brands and products' 
                    className='search-input'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                        <FaTimes onClick={clearSearch} className='fa-times' size={20}/>
                )}
            </div>
            <button type="submit" className='search-button'>Search</button>
        </form>
    );
};

export default Search;