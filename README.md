# Monetha Reputation Widget - Reputation Passport data from blockchain

The following example app purpose is to show how Reputation Passport can be read using a helper [reputation js sdk](https://github.com/monetha/reputation-js-sdk). More about Reputation Passport can be found in [Monetha - Reputation Layer documentation](https://github.com/monetha/reputation-layer)

This example is based on a reputation widget that Monetha user's get when they agree to publish their profiles. A [reputation widget](https://www.monetha.io/reputation-widgets) is one of the multiple features that we offer in our Monetha Platform. Though reputation widgets are available to user's who didn't create a Passport. The example below will show you how we retrieve data for users who did create the Passport.

In order to achieve the following we leverage [reputation js sdk](https://github.com/monetha/reputation-js-sdk). You can read more about Monetha Reputation Layer implementation in our [Github repo](https://github.com/monetha/reputation-layer)

## Setup & Run

After cloning the repository you will need to install the dependencies.

    npm install

After dependency installation is completed you can start the app with default configuration.

    npm start

This will run a local node.js server and serve the app on http://localhost:3000. First load might take some time due to building devDependencies for debugging purpose.

After application has loaded you should see an input box for entering a passport address. After entering a passport a passport address and clicking "Submit" information will be retrieved from blockchain and a reputation widget will be rendered.

## Implementation

All functionality can be found in [app/components/App/index.tsx](app/components/App/index.tsx). We will be looking deeper into the implementation of the `getDataFromPassport()`. This method is triggered when "Submit" button is pressed.

1. Initialize the sdk.

In order to read the Monetha Reputation Wallet data from the blockchain we need the following:

- ETH_NETWORK_URL a JSON RPC url for an Ethereum node that will be retrieving our data. Default value `https://mainnet.infura.io`. We will be using mainnet to read passport data
- FACT_PROVIDER_ADDRESS an Ethereum address of a fact provider who is provisioning the data to a Reputation Passport. Default value `0x38297AA77546a175dD50AA59B53d8893f72609B0` Monetha fact provider in our live environment
- passportAddress an Ethereum address of a Passport where data is stored. Feel free to use our test merchant passport address in live environment `0xFBc43245f8df0D2a8f6393E63331f089888F43E7`

```javascript
    const ETH_NETWORK_URL = 'https://mainnet.infura.io'
    const FACT_PROVIDER_ADDRESS = '0x38297AA77546a175dD50AA59B53d8893f72609B0'

    const web3 = new Web3(new Web3.providers.HttpProvider(ETH_NETWORK_URL));
    const reader = new sdk.FactReader(web3, ETH_NETWORK_URL, passportAddress);
```

2. Read the latest Monetha facts from Passport (aka reputation data).

When facts are being provided they are stored in a key/value like storage. In order to read the facts we need to know the keys that were used for storing the data. As we are focusing on reading reputation data provided by Monetha we must use the following keys:

- profile
- deal_stats
- profile_image

Reputation layer allows fact providers storing data in different data types (Monetha is a fact provider in case of storing Monetha reputation data). More information can be found [writing facts readme section](https://github.com/monetha/reputation-go-sdk#writing-facts) of our [reputation-go-sdk](https://github.com/monetha/reputation-go-sdk)

```javascript
    // Monetha stores facts in multiple keys in order to optimize the costs of updating the data
    // 'profile' a json object containing the following
    /*
    {
      "name": "",
      "nickname": "",
      "is_verified": ""
    }
    */
    const FACT_KEY_PROFILE = 'profile';

    // 'deal_stats' a json object containing the following
    /*
    {
      "star_score": 0,
      "reputation_score": 0,
      "signed_deals_count": 0
    }
    */
    const FACT_KEY_DEAL_STATS = 'deal_stats';

    // 'profile_image' a string value of the IPFS blob reference
    const FACT_KEY_PROFILE_IMAGE = 'profile_image';

    // Retrieval of `profile` data
    const profileResponse = await reader.getTxdata(FACT_PROVIDER_ADDRESS, FACT_KEY_PROFILE);
    const profile = JSON.parse(profileResponse);

    if (profile) {
      data.name = profile.name;
      data.nickname = profile.nickname;
    }

    // Retrieval of `deal_stats` data
    const dealStatsResponse = await reader.getTxdata(FACT_PROVIDER_ADDRESS, FACT_KEY_DEAL_STATS);
    const dealStats = JSON.parse(dealStatsResponse);

    if (dealStats) {
      data.reputationScore = dealStats.reputation_score;
      data.starScore = Number((parseFloat(dealStats.star_score) / 100).toFixed(2));
      data.signedDealsCount = dealStats.signed_deals_count;
    }

    // Retrieval of `profile_image`
    const ipfsClient = await getIPFSClient();
    const profileImgUrl = await reader.getIPFSData(FACT_PROVIDER_ADDRESS, FACT_KEY_PROFILE_IMAGE, ipfsClient);

    if (profileImgUrl) {
      data.avatarUrl = profileImgUrl;
    }

    return data;
```

3. Bind the data to UX representation

Methods responsible for rendering the widget and it's contents are `renderReputationWidget()` and `renderProfileImage()`

```javascript
    private renderReputationWidget() {
        const { profile } = this.state;

        if (!profile) {
        return null;
        }

        return (
        <div className='reputation-widget-wrapper'>
            <div className='reputation-widget'>

            {profile.nickname && <a className='profile-link' href={`https://www.monetha.io/profile/${profile.nickname}`} target='_blank' rel='noopener noreferrer' />}

            <div className='profile-info'>
                <div>
                {this.renderProfileImage()}
                </div>

                <h4 className='profile-name'>{profile.name}</h4>

                {profile.nickname &&
                <a className='share-icon' href={`https://www.monetha.io/profile/${profile.nickname}`} target='_blank' rel='noopener noreferrer'>
                    <img src={`https://www.monetha.io/assets/snippets/share.png`} alt='share' />
                </a>
                }
            </div>

            <div className='deal-stats'>
                <div className='reputation-score'>
                <div>{profile.reputationScore}</div>
                <img src={`https://www.monetha.io/assets/snippets/mth.png`} alt='mth' />
                </div>
                <div>
                <img src={`https://www.monetha.io/assets/snippets/star.png`} alt='star' />
                <div>{profile.starScore}</div>
                </div>
            </div>
            </div>

            <div className='powered-by'>
            <h5 className='powered-by-text'>Powered by</h5>
            <a href={`https://www.monetha.io`} target='_blank' rel='noopener noreferrer'>
                <img src={`https://www.monetha.io/assets/snippets/logo.png`} alt='logo' />
            </a>
            </div>
        </div>
        );
    }

    private renderProfileImage() {
        const { profile } = this.state;

        if (!profile) {
        return null;
        }

        let profileImage = null;
        if (profile.avatarUrl) {
        profileImage = <div className='profile-image' style={{ backgroundImage: `url('${profile.avatarUrl}')` }} />
        }

        return (
        <div className='profile-image-wrapper'>
            <div className='profile-first-letters'>
            {getFirstLetters(profile.name, 3)}
            </div>

            {profileImage}
        </div>
        );
    }
```

Full code for rendering an widget can be found in [app/components/App/index.tsx](app/components/App/index.tsx)

## Conclusion

The following application is just a quick example of how reputation data is being read from the blockchain without a necessity to being locked down to a single platform. We are focus on building a data exchange framework that can ensure censorship resistance, transferability, transparency and security. Feel free to contact us at team@monetha.io