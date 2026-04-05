// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AtlasSupplyChain {
    address public owner;

    struct EventRecord {
        string role;
        string location;
        uint256 timestamp;
        address actor;
    }

    struct Product {
        string serialId;
        string manufacturer;
        bool exists;
        EventRecord[] events;
    }

    mapping(string => Product) private products;
    mapping(address => bool) public authorizedActors;

    event ProductRegistered(string indexed serialId, string manufacturer, address indexed actor);
    event ProductTransferred(string indexed serialId, string role, string location, address indexed actor);
    event ActorAuthorizationUpdated(address indexed actor, bool authorized);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedActors[msg.sender], "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedActors[msg.sender] = true;
    }

    function setAuthorizedActor(address actor, bool authorized) external onlyOwner {
        authorizedActors[actor] = authorized;
        emit ActorAuthorizationUpdated(actor, authorized);
    }

    function registerProduct(string memory serialId, string memory manufacturer) external onlyAuthorized {
        require(bytes(serialId).length > 0, "Serial required");
        require(!products[serialId].exists, "Product exists");

        Product storage product = products[serialId];
        product.serialId = serialId;
        product.manufacturer = manufacturer;
        product.exists = true;
        product.events.push(
            EventRecord({
                role: "Manufacturer",
                location: "Factory",
                timestamp: block.timestamp,
                actor: msg.sender
            })
        );

        emit ProductRegistered(serialId, manufacturer, msg.sender);
    }

    function transferProduct(string memory serialId, string memory role, string memory location) external onlyAuthorized {
        require(products[serialId].exists, "Unknown product");
        require(bytes(role).length > 0, "Role required");
        require(bytes(location).length > 0, "Location required");

        products[serialId].events.push(
            EventRecord({
                role: role,
                location: location,
                timestamp: block.timestamp,
                actor: msg.sender
            })
        );

        emit ProductTransferred(serialId, role, location, msg.sender);
    }

    function getProduct(string memory serialId)
        external
        view
        returns (
            string memory productSerialId,
            string memory manufacturer,
            bool exists,
            uint256 eventCount
        )
    {
        Product storage product = products[serialId];
        return (product.serialId, product.manufacturer, product.exists, product.events.length);
    }

    function getProductHistory(string memory serialId) external view returns (EventRecord[] memory) {
        require(products[serialId].exists, "Unknown product");
        return products[serialId].events;
    }
}

