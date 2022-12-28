import {
  Link,
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import './App.css';

import { SOCIAL_CONTRACT_ADDRESS, abi } from "./constants"
import { Spinner, Navbar, Nav, Button, Container } from 'react-bootstrap'
import {FaPeopleCarry} from 'react-icons/fa';
import Home from './components/Home';
import Profile from './components/Profile';
function App() {
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [contract, setContract] = useState({})

  const Handler = async () => {
    let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0])

    // Setup event listeners for metamask
    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    })
    window.ethereum.on('accountsChanged', async () => {
      setLoading(true)
      Handler()
    })
    // Get provider from Metamask
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    // Get signer
    const signer = provider.getSigner()
    loadContract(signer)
  }
  const loadContract = async (signer) => {

    // Get deployed copy of Social contract
    const contract = new ethers.Contract(SOCIAL_CONTRACT_ADDRESS, abi, signer)
    setContract(contract)
    setLoading(false)
  }
  return (
    <BrowserRouter>
     
     <div className="App">
        <>
          <Navbar expand="lg" bg="dark" variant="dark">
            <Container>
              <Navbar.Brand href="/">
                
                <FaPeopleCarry /> SOCIAL
              </Navbar.Brand>
              <Navbar.Toggle aria-controls="responsive-navbar-nav" />
              <Navbar.Collapse id="responsive-navbar-nav ml-auto" >
                <Nav className="me-auto " >
                  <Nav.Link as={Link} to="/">Home</Nav.Link>
                  <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
                </Nav>
                <Nav>
                  {account ? (
                    <Nav.Link
                      href={`https://etherscan.io/address/${account}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button nav-button btn-sm mx-4">
                      <Button variant="outline-light">
                        {account.slice(0, 5) + '...' + account.slice(38, 42)}
                      </Button>

                    </Nav.Link>
                  ) : (
                    <Button onClick={Handler} variant="outline-light">Connect Wallet</Button>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </>
       
        <div>
        {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
              <Spinner animation="border" style={{ display: 'flex' }} />
              <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={
                <Home contract={contract} account = {account} />
              } />
              <Route path="/profile" element={
                <Profile contract={contract} />
              } />
            </Routes>
          ) }
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
