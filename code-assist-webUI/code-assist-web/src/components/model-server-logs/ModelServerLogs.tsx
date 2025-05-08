import React, { useEffect, useState } from "react";
import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Modal,
  Grid,
  Column,
  CodeSnippet,
  Pagination,
  Loading,
  Tile,
  Accordion,
  AccordionItem,
  Button,
  Dropdown,
  ComboButton,
  MenuItem,
} from "@carbon/react";
import { Download } from "@carbon/icons-react";
import "./_ModelServerLogs.scss";

interface LogFile {
  name: string;
  date: string;
  rawDate: string;
}

const headers: { key: keyof LogFile; header: string }[] = [
  { key: "name", header: "Log File Name" },
  { key: "date", header: "Generated Date" },
];

const GITHUB_USERNAME = "IBM-OSS-Support";
const REPO_BRANCH = "gh-pages";
const GITHUB_LOG_URL = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/IBM-Code-Assist-Web-UI/${REPO_BRANCH}/logs`;

const LogsTable: React.FC = () => {
  const [logFiles, setLogFiles] = useState<LogFile[]>([]);
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [logContent, setLogContent] = useState<string | null>(null);
  const [logSummary, setLogSummary] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const formatDate = (dateStr: string) => {
    const date = new Date(
      `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}T${dateStr.substring(9, 11)}:${dateStr.substring(11, 13)}:${dateStr.substring(13, 15)}`
    );
    return {
      formatted: date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).replace(",", ""),
      raw: date.toISOString(),
    };
  };

  const extractLogValues = (logText: string) => {
    const patterns = [
      "general.basename str",
      "llm_load_print_meta: general.name",
    //   "general.size_label str",
    //   "llm_load_print_meta: model params",
      "llm_load_print_meta: model size",
      "ggml_metal_init: found device",
      "ggml_metal_init: GPU name",
      "ggml_metal_init: recommendedMaxWorkingSetSize"
    ];
  
    const extracted: Record<string, string> = {};
  
    for (const pattern of patterns) {
      const escapedPattern = pattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`${escapedPattern}\\s*[:=]\\s*(.+)`);
      const match = logText.match(regex);
      if (match) {
        extracted[pattern] = match[1].trim();
      }
    }
  
    return extracted;
  };

  useEffect(() => {
    const fetchLogFiles = async () => {
      try {
        const logsJsonUrl = `${GITHUB_LOG_URL}/logs.json`;
        const response = await fetch(logsJsonUrl);
        if (!response.ok) throw new Error("Failed to fetch log files");
        const files: string[] = await response.json();

        const formattedFiles: LogFile[] = files.map((file) => {
          const fileNameWithoutLogs = file.replace("logs/", "");
          const match = fileNameWithoutLogs.match(/_(\d{8}_\d{6})/);
          const { formatted, raw } = match ? formatDate(match[1]) : { formatted: "Unknown Date", raw: "0" };
          return { name: fileNameWithoutLogs, date: formatted, rawDate: raw };
        });

        const sortedFiles = formattedFiles.sort((a, b) =>
          new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime()
        );

        setLogFiles(sortedFiles);
      } catch (error) {
        console.error("Error fetching log files:", error);
      }
    };

    fetchLogFiles();
  }, []);

  const fetchLogContent = async (fileName: string) => {
    try {
      setIsLoading(true);
      setSelectedLog(fileName);
      setIsModalOpen(true);

      const logFileUrl = `${GITHUB_LOG_URL}/${fileName}`;
      const response = await fetch(logFileUrl);
      if (!response.ok) throw new Error("Failed to fetch log content");
      const content = await response.text();

      setLogContent(content);
      const summary = extractLogValues(content);
      setLogSummary(summary);
    } catch (error) {
      console.error("Error fetching log content:", error);
      setLogContent("⚠️ Failed to load content.");
      setLogSummary({});
    } finally {
      setIsLoading(false);
    }
  };

  const downloadLog = (format: "json" | "csv" | "log") => {
    if (!selectedLog || !logContent) return;
  
    let blob: Blob;
    let filename = selectedLog;
  
    if (format === "json") {
      blob = new Blob([JSON.stringify({ content: logContent }, null, 2)], {
        type: "application/json",
      });
      filename = filename.replace(".log", ".json");
    } else if (format === "csv") {
      // Treating the entire log file as a single column in CSV
      const csvContent = `"log_content"\n"${logContent.replace(/"/g, '""')}"`;
      blob = new Blob([csvContent], { type: "text/csv" });
      filename = filename.replace(".log", ".csv");
    } else {
      blob = new Blob([logContent], { type: "text/plain" });
    }
  
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFiles = logFiles.slice(startIndex, endIndex);

  return (
    <div className="model-server-logs-wrap">
      <Grid fullWidth narrow className="page-content">
        <Column sm={4} md={8} lg={16}>
          <div className="heading-wrap">
            <h3>Log Files</h3>
          </div>
        </Column>

        <Column sm={4} md={8} lg={16}>
          <div style={{ marginBottom: "1rem" }}>
            <Dropdown
              id="log-dropdown"
              titleText="Select a Log File"
              label="Choose a log"
              items={logFiles}
              itemToString={(item) => (item ? item.name : "")}
              onChange={({ selectedItem }) => {
                if (selectedItem) {
                  fetchLogContent(selectedItem.name);
                }
              }}
            />
          </div>
          {/* <DataTable
            rows={paginatedFiles.map((f, i) => ({
              id: `${startIndex + i}`,
              ...f,
            }))}
            headers={headers}
          >
            {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
              <TableContainer>
                <Table {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader {...getHeaderProps({ header })} key={header.key}>
                          {header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow {...getRowProps({ row })} key={row.id}>
                        {row.cells.map((cell) => (
                          <TableCell
                            key={cell.id}
                            onClick={() => fetchLogContent(row.cells.find(cell => cell.info.header === "name")?.value)}
                            style={{
                              cursor: cell.info.header === "name" ? "pointer" : "default",
                              color: cell.info.header === "name" ? "#e4e4e4" : "inherit",
                              height: "4.7rem",
                            }}
                          >
                            <div className="cell-content">
                              <p style={{ height: "1.3rem" }}></p>
                              <span>{cell.value}</span>
                              {cell.info.header === "name" && cell.value && (
                                <p>Click on the Log File Name ({cell.value}) to view its content.</p>
                              )}
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>

          <Pagination
            totalItems={logFiles.length}
            pageSize={itemsPerPage}
            pageSizes={[5, 10, 20, 30]}
            onChange={({ page, pageSize }) => {
              setCurrentPage(page);
              setItemsPerPage(pageSize);
            }}
            page={currentPage}
          /> */}
        </Column>
      </Grid>
      {isLoading ? (
          <div className="loader-wrap" style={{ padding: "1rem" }}>
            <Loading />
          </div>
        ) : (
                <Modal
                    open={isModalOpen}
                    modalHeading={`Log Content: ${selectedLog}`}
                    passiveModal
                    onRequestClose={() => setIsModalOpen(false)}
                    size="lg"
                >
                    
                    <>
                        {Object.keys(logSummary).length > 0 && (
                            <div>
                                <div style={{ margin: "1rem 0", display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                                    <Button kind="tertiary" renderIcon={Download} onClick={() => downloadLog("json")}>Download JSON</Button>{" "}
                                    <Button kind="tertiary" renderIcon={Download} onClick={() => downloadLog("csv")}>Download CSV</Button>{" "}
                                    <Button kind="tertiary" renderIcon={Download} onClick={() => downloadLog("log")}>Download .log</Button>
                                </div>
                                <Tile className="log-summary-tile">
                                    <h4>Log Summary</h4>
                                    <div className="log-summary-content">
                                        {Object.entries(logSummary).map(([key, value]) => {
                                            const labelMap: Record<string, string> = {
                                                "general.basename str": "Basename:",
                                                "llm_load_print_meta: general.name": "General Name:",
                                                "llm_load_print_meta: model size": "Model Size:",
                                                "ggml_metal_init: found device": "User Device:",
                                                "ggml_metal_init: GPU name": "GPU Name:",
                                                "ggml_metal_init: recommendedMaxWorkingSetSize": "Recommended GPU Memory:"
                                            };
                                            return (
                                                <p key={key} style={{ marginBottom: "0.5rem" }}>
                                                    <strong style={{ color: "#08BDBA" }}>{labelMap[key] || key}</strong>{" "}
                                                    <span style={{ color: "#F1C21B" }}>{value}</span>
                                                </p>
                                            );
                                        })}
                                    </div>
                                </Tile>
                            </div>
                        )}

                        <CodeSnippet
                        key={`${selectedLog}-${Date.now()}`}
                        type="multi"
                        feedback="Copied to clipboard"
                        className="log-content-snippet"
                        >
                        {logContent || "No content available"}
                        </CodeSnippet>
                    </>
                </Modal>
            )}
    </div>
  );
};

export default LogsTable;
