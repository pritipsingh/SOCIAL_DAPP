const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Social", function (){
  let Social;
  let deployer, user1, user2, users;
  let URI = "sampleURI";
  let hash = "sampleHash";

  beforeEach(async function () {
    [deployer, user1, user2, ...users] = await ethers.getSigners();
    const SocialFactory = await ethers.getContractFactory("Social");

    Social = await SocialFactory.deploy();
    await Social.connect(user1).mint(URI);
  })
  describe("Deployment", async function () {
    it("should track name and symbol", async function () {
      const nftName = "Social";
      const nftSymbol = "DAPP";
      expect(await Social.name()).to.equal(nftName);
      expect(await Social.symbol()).to.equal(nftSymbol);
    });

  });
  describe("Minting NFTS", async () => {
    it("should track each NFT minted", async function () {
      expect(await Social.tokenCount()).to.equal(1);
      expect(await Social.balanceOf(user1.address)).to.equal(1);
      expect(await Social.tokenURI(1)).to.equal(URI);

      await Social.connect(user2).mint(URI);

      expect(await Social.tokenCount()).to.equal(2);
      expect(await Social.balanceOf(user2.address)).to.equal(1);
      expect(await Social.tokenURI(2)).to.equal(URI);
    })
  })
  describe("Setting Profile", async () => {
    it("should allow users to select which NFT they own to represent their profile" , async function () {
      //user1 mints another NFT
      await Social.connect(user1).mint(URI);
      //By default the user profile is set to their last minted NFT.
      expect(await Social.profiles(user1.address)).to.equal(2);
      //user1 sets their profile to their first minted NFT
      await Social.connect(user1).setProfile(1);
      expect(await Social.profiles(user1.address)).to.equal(1);

      //FAILED CASE
      await expect(
        Social.connect(user2).setProfile(2)
      ).to.be.revertedWith("You do not own this nft. You cannot set your profile.");


    })
  })
  describe("Tipping Posts" , async () => {
    it("should allow users to tip posts and track each posts tip amount", async function () {
      //user1 iploads a post
      await Social.connect(user1).uploadPost(hash);
      //track user 1's initial balance
      const initialBalance = await ethers.provider.getBalance(user1.address);
      //set tips amount to 1 ether
      const tipAmount = ethers.utils.parseEther("1"); //1 ethers = 10**8 wei
      //user2 tips user1's post
      await expect(Social.connect(user2).tipPostOwner(1, {value: tipAmount}))
      .to.emit(Social, "PostTipped")
      .withArgs(
        1,
        hash,
        tipAmount,
        user1.address
      )
      //check that tipAmount has been updated from struct
      const post = await Social.posts(1);
      expect(post.tipAmount).to.equal(tipAmount);
      //check that user1 received funds
      const finalAuthorBalance = await ethers.provider.getBalance(user1.address);
      expect(finalAuthorBalance).to.equal(initialBalance.add(tipAmount));
      //FAILED CASE
      //User2 tries to tip a post that does not exist
      await expect(
        Social.connect(user2).tipPostOwner(2)).to.be.revertedWith("Invalid Post id");
      
    })
  })
})