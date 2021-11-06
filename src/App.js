import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import {useEffect, useState} from "react";

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const TEST_GIFS = [
    'https://c.tenor.com/mcWNBEZkbsgAAAAC/pepe-frog-middle-finger.gif',
    'https://c.tenor.com/VzjRFZU38sgAAAAC/sad-frog.gif',
    'https://c.tenor.com/-EAS6BXgdJkAAAAC/pepe-pepehand.gif',
    'https://c.tenor.com/XQGRbBAH2-cAAAAM/pepe-pepe-the-clown.gif'
]

const App = () => {

    const [walletAddress, setWalletAddress] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [gifList, setGifList] = useState([]);

    const checkIfWalletIsConnected = async () => {
        try {
            const {solana} = window;
            if (!solana) {
                return alert("solana object not found")
            }

            if (solana.isPhantom) {
                console.log("hello from phantom wallet");
                await _connectWithWallet(solana);
            }
        } catch (e) {
            alert("connection to phantom wallet failed");
            console.error(e);
        }
    }

    const _connectWithWallet = async (solana) => {
        const res = await solana.connect({
            onlyIfTrusted: true
        });

        console.log("Connected with public Key: ", res.publicKey.toString());
        setWalletAddress(res.publicKey.toString());

    }
    const connectWallet = async () => {

        const {solana} = window;
        const res = await solana.connect({
            //  onlyIfTrusted: true
        });

        console.log("Connected with public Key: ", res.publicKey.toString());
        setWalletAddress(res.publicKey.toString());
    };

    const sendGif = async () => {
        if (inputValue.length > 0) {
            console.log('Gif link:', inputValue);
        } else {
            console.log('Empty input. Try again.');
        }
    };

    const renderNotConnectedContainer = () => (
        <button
            className="cta-button connect-wallet-button"
            onClick={connectWallet}
        >
            Connect to Wallet
        </button>
    );

    const renderConnectedContainer = () => (
        <div className="connected-container">
            <input
                type="text"
                placeholder="Enter gif link!"
                value={inputValue}
                onChange={e => {
                    setInputValue(e.target.value)
                }}
            />
            <button className="cta-button submit-gif-button" onClick={sendGif}>Submit</button>
            <div className="gif-grid">
                {gifList.map(gif => (
                    <div className="gif-item" key={gif}>
                        <img src={gif} alt={gif}/>
                    </div>
                ))}
            </div>
        </div>
    );

    useEffect(() => {
        window.addEventListener("load", _ => checkIfWalletIsConnected)
    }, []);

    useEffect(() => {
        if (walletAddress) {
            console.log('Fetching GIF list...');

            // Call Solana program here.

            // Set state
            setGifList(TEST_GIFS);
        }
    }, [walletAddress]);
    return (
        <div className="App">
            <div className="container">
                <div className="header-container">
                    <p className="header">🖼 GIF Portal</p>
                    <p className="sub-text">
                        View your GIF collection in the metaverse ✨
                    </p>
                    {walletAddress ? renderConnectedContainer() : renderNotConnectedContainer()}
                </div>
                <div className="footer-container">
                    <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo}/>
                    <a
                        className="footer-text"
                        href={TWITTER_LINK}
                        target="_blank"
                        rel="noreferrer"
                    >{`built on @${TWITTER_HANDLE}`}</a>
                </div>
            </div>
        </div>
    );
};

export default App;
