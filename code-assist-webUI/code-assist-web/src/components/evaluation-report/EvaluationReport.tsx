import React, { useState } from "react";
import {
  Button,
  Column,
  Grid,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Pagination,
} from "@carbon/react";
import { GaugeChart, ScaleTypes, LineChart } from "@carbon/charts-react";
import "@carbon/charts/styles.css"; // Import Carbon Styles
import "./_EvaluationReport.scss";
import codeAssistData from "../../code-assist-data.json"; 

// Define the type for the data item
interface DataItem {
  Method: string;
  "Number of Problems Evaluated": number;
  "Duration": string;
  "Pass@1": string;
  "BLEU Score": string;
  Observation: string;
  Response: string;
  Issue: string;
}

const headers: { key: keyof DataItem; header: string }[] = [
  { key: "Method", header: "Method" },
  { key: "Number of Problems Evaluated", header: "Number of Problems Evaluated" },
  { key: "Duration", header: "Duration" },
  { key: "Pass@1", header: "Pass@1" },
  { key: "BLEU Score", header: "BLEU Score" },
  { key: "Observation", header: "Observation" },
  { key: "Response", header: "Response" },
  { key: "Issue", header: "Issue" },
];

interface MethodData {
  Name: string;
  Data: DataItem[]; // Use the DataItem type here
}

const EvaluationReport: React.FC = () => {
  const [data] = useState(codeAssistData["0"] || []);
  const [showAll, setShowAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedMethodData, setSelectedMethodData] = useState<MethodData | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // Initial page size set to 5
  const [modalPage, setModalPage] = useState(1);
  const [modalPageSize, setModalPageSize] = useState(5); // Initial page size set to 5

  const openModal = (methodName: string) => {
    const methodData = data.find((row) => row.Name === methodName);

    if (methodData) {
      setSelectedMethodData({
        Name: methodData.Name,
        Data: methodData.Data, // Pass the entire Data array, not just the filtered rows
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMethodData(null);
  };

  // Calculate average Pass@1 and BLEU Score for the selected method
  const calculateOverallAverages = () => {
    let totalPassRate = 0;
    let totalBleuScore = 0;
    let totalTimeTaken = 0;
    let totalEntries = 0;
  
    data.forEach((method) => {
      method.Data.forEach((item) => {
        const passValue = parseFloat(item["Pass@1"]);
        const bleuValue = parseFloat(item["BLEU Score"]);
        const timeTaken = parseFloat(item["Duration"]);
  
        if (!isNaN(passValue)) {
          totalPassRate += passValue;
          totalEntries++;
        }
  
        if (!isNaN(bleuValue)) {
          totalBleuScore += bleuValue;
        }
  
        if (!isNaN(timeTaken)) {
          totalTimeTaken += timeTaken;
        }
      });
    });
  
    return {
      overallPassRate: totalEntries > 0 ? (totalPassRate / totalEntries) * 100 : 0,
      overallBleuScore: totalEntries > 0 ? Math.min(totalBleuScore / totalEntries, 100) : 0,
      averageTimeTaken: totalEntries > 0 ? totalTimeTaken / totalEntries : 0,
    };
  };

  const timeTakenData = data.map((method) => ({
    group: "Average Time Taken",
    key: method.Name,
    value:
      method.Data.reduce((acc, item) => acc + parseFloat(item["Duration"] || ''), 0) /
      method.Data.length,
  }));
  
  const { overallPassRate, overallBleuScore } = calculateOverallAverages();
  
  const overallPassRateGaugeData = [{ group: "value", value: overallPassRate }];
  const overallBleuScoreGaugeData = [{ group: "value", value: overallBleuScore }];

  const passRateGaugeOptions = {
    theme: "g90",
    title: "Average Pass@1 Rate in % for All Tests",
    height: '250px',
    width: '100%',
    resizable: true,
    toolbar: {
      enabled: false,
    },
    gauge: {
      type: "semi",
      status: overallPassRate > 70 ? "success" : overallPassRate > 40 ? "warning" : "danger",
    },
  };

  const bleuScoreGaugeOptions = {
    theme: "g90",
    title: "Average BLEU Score in % for All Tests",
    height: '250px',
    width: '100%',
    resizable: true,
    toolbar: {
      enabled: false,
    },
    gauge: {
      type: "semi",
      status: overallBleuScore > 50 ? "success" : overallBleuScore > 25 ? "warning" : "danger",
    },
  };

  const timeTakenLineOptions = {
    theme: "g90",
    title: "Average Time Taken per Method for All Tests",
    height: '300px',
    width: '100%',
    resizable: true,
    axes: {
      bottom: { title: "Method", mapsTo: "key", scaleType: ScaleTypes.LABELS }, // Changed from "string" to ScaleTypes.LABELS
      left: { title: "Time Taken (ms)", mapsTo: "value", scaleType: ScaleTypes.LINEAR }
    },
  };

  const handlePageChange = ({ page, pageSize }: { page: number; pageSize: number }) => {
    setPage(page);
    setPageSize(pageSize);
  };

  const handleModalPageChange = ({ page, pageSize }: { page: number; pageSize: number }) => {
    setModalPage(page);
    setModalPageSize(pageSize);
  };

  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);
  const modalPaginatedData = selectedMethodData?.Data.slice((modalPage - 1) * modalPageSize, modalPage * modalPageSize) || [];

  return (
    <div className="evaluation-report">
      <Grid fullWidth narrow className="page-content">
        <Column lg={16}>
          <div className="heading-wrap">
            <h3>Al Chat Models</h3>
          </div>
        </Column>
        {data.map((row, index) => (
          <Column key={index} lg={5} md={5} sm={5} className="gauge-container">
            <Button 
              kind="tertiary"
              className="card-btn"
              size="xl"
              onClick={() => openModal(row.Name)}>
              {row.Name}
            </Button>
          </Column>
        ))}

        <Column lg={5} md={5} sm={5} className="content-tile">
          <Button 
            kind="tertiary"
            className={showAll ? 'card-btn active' : 'card-btn'}
            size="xl"
            onClick={() => setShowAll(!showAll)}>
            {showAll ? "View All Data" : "Hide Data"}
          </Button>
        </Column>
      </Grid>

      {showModal && selectedMethodData && (
        <Modal
          open={showModal}
          modalHeading={`Detailed Summary of ${selectedMethodData.Name}`}
          passiveModal
          onRequestClose={closeModal}
          size="lg"
        >
          <Grid fullWidth narrow>
            <Column lg={16} md={16} sm={16}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader key={header.key}>{header.header}</TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {modalPaginatedData.map((item, idx) => (
                      <TableRow key={idx}>
                        {headers.map((header) => (
                          <TableCell key={header.key}>
                            {item[header.key] || "N/A"}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Pagination
                  backwardText="Previous page"
                  forwardText="Next page"
                  itemsPerPageText="Items per page:"
                  page={modalPage}
                  pageNumberText="Page Number"
                  pageSize={modalPageSize}
                  pageSizes={[5, 10, 20]} // Default page sizes
                  totalItems={selectedMethodData.Data.length}
                  onChange={handleModalPageChange}
                />
              </TableContainer>
            </Column>
          </Grid>
        </Modal>
      )}

      {!showAll && (
        <>
          <Grid fullWidth narrow className="page-content">
            <Column lg={16} className="content-tile">
              <TableContainer title="Detailed Summary Results">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>Name</TableHeader>
                      {headers.map((header) => (
                        <TableHeader key={header.key}>{header.header}</TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedData.map((row, idx) => (
                      row.Data.map((item, idx2) => (
                        <TableRow key={`${idx}-${idx2}`}>
                          <TableCell>{row.Name}</TableCell>
                          {headers.map((header) => (
                            <TableCell key={header.key}>
                              {item[header.key] || "N/A"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ))}
                  </TableBody>
                </Table>
                <Pagination
                  backwardText="Previous page"
                  forwardText="Next page"
                  itemsPerPageText="Items per page:"
                  page={page}
                  pageNumberText="Page Number"
                  pageSize={pageSize}
                  pageSizes={[5, 10, 20]} // Default page sizes
                  totalItems={data.length}
                  onChange={handlePageChange}
                />
              </TableContainer>
            </Column>
          </Grid>
          <Grid fullWidth narrow className="page-content">
            <Column lg={8} className="gauge-tile">
              <LineChart
                data={timeTakenData}
                options={timeTakenLineOptions}
              />
            </Column>
            <Column lg={4} className="gauge-tile">
              <GaugeChart data={overallPassRateGaugeData} options={passRateGaugeOptions} />
            </Column>
            <Column lg={4} className="gauge-tile">
              <GaugeChart data={overallBleuScoreGaugeData} options={bleuScoreGaugeOptions} />
            </Column>
          </Grid>
        </>
      )}
    </div>
  );
};

export default EvaluationReport;