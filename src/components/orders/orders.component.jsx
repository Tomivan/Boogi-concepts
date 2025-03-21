import React from 'react';
import Perfume from '../../assets/images/perfume.jpg';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import './orders.component.css';

const Orders = () => {
    return(
        <div className="component">
            <div className="orders">
                <h1>Orders</h1>
                <hr />
                <Tabs>
                    <TabList>
                        <Tab>Ongoing/Completed</Tab>
                        <Tab>Canceled/returned</Tab>
                    </TabList>
                    <TabPanel>
                        <div className="order">
                            <div className="item">
                                <img src={Perfume} alt='a bottle of perfume' className='cart-perfume' />
                                <div className="left-detail">
                                    <p>Order 82392390</p>
                                    <p>Antonio Banderas</p>
                                    <p className='delivered'>Delivered</p>
                                    <p> <strong>On 20/03/2025</strong></p>
                                </div>
                            </div>
                            <p className='purple'>See details</p>
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div className="order">
                            <div className="item">
                                <img src={Perfume} alt='a bottle of perfume' className='cart-perfume' />
                                <div className="left-detail">
                                    <p>Order 82392390</p>
                                    <p>Miami Seduction</p>
                                    <p className='delivered'>Delivered</p>
                                    <p> <strong>On 20/03/2025</strong></p>
                                </div>
                            </div>
                            <p className='purple'>See details</p>
                        </div>
                    </TabPanel>
                </Tabs>
            </div>
        </div>
    )
}

export default Orders;