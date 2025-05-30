import React from "react";
import { ScatterChart } from "@carbon/charts-react";
import { ScaleTypes } from "@carbon/charts";
import "@carbon/charts/styles.css";
import './_PassGraph.scss';
import codeAssistData from "../../code-assist-data.json";
import { ThemeContext, ThemeContextType } from "../layout/theme-context/ThemeContext";

interface ChartDataItem {
  group: string;
  x: string;
  y: number;
}

interface PassGraphState {
  data: ChartDataItem[];
}

class PassGraph extends React.Component<{}, PassGraphState> {
  static contextType = ThemeContext;
  context!: ThemeContextType;
  

  constructor(props: {}) {
    super(props);
    this.state = {
      data: [],
    };
  }

  componentDidMount() {
    const currentTheme = this.context?.themeType;
    const aggregatedData: Record<string, { totalScore: number; count: number }> = {};

    Object.values(codeAssistData).forEach((models: any) => {
      models.forEach((model: any) => {
        const modelName = model.Name;
        if (!aggregatedData[modelName]) {
          aggregatedData[modelName] = { totalScore: 0, count: 0 };
        }

        model.Data.forEach((method: any) => {
          const passAt1 = method["Pass@1"];
          if (passAt1 !== "Not applicable" && passAt1 !== undefined) {
            let score = parseFloat(passAt1) * 100;
            aggregatedData[modelName].totalScore += score;
            aggregatedData[modelName].count += 1;
          }
        });
      });
    });

    const chartData: ChartDataItem[] = Object.entries(aggregatedData).map(([name, { totalScore, count }]) => {
      let avgScore = count > 0 ? totalScore / count : 0;
      avgScore = Math.min(avgScore, 100);
      let formattedScore = avgScore.toFixed(4);
      let lastDigit = parseInt(formattedScore.charAt(formattedScore.length - 1));

      if (lastDigit >= 5) {
        formattedScore = (Math.round(avgScore * 1000) / 1000).toFixed(3);
      } else {
        formattedScore = formattedScore.slice(0, -1);
      }

      return {
        group: name,
        x: name,
        y: parseFloat(formattedScore),
      };
    });

    this.setState({ data: chartData });
  }

  render() {
    const context = this.context;
    const theme = context?.themeType || 'g100'; // ✅ Pull live theme from context

    const options = {
      title: "",
      theme: theme,
      axes: {
        bottom: {
          title: "Model Name",
          mapsTo: "x",
          scaleType: ScaleTypes.LABELS,
        },
        left: {
          title: "Pass@1 Score (%)",
          mapsTo: "y",
          scaleType: ScaleTypes.LINEAR,
        },
      },
      height: "600px",
    };

    return (
      <div className="pass-graph-wrap">
        <div className="heading-wrap">
          <h3>Pass@1 Scores Comparison</h3>
        </div>
        <ScatterChart data={this.state.data} options={options} />
      </div>
    );
  }
}

export default PassGraph;
