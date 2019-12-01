import React, { PureComponent } from 'react';
import { NavLink } from 'react-router-dom';
import { UncontrolledDropdown, DropdownItem, DropdownMenu, DropdownToggle, Nav, NavItem } from 'reactstrap';
import PropTypes from 'prop-types';

import { AppSidebarToggler } from '@coreui/react';
import logo from '../../img/logo-symbol.png';
import { CHROME_WS_URL, FF_STORE_URL, EventCategory } from '../../_constants';

import './DefaultHeader.scss';
import { inject } from '../../services/injector-service';
import YoutubeVideo from '../../dialogs/YoutubeVideo';
import SkinPicker from './SkinPicker';
import SwitchAccountMenu from './SwitchAccountMenu';
import { getHostFromUrl } from '../../common/utils';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class DefaultHeader extends PureComponent {
  constructor(props) {
    super(props);
    inject(this, "AppBrowserService", "CacheService", "SessionService", "AnalyticsService");
    this.userId = this.$session.CurrentUser.userId;
    this.currentJiraInstance = getHostFromUrl(this.$session.CurrentUser.jiraUrl);
    this.state = { versionNumber: "1.0" };
  }

  UNSAFE_componentWillMount() {
    this.ratingUrl = this.$jaBrowserExtn.getStoreUrl(true);
    this.storeUrl = this.$jaBrowserExtn.getStoreUrl();
    this.$jaBrowserExtn.getAppVersion().then(v => this.setState({ versionNumber: v }));
    const subj = encodeURIComponent('Check out "Jira Assistant" in web store');
    const body = encodeURIComponent(`${'Check out "Jira Assistant" extension / add-on for your browser from below url:'
      + '\n\nChrome users: '}${CHROME_WS_URL}?utm_source%3Dgmail#`
      + `\n\nFirefox users: ${FF_STORE_URL
      //+ '\n\nEdge users: <<Not available yet>>'
      //+ '\n\nSafari users: <<Not available yet>>'
      }\n\n\n\nThis would help you to track your worklog and generate reports from Jira easily with lots of customizations. `
      + `Also has lot more features like Google Calendar integration, Jira comment & meeting + worklog notifications, Worklog and custom report generations, etc..`);
    const storeUrl = encodeURIComponent(this.storeUrl);
    this.gMailShare = `https://mail.google.com/mail/u/0/?view=cm&tf=1&fs=1&su=${subj}&body=${body}`;
    this.gPlusShare = `https://plus.google.com/share?app=110&url=${storeUrl}`;
    this.linkedInShare = `https://www.linkedin.com/shareArticle?mini=true&url=${storeUrl}&title=${subj}&summary=${body}&source=`;
    this.fackbookShare = `https://www.facebook.com/sharer/sharer.php?u=${storeUrl}`;
    this.twitterShare = `https://twitter.com/home?status=${storeUrl}`;

    if (this.$session.CurrentUser.hideDonateMenu) { // When this settings is changed, below class will be removed from body in settings page
      document.body.classList.add('no-donation');
    }
  }

  trackShare = () => {
    this.$analytics.trackEvent("Share option viewed", EventCategory.HeaderActions);
  }

  showYoutubeHelp = () => this.setState({ showYoutubeVideo: true });

  hideYoutube = () => this.setState({ showYoutubeVideo: false })

  logout() {
    this.$cache.clear();
    window.close();
    window.location.href = "/index.html";
  }

  render() {
    const {
      ratingUrl, gMailShare, gPlusShare, linkedInShare, fackbookShare, twitterShare,
      state: { versionNumber, showYoutubeVideo }
      //REVISIT: props: { children, ...attributes }
    } = this;

    return (
      <React.Fragment>
        <AppSidebarToggler className="d-lg-none" display="md" mobile><span className="fa fa-bars" /></AppSidebarToggler>
        <a href={this.storeUrl} className="navbar-brand" target="_blank" rel="noopener noreferrer">
          <img src={logo} width="24" height="24" alt="Jira Assistant" className="navbar-brand-minimized" />
          <span className="navbar-brand-full">Jira Assistant <span className="v-info badge badge-success">v {versionNumber}</span></span>
        </a>
        <AppSidebarToggler className="d-md-down-none" display="lg"><span className="fa fa-bars" /></AppSidebarToggler>
        <NavLink to={`/${this.userId}/contribute`} className="btn-donate"
          title="Would you like to contribute / compensate us for the effort we put in development of this tool? Click to know more">
          <img src="/assets/donate.png" width="145" className="Donate us" alt="Donate us" />
        </NavLink>
        <Nav className="ml-auto" navbar>
          <Nav className="d-md-down-none margin-r-5" navbar>
            <UncontrolledDropdown nav direction="down">
              <DropdownToggle nav>
                <span className="nav-link pointer" title={`Currently connected to ${this.currentJiraInstance}. Click to see more options.`}> <span className="fa fa-exchange" /> <strong>{this.currentJiraInstance}</strong></span>
              </DropdownToggle>
              <DropdownMenu left>
                <SwitchAccountMenu onLogout={this.props.onLogout} />
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
          <NavItem className="d-md-down-none">
            <span className="nav-link" onClick={this.showYoutubeHelp}><i className="fa fa-youtube-play"></i></span>
          </NavItem>
          <UncontrolledDropdown nav direction="down">
            <DropdownToggle nav>
              <i className="fa fa-adjust"></i>
            </DropdownToggle>
            <DropdownMenu right>
              <SkinPicker />
            </DropdownMenu>
          </UncontrolledDropdown>
          <UncontrolledDropdown nav direction="down" onClick={this.trackShare}>
            <DropdownToggle nav>
              <i className="fa fa-share-alt"></i>
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem header tag="div" className="text-center">
                <strong className="share-header-text">Share or rate this tool</strong>
              </DropdownItem>
              <div className="share-items">
                <a href={ratingUrl} target="_blank" rel="noopener noreferrer" title="Click to rate this tool or add a comment in chrome web store">
                  <i className="fa fa-star pull-left"></i>
                </a>
                <a href={gMailShare} target="_blank" rel="noopener noreferrer" title="Share with GMail">
                  <i className="fa fa-envelope pull-left"></i>
                </a>
                <a href={gPlusShare} target="_blank" rel="noopener noreferrer" title="Share with Google+">
                  <i className="fa fa-google-plus-square pull-left"></i>
                </a>
                <a href={linkedInShare} target="_blank" rel="noopener noreferrer" title="Share with Linked in">
                  <i className="fa fa-linkedin-square pull-left"></i>
                </a>
                <a href={fackbookShare} target="_blank" rel="noopener noreferrer" title="Share with Facebook">
                  <i className="fa fa-facebook-square pull-left"></i>
                </a>
                <a href={twitterShare} target="_blank" rel="noopener noreferrer" title="Share with Twitter" >
                  <i className="fa fa-twitter-square pull-left"></i>
                </a>
              </div>
            </DropdownMenu>
          </UncontrolledDropdown>
          <NavItem className="d-md-down-none">
            <NavLink to={`/${this.userId}/feedback`} className="nav-link"><i className="fa fa-bug" title="Report a bug or suggest a new feature"></i></NavLink>
          </NavItem>
        </Nav>
        {showYoutubeVideo && <YoutubeVideo onHide={this.hideYoutube} />}
        {/*<AppAsideToggler className="d-md-down-none"><span className="fa fa-bars" /></AppAsideToggler>*/}
        {/*<AppAsideToggler className="d-lg-none" mobile />*/}
      </React.Fragment >
    );
  }
}

DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

export default DefaultHeader;
