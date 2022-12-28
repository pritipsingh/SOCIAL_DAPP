// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Social is ERC721URIStorage {

    uint256 public tokenCount;
    uint256 public postCount;

    mapping (uint256 => Post) public posts;

    mapping (address => uint256) public profiles;

    struct Post {
        uint256 id;
        string hash;
        uint256 tipAmount;
        address payable author;
    }
    event PostCreated (
        uint256 id,
        string hash,
        uint256 tipAmount,
        address payable author
    );

    event PostTipped (
        uint256 id,
        string hash,
        uint256 tipAmount,
        address payable author
    );

    constructor() ERC721('Social', "DAPP") {}

    function mint(string memory _tokenURI) external  returns (uint256) {
      tokenCount ++;
      _safeMint(msg.sender, tokenCount);
      _setTokenURI(tokenCount, _tokenURI);
      setProfile(tokenCount);

      return tokenCount;
        
    }
    function setProfile(uint256 _id) public {
        require(
            ownerOf(_id) == msg.sender,
            "You do not own this nft. You cannot set your profile."
        );
        profiles[msg.sender] = _id;
    
}
function uploadPost(string memory _postHash) external {
    //check that the user owns an NFT
    require(
        balanceOf(msg.sender) > 0, "You must own a Social NFT to post"
    );
    //Make sure the post hash exists
    require(bytes(_postHash).length>0, "Post hash cannot be empty");
    //Increment the post count
    postCount++;
    //Add the post to the contract
    posts[postCount] = Post(postCount, _postHash, 0, payable(msg.sender));
    //Trigger an event
    emit PostCreated(postCount, _postHash, 0, payable(msg.sender));

}
 function tipPostOwner(uint256 _id) external payable {
    //make sure the id is valid
    require(_id > 0 && _id <= postCount, "Invalid Post id");
    Post memory _post = posts[_id];
    require(_post.author != msg.sender, "You cannot tip yourself");
    //Pay the author by sending them ether
    _post.author.transfer(msg.value);
    //Increment the tip amount
    _post.tipAmount += msg.value;
    //Update the post
    posts[_id] = _post;
    //Trigger the event
    emit PostTipped(_id, _post.hash, _post.tipAmount, _post.author);
 }
 //Fetches all the posts
 function getAllPosts() external view returns (Post[] memory _posts){
    _posts = new Post[](postCount);
    for(uint256 i = 1; i <= postCount; i++){
        _posts[i-1] = posts[i];

 }}
 function getMyNfts() external view returns (uint256[] memory _ids){}
 }
   