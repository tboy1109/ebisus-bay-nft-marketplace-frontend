// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "../SafeMathLite.sol";
import "../SafePct.sol";
import "../BaseDrop.sol";
// import "../interfaces/IDrop.sol";

interface IDrop {
    struct Info {
        uint256[3] regularCost;
        uint256[3] memberCost;
        uint256 whitelistCost;
        uint256 maxSupply;
        uint256 totalSupply;
        uint256 maxMintPerAddress;
        uint256 maxMintPerTx;
    }
    
    function mintCost(address _minter) external view returns(uint256[3] memory);
    function canMint(address _minter) external view returns (uint256);
    function mint(uint256 _amount) external payable;
    function maxSupply() external view returns (uint256);
    function getInfo() external view returns (Info memory);
}

contract Cronoverse is IDrop, BaseDrop {
    using Counters for Counters.Counter;
    using SafePct for uint256;
    using SafeMathLite for uint256;

    uint256[3] private memberPrice = [670 ether, 870 ether, 1225 ether];
    uint256[3] private regularPrice = [695 ether, 895 ether, 1250 ether];
    uint128 constant MAX_TOKENS = 1208;
    uint128 constant MAX_MINTAMOUNT = 1;
    string baseURI = "https://ipfs.io/ipfs/QmW9SuSjGEWoqPPj1g2zz1BNnkqoCB1cWHsmnSxUUjZNJ3";

    uint256[] private mintedIds;
    
    constructor(address _memberships, address _artist) ERC721("Cronoverse Land Tiles", "CLAND") {
        memberships = ERC1155(_memberships);
        artist = _artist;
        fee = 1000;
    }

    function mintCost(address _minter) external override view returns(uint256[3] memory) {
        if (isMember(_minter)) {
            return memberPrice;
        } else {
            return regularPrice;
        }
    }

    function getInfo() public override view returns (Info memory) {
        Info memory allInfo;
        allInfo.regularCost = regularPrice;
        allInfo.memberCost = memberPrice;
        allInfo.maxSupply = MAX_TOKENS;
        allInfo.totalSupply = super.totalSupply();
        allInfo.maxMintPerTx = MAX_MINTAMOUNT;

        return allInfo;
    }
    
    function setCost(uint256[3] memory _cost, bool isMember) external onlyOwner {
        if (isMember) {
            memberPrice = _cost;
        } else {
            regularPrice = _cost;
        }
    }

    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }

    function mint(uint256 id) external override payable whenNotPaused {
        uint256 totalMinted = totalSupply(); 
        require(totalMinted < MAX_TOKENS, "Sold out");
        require(id <= MAX_TOKENS && id >= 1, "Token ID Invalid!");    
        uint256 price;
        bool _isMember = isMember(msg.sender);
        uint8 tileType = getTileType(id);

        if(_isMember){
            price = memberPrice[tileType];
        } else {
            price = regularPrice[tileType]; 
        }
        
        require(msg.value >= price, "not enough funds");

        _safeMint(msg.sender, id);
        mintedIds.push(id);
        uint256 amountFee = price.mulDiv(fee, SCALE); 
        _asyncTransfer(artist, price - amountFee);
    }

    function getMintedIds() public view returns (uint256[] memory) {
        return mintedIds;
    }
    
    function tokenURI(uint _tokenId) public view virtual override returns (string memory) {
      require(_exists(_tokenId),"ERC721Metadata: URI query for nonexistent token");

      string memory _tokenURI = string(abi.encodePacked(baseURI, "/", Strings.toString(_tokenId), ".json"));

      return _tokenURI;
    }

    function maxSupply() external override pure returns (uint256) {
        return MAX_TOKENS;
    }

    function canMint(address) external override pure returns (uint256) {
        return MAX_MINTAMOUNT;
    }   

    function getTileType(uint256 tokenId) public pure returns (uint8) {
        if ((tokenId >= 1 && tokenId <= 156) || (tokenId >= 1001 && tokenId <= 1208))
            return 0;
        if ((tokenId >= 329 && tokenId <= 348) ||
            (tokenId >= 381 && tokenId <= 400) || (tokenId >= 433 && tokenId <= 436)
            || (tokenId >= 469 && tokenId <= 472) || (tokenId >= 505 && tokenId <= 508)
            || (tokenId >= 541 && tokenId <= 544) || (tokenId >= 577 && tokenId <= 580)
            || (tokenId >= 613 && tokenId <= 616) || (tokenId >= 649 && tokenId <= 652)
            || (tokenId >= 685 && tokenId <= 688) || (tokenId >= 721 && tokenId <= 724)
            || (tokenId >= 757 && tokenId <= 776) || (tokenId >= 809 && tokenId <= 828)
        ) return 2;

        if ((tokenId >= 168 && tokenId <= 197) ||
            (tokenId >= 220 && tokenId <= 249) || (tokenId >= 272 && tokenId <= 301)
            || (tokenId >= 324 && tokenId <= 328) || (tokenId >= 349 && tokenId <= 353)
            || (tokenId >= 376 && tokenId <= 380) || (tokenId >= 401 && tokenId <= 405)
            || (tokenId >= 428 && tokenId <= 432) || (tokenId >= 437 && tokenId <= 441)
            || (tokenId >= 464 && tokenId <= 468) || (tokenId >= 473 && tokenId <= 477)
            || (tokenId >= 500 && tokenId <= 504) || (tokenId >= 509 && tokenId <= 513)
            || (tokenId >= 536 && tokenId <= 540) || (tokenId >= 545 && tokenId <= 549)
            || (tokenId >= 572 && tokenId <= 576) || (tokenId >= 581 && tokenId <= 585)
            || (tokenId >= 608 && tokenId <= 612) || (tokenId >= 617 && tokenId <= 621)
            || (tokenId >= 644 && tokenId <= 648) || (tokenId >= 653 && tokenId <= 657)
            || (tokenId >= 680 && tokenId <= 684) || (tokenId >= 689 && tokenId <= 693)
            || (tokenId >= 716 && tokenId <= 720) || (tokenId >= 725 && tokenId <= 729)
            || (tokenId >= 752 && tokenId <= 756) || (tokenId >= 777 && tokenId <= 781)
            || (tokenId >= 804 && tokenId <= 808) || (tokenId >= 829 && tokenId <= 833)
            || (tokenId >= 856 && tokenId <= 885) || (tokenId >= 908 && tokenId <= 937)
            || (tokenId >= 960 && tokenId <= 989)
        ) return 1;
        return 0;
    }
}