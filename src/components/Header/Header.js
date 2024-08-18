import React, { useState, useRef } from 'react';
import './Header.css';
import { useNavigate } from 'react-router-dom';

function Header() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const formatAccount = (account) => {
        if (!account) return '';
        return `${account.slice(0, 4)}.......${account.slice(-4)}`;
    };

    const dropdown = () => {
        setIsDropdownOpen(!(isDropdownOpen));
    };

    const disconnect = () => {
        setIsDropdownOpen(!(isDropdownOpen));
        navigate('/?disconnected=true');
    };

    const home = () => {
        navigate('/home');
    };

    return (
        <div className="header">

            <div className='navbar'>
                <a href="/home" className='navbar-link'>Home</a>
                <a href="/about" className='navbar-link'>About Us</a>
            </div>
        </div>
    );
}

export default Header;
