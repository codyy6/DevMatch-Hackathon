import React, { useState } from 'react';
import axios from 'axios'; // Import axios for making HTTP requests
import { AnyPublicKey } from '@aptos-labs/ts-sdk';
import { Header } from 'antd/es/layout/layout';
import Navbar from '../../components/Header/Header';
const API_URL = "https://service-testnet.maschain.com";
const client_id = "2f865b0086add601eb6788d6a5e50d68a8abf8cf9607c9239669f5b1a529d14c";
const client_secret = "sk_f7f377c5c2e1d3d795265fbde212f0276bd0509aba86178236c34ae7f9dcda08";

const from = "0x63A240cC61Ca328A5FD082E332e9495cb9c07DB5";
const contract_address = "0xa8fef73A9E3b3cfc5506c00aAcC6b35f8242aDeC";
const status = "success";

async function getCertificate(from, contractAddress, status) {
    const to = prompt('Enter the recipient wallet address:'); 
    try {
      const response = await axios.get(`${API_URL}/api/certificate/get-certificate`, {
        params: {
          from,
          to,
          contractAddress,
          status
        },
        headers: {
          "client_id": client_id,
          "client_secret": client_secret,
          "content-type": "application/json"
        }
      });
      console.log('Certificate details:', response.data.result);
    } catch (error) {
      console.error('Error fetching certificate details:', error.response ? error.response.data : error.message);
    }
  }

function CheckCertificate() {
    return (
        <div>
            <Navbar />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
     
      <ul>
       
        <button onClick={() => getCertificate(from, contract_address, status)}>Check Certificate</button>
      </ul>
    </div>
        </div>
    );

}

export default CheckCertificate;