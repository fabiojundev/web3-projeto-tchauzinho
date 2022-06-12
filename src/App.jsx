import React, { useEffect, useReducer, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";

export default function App() {

  const [currentAccount, setCurrentAccount] = useState("");

  const [allWaves, setAllWaves] = useState([]);

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const contractAddress = "0x55370D49C8b46dba158F477EF22F400831eF5E2a";

  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Garanta que possua a Metamask instalada!");
        return;
      } else {
        console.log("Temos o objeto ethereum", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Encontrada a conta autorizada:", account);
        setCurrentAccount(account);
        getAllWaves();

      } else {
        console.log("Nenhuma conta autorizada foi encontrada")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implemente aqui o seu método connectWallet
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("MetaMask encontrada!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Conectado", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Chama o método getAllWaves do seu contrato inteligente
         */
        const waves = await wavePortalContract.getAllWaves();
        console.log("Todas as ondas:", waves);

        /*
         * Apenas precisamos do endereço, data/horário, e mensagem na nossa tela, então vamos selecioná-los
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Armazenando os dados
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Objeto Ethereum não existe!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Recuperado o número de tchauzinhos...", count.toNumber());

        if (msg && msg.length > 0) {
            setError("");
            const waveTxn = await wavePortalContract.wave(msg, { gasLimit: 300000 });
            console.log("Minerando...", waveTxn.hash);
            setError("Aguarde, minerando...");
            setMsg("");
  
            await waveTxn.wait();
            console.log("Minerado -- ", waveTxn.hash);
  
            count = await wavePortalContract.getTotalWaves();
            console.log("Total de tchauzinhos recuperado...", count.toNumber());
            setError("");
            getAllWaves();
              
        }
        else {
          setError("Por favor, digite uma mensagem!");
        }

      } else {
        console.log("Objeto Ethereum não encontrado!");
      }
    } 
    catch (error) {
      console.log(error);
      setError("Erro ao enviar tchauzinho");
    }
  }

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          👋 Oi Pessoal!
        </div>

        <div className="bio">
          Eu sou o fabiojun e bora acenar!
          Conecte sua carteira Ethereum wallet e me manda um tchauzinho!
          Você tem 50% de chance de ganhar 0.00001 Ether para cada tchauzinho que enviar.
          Porém, você só pode enviar um tchau a cada 15min.
        </div>

        <h3>Digite sua mensagem:</h3>
        <input
          type="text"
          placeholder="Digite sua mensagem"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          disabled={!currentAccount}
        />
        <button 
          className={"waveButton" + (currentAccount ? "" : " disabled")}
          onClick={wave}
          disabled={!currentAccount}
        >
          Mandar Tchauzinho 🌟
        </button>
        <div className="error">
          {error}
        </div>
        {/*
        * Se não existir currentAccount, apresente este botão
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Conectar carteira
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} className={"waves"}>
              <div>Endereço: {wave.address}</div>
              <div>Data/Horário: {wave.timestamp.toString()}</div>
              <div>Mensagem: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}
