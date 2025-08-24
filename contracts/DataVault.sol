
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DataVault {
    event DataWritten(address indexed sender, uint256 indexed id, string content, uint256 timestamp);

    event EthTransferred(address indexed sender, address indexed to, uint256 amount, uint256 timestamp);


    uint256 public counter; // auto-increment id
    

    function writeData(string calldata content) external {
        counter += 1;
        emit DataWritten(msg.sender, counter, content, block.timestamp);
    }
    function transferEth(address payable to) external payable {
        require(msg.value > 0, "No ETH sent");
        to.transfer(msg.value);
        emit EthTransferred(msg.sender, to, msg.value, block.timestamp);
    }
}
