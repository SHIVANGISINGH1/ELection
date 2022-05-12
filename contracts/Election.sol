// SPDX-License-Identifier: MIT
pragma solidity >= 0.6.0 <0.9.0; 

contract Election {
    // We are defining a strucuture for the candidiate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }
    //store the candidate
    mapping(uint => Candidate) public candidates;

    // storing the candidadates count
    uint public CandidateCount;

    // for sotring the voters info
    mapping(address => bool) public voters;

     
    event votedEvent (
        uint indexed_candidateId
    );

    constructor(){
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }

    function addCandidate(string memory _name) private {
        CandidateCount++;
        candidates[CandidateCount] = Candidate(CandidateCount,_name,0);
    }

    function vote (uint _candidateId) public {
        // checking if the voter has voted before or not
        // if voter has voted before !voters[msg.sender] will return false thus it will revert back
        require(!voters[msg.sender]);

        // check if the candidate is a valid candidate
        require(_candidateId > 0 && _candidateId <= CandidateCount);

        // record that the voter has voted
        voters[msg.sender] = true;
        // update candidate vote count
        candidates[_candidateId].voteCount++;

        // trigger voted event
        emit votedEvent(_candidateId);
    }
}
