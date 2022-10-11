const chainId = 31337;
const chainRpc = "http://127.0.0.1:8545"
const contractAddress = "0x56fC17a65ccFEC6B7ad0aDe9BD9416CB365B9BE8";
let mintableTokens = []

const alertsClass = 'framer-rbwcf2'
const buttonClass = 'framer-11qugvl'
const alertsContentClass = 'framer-styles-preset-12lj5ox'


window.ethereum.on("accountsChanged", function (accounts) {
  window.location.reload();
});


setTimeout(() => {
  document.title = 'Crypto Champions NFT'
  document.getElementsByClassName(buttonClass)[0].onclick = (event) => {
    event.preventDefault();
    mintToken();
  };
}, 1000)

var account = null;
var contract = null;


async function connect() {
  if (!window.ethereum) {
    window.location.assign(
      "https://metamask.app.link/dapp/" +
      window.location.host +
      window.location.pathname
    );
    return;
  }
  const providerChainId = parseInt(window.ethereum.chainId, 16);
  await window.ethereum.send("eth_requestAccounts");
  window.web3 = new Web3(window.ethereum);
  var accounts = await web3.eth.getAccounts();
  account = accounts[0];

  const httpWeb3 = new Web3(new Web3.providers.HttpProvider(chainRpc))
  contract = new httpWeb3.eth.Contract(ABI, contractAddress);
  const tempMintableTokens = await contract.methods.mintableTokens(account).call();
  mintableTokens = tempMintableTokens.map(token => parseInt(token)).filter(token => token !== 0)
  if (mintableTokens.length == 0) {
    setError("No more Champions VX to mint");
    setButtonText('No more Champions VX to mint')
    return;
  }

  if (chainId !== providerChainId) {
    setButtonText('Switch Network')
  } else {
    setButtonText(`Mint ${mintableTokens.length} Champions VX`)
  }
}

function setInfo(infoMsg) {
  document.getElementsByClassName(alertsClass)[0].setAttribute('style', 'display: flex !important; background-color: #198754;');
  document.getElementsByClassName(alertsContentClass)[0].innerHTML = infoMsg;
}

function setButtonText(buttonText) {
  document.getElementsByClassName(alertsContentClass)[1].innerHTML = buttonText;
}

function setError(errorMsg) {
  document.getElementsByClassName(alertsClass)[0].setAttribute('style', 'display: flex !important; background-color: #EB0A0A;');
  document.getElementsByClassName(alertsContentClass)[0].innerHTML = errorMsg;
}

async function mintToken() {
  if (account == null) {
    try {
      await connect();
      return
    } catch { }
  }
  document.getElementsByClassName(alertsClass)[0].style.display = "none";
  if (mintableTokens.length === 0) {
    setError('No more Champions VX to mint');
    return
  }
  const nftNum = mintableTokens[0]

  const providerChainId = parseInt(window.ethereum.chainId, 16);
  if (chainId !== providerChainId) {
    try {
      setButtonText('Switching Network...')
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + chainId.toString(16) }], // chainId must be in hexadecimal numbers
      });
      setButtonText(`Mint ${mintableTokens.length} Champions VX`)
    } catch {
      setButtonText('Switch Network')
    }
    return;
  }
  setButtonText('Minting...')
  contract.methods
    .bulkMint(mintableTokens)
    .send({ from: account })
    .then((res) => {
      setButtonText('No more Champions VX to mint')
      setInfo("Successfully minted " + nftNum + " Champions VX! Welcome to the metaverse!");
    })
    .catch(function (e) {
      if (JSON.stringify(e).indexOf("paused") > -1) {
        setError("Sorry, the sale is not active right now.");
      } else if (JSON.stringify(e).indexOf("Not owner") > -1) {
        setError("Sorry, you do not own the matching Champions you're trying to mint.");
      } else if (JSON.stringify(e).indexOf("already minted") > -1) {
        setError("This Champions VX has already been minted.");
      } else {
        setError(
          "Sorry, we had an error with your transaction. " + e.message
        );
      }
    });
}
