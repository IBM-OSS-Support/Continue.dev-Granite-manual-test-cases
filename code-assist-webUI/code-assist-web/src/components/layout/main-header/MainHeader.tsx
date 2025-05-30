import React from "react";
import "./_MainHeader.scss";
import { useActiveTab } from '../navigation/use-active-tab/UseActiveTab';

const MainHeader: React.FC = () => {
    const activeTab = useActiveTab();

    return (
        <div className="main-heading-wrap">
            <div className="main-heading">
                <h1>{activeTab}</h1>
            </div>
        </div>
    );
}

export default MainHeader;