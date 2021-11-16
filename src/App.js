import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import {useEffect, useState} from "react";
import {clusterApiUrl, Connection, PublicKey} from "@solana/web3.js";
import {Program, Provider, web3} from "@project-serum/anchor";

import idl from './idl.json';
import kp from './keypair.json'

// Constants
const TWITTER_HANDLE = 'alex_plutta';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const {SystemProgram, Keypair} = web3;

const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

const programID = new PublicKey(idl.metadata.address);


const getProvider = () => {

    const network = clusterApiUrl('devnet');

    const connection = new Connection(network, "processed");
    const provider = new Provider(
        connection, window.solana, "processed",
    );
    return provider;
}


const App = () => {

    const [walletAddress, setWalletAddress] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [gifList, setGifList] = useState([]);

    useEffect(() => {
        if (walletAddress) {
            console.log('Fetching GIF list...');
            getGifList()
        }
    }, [walletAddress]);

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
        if (inputValue.length === 0) {
            console.log("No gif link given!")
            return
        }
        console.log('Gif link:', inputValue);
        try {
            const provider = getProvider();
            const program = new Program(idl, programID, provider);

            await program.rpc.addGif(inputValue, {
                accounts: {
                    baseAccount: baseAccount.publicKey,
                },
            });
            console.log("GIF successfully sent to program", inputValue)

            await getGifList();
        } catch (error) {
            console.log("Error sending GIF:", error)
        }
    };
    const getGifList = async () => {
        try {
            const provider = getProvider();
            const program = new Program(idl, programID, provider);
            const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

            console.log("Got the account", account)
            setGifList(account.gifList)

        } catch (error) {
            console.log("Error in getGifs: ", error)
            setGifList(null);
        }
    }



    const createGifAccount = async () => {
        try {
            const provider = getProvider();
            const program = new Program(idl, programID, provider);
            console.log("ping")
            await program.rpc.initialize({
                accounts: {
                    baseAccount: baseAccount.publicKey,
                    user: provider.wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                },
                signers: [baseAccount]
            });
            console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
            await getGifList();

        } catch (error) {
            console.log("Error creating BaseAccount account:", error)
        }
    }
    const renderNotConnectedContainer = () => (
        <button
            className="cta-button connect-wallet-button"
            onClick={connectWallet}
        >
            Connect to Wallet
        </button>
    );

    const renderConnectedContainer = () => {
        // If we hit this, it means the program account hasn't be initialized.
        if (gifList === null) {
            return (
                <div className="connected-container">
                    <button className="cta-button submit-gif-button" onClick={createGifAccount}>
                        Do One-Time Initialization For GIF Program Account
                    </button>
                </div>
            )
        }
        // Otherwise, we're good! Account exists. User can submit GIFs.
        else {
            return (
                <div className="connected-container">
                    <input
                        type="text"
                        placeholder="Enter gif link!"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                    />
                    <button className="cta-button submit-gif-button" onClick={sendGif}>
                        Submit
                    </button>
                    <div className="gif-grid">
                        {/* We use index as the key instead, also, the src is now item.gifLink */}
                        {gifList.map((item, index) => (
                            <div className="gif-item" key={index}>
                                <img src={item.gifLink}/>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
    }

    useEffect(() => {
        window.addEventListener("load", _ => checkIfWalletIsConnected)
    }, []);


    return (
        <div className="App">
            <div className="container">
                <div className="header-container">
                    <p className="header">Pepes Place</p>
                    <p className="sub-text">
                       Hello fren, send ur favorite pepe
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
