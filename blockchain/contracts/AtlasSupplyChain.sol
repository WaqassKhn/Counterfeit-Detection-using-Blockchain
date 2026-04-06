// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AtlasSupplyChain {
    address public owner;

    struct EventRecord {
        string department;
        string eventType;
        string location;
        string source;
        string destination;
        string actorId;
        string notes;
        uint256 timestamp;
        address actor;
    }

    struct Product {
        string serialId;
        string manufacturerName;
        string batchNumber;
        string manufactureDate;
        bool exists;
        EventRecord[] events;
    }

    mapping(string => Product) private products;
    mapping(address => bool) public authorizedActors;

    event ProductRegistered(
        string indexed serialId,
        string manufacturerName,
        string batchNumber,
        string manufactureDate,
        address indexed actor
    );
    event LifecycleEventRecorded(
        string indexed serialId,
        string department,
        string eventType,
        string location,
        address indexed actor
    );
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

    function registerProduct(
        string memory serialId,
        string memory manufacturerName,
        string memory batchNumber,
        string memory manufactureDate
    ) external onlyAuthorized {
        require(bytes(serialId).length > 0, "Serial required");
        require(bytes(batchNumber).length > 0, "Batch required");
        require(bytes(manufactureDate).length > 0, "Manufacture date required");
        require(!products[serialId].exists, "Product exists");

        Product storage product = products[serialId];
        product.serialId = serialId;
        product.manufacturerName = manufacturerName;
        product.batchNumber = batchNumber;
        product.manufactureDate = manufactureDate;
        product.exists = true;
        product.events.push(
            EventRecord({
                department: "Manufacturer",
                eventType: "REGISTERED",
                location: manufacturerName,
                source: manufacturerName,
                destination: manufacturerName,
                actorId: "manufacturer-node-1",
                notes: batchNumber,
                timestamp: block.timestamp,
                actor: msg.sender
            })
        );

        emit ProductRegistered(serialId, manufacturerName, batchNumber, manufactureDate, msg.sender);
    }

    function addLifecycleEvent(
        string memory serialId,
        string memory department,
        string memory eventType,
        string memory location,
        string memory source,
        string memory destination,
        string memory actorId,
        string memory notes
    ) external onlyAuthorized {
        require(products[serialId].exists, "Unknown product");
        require(bytes(department).length > 0, "Department required");
        require(bytes(eventType).length > 0, "Event type required");
        require(bytes(location).length > 0, "Location required");

        products[serialId].events.push(
            EventRecord({
                department: department,
                eventType: eventType,
                location: location,
                source: source,
                destination: destination,
                actorId: actorId,
                notes: notes,
                timestamp: block.timestamp,
                actor: msg.sender
            })
        );

        emit LifecycleEventRecorded(serialId, department, eventType, location, msg.sender);
    }

    function getProduct(string memory serialId)
        external
        view
        returns (
            string memory productSerialId,
            string memory manufacturerName,
            string memory batchNumber,
            string memory manufactureDate,
            bool exists,
            uint256 eventCount
        )
    {
        Product storage product = products[serialId];
        return (
            product.serialId,
            product.manufacturerName,
            product.batchNumber,
            product.manufactureDate,
            product.exists,
            product.events.length
        );
    }

    function getProductHistory(string memory serialId) external view returns (EventRecord[] memory) {
        require(products[serialId].exists, "Unknown product");
        return products[serialId].events;
    }
}
