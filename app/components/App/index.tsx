import { getIPFSClient } from 'app/utils/ipfs';
import React from 'react';
import sdk from 'reputation-sdk/lib/proto';
import Web3 from 'web3';

// Style
import 'app/style/index.scss';

// #region -------------- Interfaces -------------------------------------------------------------------

interface IProps { }

interface IState {
  passportAddress: string;
  profile: IProfile;
  error: string;
  isLoading: boolean;
}

interface IProfile {
  name?: string;
  nickname?: string;
  reputationScore?: number;
  starScore?: number;
  signedDealsCount?: number;
  avatarUrl?: string;
}

// #endregion

// #region -------------- App -------------------------------------------------------------------

export default class App extends React.Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);

    this.state = this.getInitialState();
  }

  public render() {
    return (
      <div className='app'>
        <div className='content-container'>
          {this.renderPassportAddressForm()}
        </div>

        <div className='content-container text-center'>
          {this.renderReputationWidget()}
        </div>
      </div>
    );
  }

  // #region -------------- State -------------------------------------------------------------------

  private getInitialState = () => {
    return {
      passportAddress: '0xFBc43245f8df0D2a8f6393E63331f089888F43E7',
      profile: null,
      error: null,
      isLoading: false,
    };
  }

  private updateState(updatedProps: Partial<IState>) {
    this.setState({
      ...this.state,
      ...updatedProps,
    });
  }

  // #endregion

  // #region -------------- Passport address form -------------------------------------------------------------------

  private renderPassportAddressForm() {
    const { passportAddress, isLoading } = this.state;

    return (
      <div className='passport-address-form'>
        <form onSubmit={this.onSubmit}>
          <label>
            <div className='label'>Passport address *</div>
            <input
              type='text'
              value={passportAddress}
              onChange={this.onPassportAddressChange}
            />
          </label>

          {this.renderError()}

          <div className='submit-container'>
            <button
              className='btn btn-primary'
              type='submit'
              disabled={isLoading}
            >
              Submit
            </button>

            {this.renderLoader()}
          </div>
        </form>
      </div>
    );
  }

  private onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form
    let error = this.validateForm();
    if (error) {
      this.updateState({ error });
      return;
    }

    // Clear errors, enable loader
    this.updateState({ error: null, isLoading: true, profile: null });

    try {
      const profile: IProfile = await this.getDataFromPassport();

      this.setState({ profile });
    }
    catch (err) {
      this.updateState({
        error: err.message,
        profile: null,
      });
      return;
    }
    finally {
      this.updateState({ isLoading: false })
    }

    // Reset form
    //this.setState({ passportAddress: '' });
  }

  private onPassportAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const passportAddress = e.target.value;

    this.setState({ passportAddress });
  }

  private validateForm = () => {
    const { passportAddress } = this.state;

    if (!passportAddress || !passportAddress.trim()) {
      return 'All fields must be filled';
    }

    return null;
  }

  private getDataFromPassport = async (): Promise<IProfile> => {
    const { passportAddress } = this.state;

    let data: IProfile = {};

    const ETH_NETWORK_URL = 'https://mainnet.infura.io'
    const FACT_PROVIDER_ADDRESS = '0x38297AA77546a175dD50AA59B53d8893f72609B0'

    const web3 = new Web3(new Web3.providers.HttpProvider(ETH_NETWORK_URL));
    const reader = new sdk.FactReader(web3, ETH_NETWORK_URL, passportAddress);

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
  }

  // #endregion

  // #region -------------- Error -------------------------------------------------------------------

  private renderError = () => {
    const { error } = this.state;

    if (!error) {
      return null;
    }

    return (
      <div className='msg-error'>{error}</div>
    )
  }

  // #endregion

  // #region -------------- Loader -------------------------------------------------------------------

  private renderLoader = () => {
    const { isLoading } = this.state;

    if (!isLoading) {
      return null;
    }

    return <div className='loader' />;
  }

  // #endregion

  // #region -------------- Reputation widget -------------------------------------------------------------------

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

  // #endregion
}

// #endregion

// #region -------------- Helpers -------------------------------------------------------------------

function getFirstLetters(name: string, maxLettersCount: number) {
  if (!name) {
    return '';
  }

  const names = name.split(' ');
  const maxLetters = names.length < maxLettersCount ? names.length : maxLettersCount;

  let firstLetters = '';

  for (let i = 0; i < maxLetters; i += 1) {
    firstLetters += (names[i] && names[i].length > 0) ? names[i][0] : '';
  }

  return firstLetters;
}

// #endregion
