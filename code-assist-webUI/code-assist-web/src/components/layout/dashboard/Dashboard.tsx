import React, { useState } from 'react';
import "./_Dashboard.scss";
import { Button, Column, Grid, Tile } from '@carbon/react';
import { useLocation, useNavigate } from "react-router-dom";
import { ActiveTabProvider } from '../navigation/use-active-tab/UseActiveTab';
// import PassGraph from '../../pass-graph/PassGraph';
// import PassMethodList from '../../pass-method-list/PassMethodList';
// import EvaluationMetrics from '../../evaluation-metrics/EvaluationMetrics';

const Dashboard: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('Dashboard');

  const handleNavLinkClick = (tab: string) => {
    setActiveTab(tab);
  };

  React.useEffect(() => {
      if (location.pathname === '#/model-comparison') {
        setActiveTab('Model Comparison');
      }
  }, [location]);

  return (
    <ActiveTabProvider value={activeTab}>
      <div className="dashboard">

        {/* <div className="dashboard-content">
          <Grid fullWidth narrow className="page-content">
              <Column lg={16}>
                  <PassGraph />
              </Column>
              <Column lg={16}>
                  <PassMethodList />
              </Column> */}
              {/* <Column lg={16}>
                  <EvaluationMetrics />
              </Column> */}
          {/* </Grid>
        </div> */}

        <div style={{ padding: "2rem", minHeight: "calc(100vh - 240px)" }}>
          <div className="dashboard-content">
            <Grid fullWidth narrow className="page-content" style={{ gap: "0.5rem 0"}}>
              <Column lg={16} md={8} sm={4}>
              <div style={{ padding: "0 0 2rem 0", marginBottom: "1rem" }}>
                <h2>
                  Welcome to the IBM Code Assist
                </h2>
                <p style={{ paddingInline: "0.4rem"}}>
                  Explore the latest model comparison and evaluation in AI-based granite models.
                </p>
              </div>
              </Column>
              <Column lg={8} md={4} sm={4}>
                <Tile style={{ padding: "1.2rem", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-evenly" }}>
                  <h2 style={{ color: "#0f62fe" }}>Try the Model Comparison</h2>
                  <p>Access the interface for granite model comparison.</p>
                  <Button
                    kind="primary"
                    href={
                      window.location.hostname === "ibm-oss-support.github.io"
                        ? "https://ibm-oss-support.github.io/Continue.dev-Granite-manual-test-cases#/model-comparison"
                        : "#/model-comparison"
                    }
                    onClick={() => handleNavLinkClick('Model Comparison')}
                    style={{ marginTop: "1rem", maxWidth: "100%" }}
                  >
                    Launch Model Comparison
                  </Button>
                </Tile>
              </Column>
              <Column lg={8} md={4} sm={4}>
                <Tile style={{ padding: "1.2rem", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-evenly" }}>
                  <h2 style={{ color: "#0f62fe" }}>Learn More</h2>
                  <p>Explore IBM watsonx Code Assistant and other AI tools for developers.</p>
                  <Button
                    kind="secondary"
                    href="https://www.ibm.com/products/watsonx-code-assistant"
                    target="_blank"
                    style={{ marginTop: "1rem", maxWidth: "100%" }}
                  >
                    Visit IBM watsonx Code Assistant
                  </Button>
                </Tile>
              </Column>
            </Grid>
          </div>
        </div>
      </div>
    </ActiveTabProvider>
  );
};

export default Dashboard;