var Election = artifacts.require('./Election.sol');

contract("Election", function(accounts) {
    let CandidatesInstance; 
    let CandidateId;
    
    it("initializes with two candidates", function() {
        return Election.deployed().then(function(instance) {
            return instance.CandidateCount();
        }).then(function(count) {
            assert.equal(count,2);
        })
    });

    
    it("it initializes the candidates with the correct values", function() {
        return Election.deployed().then(function(instance) {
            CandidatesInstance = instance;
            return CandidatesInstance.candidates(1);
        }).then(function(candidate) {
                assert.equal(candidate[0], 1, "Candidate 1 id should be 1"),
                assert.equal(candidate[1], "Candidate 1", "Candidate 1 name should be Candidate 1"),
                assert.equal(candidate[2], 0, "Initial votes of candidate 1 should be 0");
                return CandidatesInstance.candidates(2);
        }).then(function(candidate) {
            assert.equal(candidate[0], 2, "Candidate 2 id should be 2"),
            assert.equal(candidate[1], "Candidate 2", "Candidate 2 name should be Candidate 2"),
            assert.equal(candidate[2], 0, "Initial votes of candidate 2 should be 0");
        })
    })

    it("allows a votes to cast a vote", function() {
        return Election.deployed().then(function(instance) {
            CandidatesInstance = instance;
            CandidateId = 1;
            return CandidatesInstance.vote(CandidateId, {from: accounts[0]});
        }).then(function(recipt) {
            assert.equal(recipt.logs.length, 1, "an event was triggered");
            assert.equal(recipt.logs[0].event, "votedEvent", "the event triggered has correct type");
            assert.equal(recipt.logs[0].args.indexed_candidateId.toNumber(), CandidateId, "the candidate is correct");
            return CandidatesInstance.voters(accounts[0]);
        }).then(function(voteAdded) {
            assert("The voter casted his vote");
            return CandidatesInstance.candidates(CandidateId);
        }).then(function(voter) {
            let voteCount = voter[2];
            assert.equal(voteCount,1, "Voter has casted one vote");
        })
    })

    it('throws an error for an invalid candidate', function() {
        return Election.deployed().then(function(instance) {
            CandidatesInstance = instance;
            return CandidatesInstance.vote(99, {from: accounts[1]})
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >=0, "Error message must contain revert");
            return CandidatesInstance.candidates(1);
        }).then(function(candidate1) {
            let voteCount = candidate1[2];
            assert.equal(voteCount, 1, "candidate 1 did not recieve any votes");
            return CandidatesInstance.candidates(2);
        }).then(function(candidate2) {
            let voteCount = candidate2[2];
            assert.equal(voteCount, 0, "candidate 2 did not recieve any votes");
        });
    });

    it("throws an exception for double voting", function() {
        return Election.deployed().then(function(instance) {
            CandidatesInstance = instance;
            CandidateId = 2;
            CandidatesInstance.vote(CandidateId, {from: accounts[3]});
            return CandidatesInstance.candidates(CandidateId);
        }).then(function(recipt) {
            return CandidatesInstance.voters(accounts[3]);
        }).then(function(voteAdded) {
            assert("The voter casted his vote");
            return CandidatesInstance.candidates(CandidateId);
        }).then(function(candidate2) {
            let voteCount = candidate2[2];
            assert.equal(voteCount, 1, "accepts the 1st vote");
            // If tries to vote again
            CandidateId = 2;
            return CandidatesInstance.vote(CandidateId, {from: accounts[3]});
        }).then(assert.fail).catch(function(error) {
            assert(error.message, "Error message must contain revert");
            return CandidatesInstance.candidates(1);
        }).then(function(candidate1) {
            let voteCount = candidate1[2];
            assert.equal(voteCount, 1, "Candidate 1 did not recieve any vote");
            return CandidatesInstance.candidates(2);
        }).then(function(candidate2) {
            let voteCount = candidate2[2];
            assert.equal(voteCount, 1, "Candidate 2 did not recieve any vote");
        });
    })
});

