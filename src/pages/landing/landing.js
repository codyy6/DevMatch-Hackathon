import React, { useState } from 'react';
import axios from 'axios'; // Import axios for making HTTP requests

const API_URL = "https://service-testnet.maschain.com";
const client_id = "2f865b0086add601eb6788d6a5e50d68a8abf8cf9607c9239669f5b1a529d14c";
const client_secret = "sk_f7f377c5c2e1d3d795265fbde212f0276bd0509aba86178236c34ae7f9dcda08";

async function createSmartContract() {
    try {
        const response = await axios.post(`${API_URL}/api/certificate/create-smartcontract`, {
            "wallet_address": "0x63A240cC61Ca328A5FD082E332e9495cb9c07DB5", // Organisation wallet address
            "name": "Testing", // Contract nickname
            "field": {
                "wallet_address_owner": "0x63A240cC61Ca328A5FD082E332e9495cb9c07DB5", // Owner of the Certificate contract
                "max_supply": 1000, // Maximum supply of certificates
                "name": "Testing", // Name of the certificate
                "symbol": "T1" // Certificate Symbol
            },
            // "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...", // Optional image in base64 format
            // "callback_url": "https://your-callback-url.com" // Optional callback URL
        }, {
            headers: {
                "client_id": client_id,
                "client_secret": client_secret,
                "content-type": "application/json"
            }
        });

        // Check if response and response.data are defined
        if (response && response.data && response.data.result) {
            console.log('Smart contract created:', response.data.result);
            return response.data.result.transactionHash;
        } else {
            throw new Error('Unexpected API response format');
        }

    } catch (error) {
        console.error('Error creating smart contract:', error.response ? error.response.data : error.message);
    }
}

async function mintCertificate(toWalletAddress) {
    try {
        const formData = new FormData();
        formData.append('wallet_address', '0x63A240cC61Ca328A5FD082E332e9495cb9c07DB5'); // Organisation wallet address
        formData.append('to', toWalletAddress);
        formData.append('contract_address', '0xa8fef73A9E3b3cfc5506c00aAcC6b35f8242aDeC');
        formData.append('file', new File([''], 'certificate.jpg')); // Replace with actual file input
        formData.append('name', 'NFT CERT');
        formData.append('description', 'NFT CERT');
        // Optional attributes
        formData.append('attributes', JSON.stringify([{ "trait": "New Cert", "value": "10001" }, { "Student": "yes", "value": "Chan" }]));
        formData.append('callback_url', 'http://localhost:3000/');
        const response = await axios.post(`${API_URL}/api/certificate/mint-certificate`, formData, {
            headers: {
                "client_id": client_id,
                "client_secret": client_secret,
                "content-type": "multipart/form-data"
            }
        });

        console.log('Certificate minted:', response.data.result);
    } catch (error) {
        console.error('Error minting certificate:', error.response ? error.response.data : error.message);
    }
}

function Landing() {
  const [smartContracts, setSmartContracts] = useState([]);
  const [error, setError] = useState(null);

  const handleCreateClick = async () => {
    try {
      const transactionHash = await createSmartContract();
      console.log('Transaction Hash:', transactionHash);
    } catch (error) {
      console.error('Error creating smart contract:', error);
    }
  };

  const handleFetchClick = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/certificate/get-smart-contract`, {
        headers: {
          'client_id': client_id,
          'client_secret': client_secret,
          'content-type': 'application/json'
        }
      });
      setSmartContracts(response.data.result);
    } catch (error) {
      setError(error);
      console.error('Error fetching smart contracts:', error);
    }
  };

  const handleMintClick = () => {
    const toWalletAddress = prompt('Enter the recipient wallet address:');
    if (toWalletAddress) {
      mintCertificate(toWalletAddress);
    }
  };

  return (
    <div>
      <button onClick={handleCreateClick}>Create Smart Contract</button>
      <button onClick={handleFetchClick}>Fetch Smart Contracts</button>
      {error && <p>Error: {error.message}</p>}
      <ul>
        {/* {smartContracts.map(contract => (
          <li key={contract.transactionHash}>
            Transaction Hash: {contract.transactionHash}<br /> */}
            {/* Contract Address: {contract.contract_address}<br /> */}
            <button onClick={() => handleMintClick()}>Mint Certificate</button>
          {/* </li>
        ))} */}
      </ul>
    </div>
  );
}

export default Landing;
