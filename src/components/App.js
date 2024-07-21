import React, { Component } from 'react';
import logo from '../logo.png';
import './App.css';
import Web3 from 'web3';
import Navbar from './NavBar';
import SocialNetwork from '../abis/SocialNetwork.json';
import Main from './Main';

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      socialNetwork: null,
      postCount: 0,
      posts: [],
      loading: true
    }
    this.createPost = this.createPost.bind(this)
    this.tipPost = this.tipPost.bind(this)
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
        // Request account access if needed
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        // User denied account access...
        console.error("User denied account access");
      }
    } else if (window.web3) { // Legacy dapp browsers...
      window.web3 = new Web3(window.ethereum);
    } else {
      // Non-dapp browsers...
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }
  
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  createPost(content) {
    this.setState({ loading: true })
    this.state.socialNetwork.methods.createPost(content).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  };

  tipPost(id, tipAmount) {
    this.setState({ loading: true })
    this.state.socialNetwork.methods.tipPost(id).send({ from: this.state.account, value: tipAmount })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    console.log(accounts[0])
    // Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = SocialNetwork.networks[5777]
    console.log(networkData)
    if(networkData) {
      const socialNetwork = web3.eth.Contract(SocialNetwork.abi, networkData.address)
      this.setState({ socialNetwork })
      const postCount = await socialNetwork.methods.postCount().call()
      this.setState({ postCount })
      // Load Posts
      for (var i = 1; i <= postCount; i++) {
        const post = await socialNetwork.methods.posts(i).call()
        this.setState({
          posts: [...this.state.posts, post]
        })
      }
      this.setState({ loading: false})
    } else {
      window.alert('SocialNetwork contract not deployed to detected network.')
    }
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { <Main
              posts={this.state.posts}
              createPost={this.createPost}
              tipPost={this.tipPost}
            />
        }
      </div>
    );
  }
}

export default App;
