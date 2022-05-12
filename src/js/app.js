App = {
	web3Provider: null,
	contracts: {},
	account: "0X0",

	init: function () {
		return App.initWeb3();
	},

	initWeb3: function () {
	if (typeof web3 !== "undefined") {
		// if a web3 instance is already provided by metamask
		App.web3Provider = web3.currentProvider;
		web3 = new Web3(web3.currentProvider);
	} else {
		// Specify deafault instance if no web3 instance provided
		App.web3Provider = new Web3.providers.HttpProvider("http://127.0.0.1:7545");
		web3 = new Web3(App.web3Provider);
	}
		return App.initContract();
	},

	initContract: function () {
		$.getJSON("Election.json", function (election) {
			//Instantiate a new truffle contract from the artifact
			App.contracts.Election = TruffleContract(election);
			// Connect provider to interact with the contract
			App.contracts.Election.setProvider(App.web3Provider);

			App.listenForEvents();
			
			return App.render();
		});
	},

	render: function () {
		let electionInstance;
		let loader = $("#loader");
		let content = $("#content");

		loader.show();
		content.hide();

		// Load account data
		web3.eth.getCoinbase(function(err, account) {
			if (err === null) {
			  App.account = account;
			  $("#accountAddress").html("Your Account: " + account);
			}
		  });
		

    	App.contracts.Election.deployed()
			.then(function (instance) {
				electionInstance = instance;
				return electionInstance.CandidateCount();
			})
      		.then(function (CandidateCount) {
        		let candidateResults = $("#candidatesResults");
        		candidateResults.empty();

				let candidateSelect = $('#candidatesSelect');
				candidateSelect.empty();

			for (let idx = 1; idx <= CandidateCount; idx++) {
				electionInstance.candidates(idx).then(function (candidate) {
					let id = candidate[0];
					let name = candidate[1];
					let votes = candidate[2];

					// render the candidate result
					let candidateTemplate =
					"<tr><th>" +
					id +
					"</th><td>" +
					name +
					"</td><td>" +
					votes +
					"</td></tr>";
					candidateResults.append(candidateTemplate);

					// Render candidate ballot option
					let candidateOption = "<option value='" + id + "' >" 
					+ name + "</ option>";
					candidateSelect.append(candidateOption); 
				});

				
    	}

		loader.hide();
		content.show();

	}).catch(function(err) {
		console.warn(err);
	})
  	},

	castVote: function() {
		let candidateId = $('#candidatesSelect').val();
		App.contracts.Election.deployed().then(function(instance) {
			return instance.vote(candidateId, {from: App.account})
		}).then(function(result) {
			// waiting for votes to update
			$('#content').hide();
			$('#loader').show();
		}).catch(function(err) {
			console.error(err);
		});
	},

	listenForEvents: function() {
		App.contracts.Election.deployed().then(function(instance) {
			instance.votedEvent({}, {
				fromBlock: 0,
				toBlock: 'lastest',
			}).watch(function(error, event) {
				console.log("event triggered", event)
				App.render();
			});
		});
	}
};


$(function () {
  $(window).load(function () {
    App.init();
  });
});
