import React, { useState, useRef } from 'react';
import './Header.css';
import { useNavigate } from 'react-router-dom';

function Header() {


    return (
        <div className="header">

            <div className='navbar'>
                <a href="/home" className='navbar-link'>Home</a>
                <a href="/check" className='navbar-link'>Check Certificate</a>
                <a href="/inheritance" className='navbar-link'>Set inheritance</a>
            </div>
        </div>
    );
}

export default Header;
