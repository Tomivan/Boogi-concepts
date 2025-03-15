import React from 'react';
import './brand.component.css';

const Brand = () => {
    return(
        <div className='component'>
            <div className="flex">
                <input type='checkbox' className='checkbox'/>
                <p>Antonio Banderas</p>
            </div>
            <div className="flex">
                <input type='checkbox' className='checkbox' />
                <p>Christain Dior</p>
            </div>
            <div className="flex">
                <input type='checkbox' className='checkbox'/>
                <p>Fragrance Avenue</p>
            </div>
            <div className="flex">
                <input type='checkbox' className='checkbox'/>
                <p>Fragrance World</p>
            </div>
            <div className="flex">
                <input type='checkbox' className='checkbox' />
                <p>Hugo Boss</p>
            </div>
        </div>
    )
}

export default Brand;