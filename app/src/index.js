import Web3 from "web3";
import starNotaryArtifact from "../../build/contracts/StarNotary.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      console.log('deployedNetwork: ', networkId);
      this.meta = new web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      console.log('accounts: ', accounts);
      this.account = accounts[0];
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  createStar: async function() {
    let self = this;
    const { createStar } = this.meta.methods;
    const name = document.getElementById("starName").value;
    const id = parseInt(document.getElementById("starId").value);
    await createStar(name, id).send({from: this.account}, function(err, result){
      if (!err) {
        // console.log("Result: ", result, typeof (result));
        App.setStatus("Account: " + self.account + " has just purchased star with token id: " + id);
      } else {
        alert(err)
      }
    });
  },

  // Implement Task 4 Modify the front end of the DAPP
  lookUp: async function (){
    let self = this;
    const { lookUptokenIdToStarInfo } = this.meta.methods;
    console.log('this.meta.methods: ', this.meta.methods);
    const starId = parseInt(document.getElementById("lookid").value);
    await lookUptokenIdToStarInfo(starId).call({ from: self.account }, null, function(error, result) {
      if (!error) {
        // console.log("Result: ", result, typeof (result));
        const name = result;
        App.setStatus("[" + name + "]");
      } else {
        alert(error)
      }
    })
  }

};

window.App = App;

window.addEventListener("load", async function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live",);
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"),);
  }

  App.start();
});