import React, { useState, createContext, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { Header, HeaderGlobalAction, HeaderGlobalBar, HeaderMenuButton, HeaderName, SideNav, SideNavItems, SideNavLink, Theme } from '@carbon/react';
import {Home, UserAvatar, Folders, Group, GroupResource, ServerDns, CloudLogging, Compare} from '@carbon/react/icons';
import { ActiveTabProvider } from './use-active-tab/UseActiveTab';
import "./_Navigation.scss";

// Create a context for sharing the active tab
// export const ActiveTabContext = createContext<string>('');

const Navigation: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('Dashboard');

  const handleNavLinkClick = (tab: string) => {
    setActiveTab(tab);
    console.log("handleNavLinkClick tab", tab);
  };


  React.useEffect(() => {
    if (location.pathname === '#/') {
      setActiveTab('Welcome Folks...');
    } else if (location.pathname === '#/dashboard') {
      setActiveTab('Dashboard');
    } else if (location.pathname === '#/summary') {
      setActiveTab('Summary');
    } else if (location.pathname === '#/leaderboard') {
      setActiveTab('BigCodeBench Leaderboard');
    } else if (location.pathname === '#/model-comparison') {
      setActiveTab('Model Comparison');
    } else if (location.pathname === '#/model-server-logs') {
      setActiveTab('Model Server Logs');
    }
  }, [location]);

  console.log("Nav activeTab:", activeTab);
  
  return (
    <>
    <ActiveTabProvider value={activeTab}>
      <Theme theme="g90">
        <Header
          aria-label="IBM Code-assist"
          className={`navigation-menu`}
        >
          
          <HeaderMenuButton
            aria-label={'Global navigation'}
            id="header-menu-button"
          />
          <HeaderName
            prefix=""
          >
            {/* Code-assist */}
            <img alt="IBM code-assist Logo" src={`${process.env.PUBLIC_URL}/ibm-code-assist-logo.svg`} width={175} height={47} title="IBM code-assist" />
          </HeaderName>
          <SideNav
            id="side-nav"
            aria-label={'Side navigation'}
            isRail
          >
            <SideNavItems>
              <SideNavLink renderIcon={Home} href="#/dashboard" onClick={() => handleNavLinkClick('Dashboard')}>
                Dashboard
              </SideNavLink>
              <SideNavLink renderIcon={Folders} href="#/summary" onClick={() => handleNavLinkClick('Summary')}>
                Summary
              </SideNavLink>
              <SideNavLink renderIcon={Group} href="#/leaderboard" onClick={() => handleNavLinkClick('BigCodeBench Leaderboard')}>
                BigCodeBench Leaderboard
              </SideNavLink>
              <SideNavLink renderIcon={Compare} href="#/model-comparison" onClick={() => handleNavLinkClick('Model Comparison')}>
                Model Comparison
              </SideNavLink>
              {/* <SideNavLink renderIcon={CloudLogging} href="#/model-server-logs" onClick={() => handleNavLinkClick('Model Server Logs')}>
                Model Server Logs
              </SideNavLink> */}
            </SideNavItems>
          </SideNav>
          <HeaderGlobalBar>
            <HeaderGlobalAction
              className={`profile-trigger-button`}
              aria-label={'Profile'}
            >
              <UserAvatar size={25} />
            {/* <HeaderMenu aria-label="User" menuLinkName="User">
              <HeaderMenuItem href="#">Profile</HeaderMenuItem>
              <HeaderMenuItem isActive href="#">
                Settings
              </HeaderMenuItem>
              <HeaderMenuItem href="#">LogOut</HeaderMenuItem>
            </HeaderMenu> */}
            </HeaderGlobalAction>
          </HeaderGlobalBar>
        </Header>
      </Theme>
      {children}
    </ActiveTabProvider>
    </>
  );
}

export default Navigation;