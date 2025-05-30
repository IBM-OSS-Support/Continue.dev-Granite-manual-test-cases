import React, { useEffect, useState, useCallback, useRef } from "react";
import { DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@carbon/react";
import { Pagination } from "@carbon/react";
import './_PassMethodList.scss'

// Headers for the table
const headers = [
  { key: "name", header: "Name" },
  { key: "pass1Score", header: "Pass@1 Score" }
];

interface CodeAssistDataType {
  [key: string]: Array<{
    Name: string;
    Data: Array<{
      Method: string;
      "Number of Problems Evaluated": number;
      Duration: string;
      "Pass@1": string | number;
      "BLEU Score": string;
      Observation: string;
      Response: string;
      Issue: string;
    }>;
  }>;
}

interface SortedScore {
  id: string;
  name: string;
  pass1Score: string;
}

const PassMethodList = () => {
  const [scores, setScores] = useState<SortedScore[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Use useRef to store JSON data
  const codeAssistData = useRef<CodeAssistDataType>(require('../../code-assist-data.json')).current;

  useEffect(() => {
    // Aggregate Pass@1 scores by Name
    const nameScoresMap = Object.keys(codeAssistData).reduce((acc, key) => {
      const items = codeAssistData[key];

      items.forEach(({ Name, Data }) => {
        if (!acc[Name]) {
          acc[Name] = { totalScore: 0, count: 0 };
        }

        Data.forEach(({ "Pass@1": passScore }) => {
          let score = parseFloat(passScore as string); // Convert to number safely
          if (!isNaN(score)) {
            score *= 100; // Convert from decimal to percentage
            acc[Name].totalScore += score;
            acc[Name].count += 1;
          }
        });
      });

      return acc;
    }, {} as Record<string, { totalScore: number; count: number }>);

    // Convert aggregated data to sorted list
    const sortedScores: SortedScore[] = Object.entries(nameScoresMap).map(([name, { totalScore, count }]) => {
      let avgScore = count > 0 ? totalScore / count : 0; // Compute average
      avgScore = Math.min(avgScore, 100); // Ensure max is 100%

      // Convert to 3 decimal places and round appropriately
      let formattedScore = avgScore.toFixed(4); // Keep 4 decimal places
      let lastDigit = parseInt(formattedScore.charAt(formattedScore.length - 1)); // Get the last digit

      if (lastDigit >= 5) {
        formattedScore = (Math.round(avgScore * 1000) / 1000).toFixed(3); // Round up
      } else {
        formattedScore = formattedScore.slice(0, -1); // Remove last digit, keep 3 decimals
      }

      return {
        id: name,
        name,
        pass1Score: `${formattedScore}%`, // Append `%`
      };
    }).sort((a, b) => parseFloat(b.pass1Score) - parseFloat(a.pass1Score));
    setScores(sortedScores);
  }, []);

  const handlePageChange = useCallback((event: any) => {
    const newPage = event.selected + 1;
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  }, [currentPage]);

  const handlePageSizeChange = useCallback((event: any) => {
    const newPageSize = event.selectedItem;
    if (newPageSize !== rowsPerPage) {
      setRowsPerPage(newPageSize);
      setCurrentPage(1);
    }
  }, [rowsPerPage]);

  // Get paginated rows
  const currentRows = scores.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="pass-method-wrap">
      <div className="heading-wrap">
        <h3>Leaderboard</h3>
      </div>
      <DataTable rows={currentRows} headers={headers} render={({ rows, headers, getHeaderProps }) => (
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableHeader {...getHeaderProps({ header })}>
                  {header.header}
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={headers.length}>No Data Available</TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id}>{cell.value}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )} />
      <Pagination
        page={currentPage - 1}
        pageSize={rowsPerPage}
        totalItems={scores.length}
        onChange={handlePageChange}
        backwardText="Previous"
        forwardText="Next"
        itemsPerPageText="Items per page"
        pageSizes={[5, 10, 20]}
      />
    </div>
  );
};

export default PassMethodList;
