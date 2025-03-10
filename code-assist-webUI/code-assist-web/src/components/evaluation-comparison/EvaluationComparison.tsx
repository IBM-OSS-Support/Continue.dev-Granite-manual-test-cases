import React, { useEffect, useState } from "react";
import { Column, Grid, ComboBox, Button, Checkbox, DatePickerSkeleton, DatePicker, DatePickerInput, RadioButton, RadioButtonGroup } from "@carbon/react";
import "./_EvaluationComparison.scss";

const ModelComparison = () => {
    const [serverIP, setServerIP] = useState<string>(""); // Dynamically fetched server IP
    const [serverPort] = useState<number>(5001); // Default backend port
    const [selectedGranite, setSelectedGranite] = useState<string | null>(null);
    const [selectedOther, setSelectedOther] = useState<string | null>(null);
    const [compareClicked, setCompareClicked] = useState<boolean>(false);
    const [solidBackgrounds, setSolidBackgrounds] = useState<{ [modelName: string]: boolean }>({});
    const [selectedQuestions, setSelectedQuestions] = useState<{ [modelName: string]: string }>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedDates, setSelectedDates] = useState<{ [modelName: string]: string | null }>({});
    const [compareOption, setCompareOption] = useState<string>("other");
    const [modelsData, setModelsData] = useState<any[]>([]);
    const [apiError, setApiError] = useState<string | null>(null);
    const [availableFiles, setAvailableFiles] = useState<string[]>([]);

    interface Model {
        name: string;
        desc: string;
        prompt: { user: string; assistant: string; }[];
    }

    // Fetch backend server IP dynamically
    useEffect(() => {
        console.log("Fetching Server IP...", serverIP);
        
        const fetchServerIP = async () => {
            try {
                const response = await fetch("http://localhost:5001/server-ip");
                if (!response.ok) throw new Error("Failed to fetch server IP");

                const data = await response.json();
                console.log("Fetched Server IP:", data.ip);

                if (!serverIP) {
                    setServerIP(data.ip); // Set IP dynamically
                }
            } catch (error) {
                console.error("Error fetching server IP:", error);
                setServerIP("localhost"); // Fallback to localhost
            }
        };

        fetchServerIP();
    }, []); // Runs only once on mount

    // Define backend URL dynamically
    const BASE_URL = `http://${serverIP || "localhost"}:${serverPort}`;

    // Fetch available JSON files
    useEffect(() => {
        if (!serverIP) return;

        const fetchFileNames = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/files`);
                if (!response.ok) throw new Error("Failed to fetch files");
                const files = await response.json();
                setAvailableFiles(files);
            } catch (error) {
                console.error("Error fetching files:", error);
                setApiError("Failed to fetch available files. Please try again later.");
            }
        };

        fetchFileNames();
    }, [serverIP]); // Runs when `serverIP` is set

    // Fetch models data from available files
    useEffect(() => {
        if (!serverIP || availableFiles.length === 0) return;

        const fetchModelData = async () => {
            setIsLoading(true);
            setApiError(null);

            try {
                const responses = await Promise.all(
                    availableFiles.map(file =>
                        fetch(`${BASE_URL}/api/files/${file}`).then(r => r.json())
                    )
                );

                const allModels = responses.flatMap(response =>
                    Array.isArray(response) ? response : []
                );

                setModelsData(allModels);
            } catch (error) {
                console.error("Error fetching models:", error);
                setApiError("Failed to fetch models. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchModelData();
    }, [serverIP, availableFiles]);

    // Filter models based on type
    const graniteModels = Array.from(new Set(
        modelsData.filter(model => model.name.toLowerCase().includes("granite"))
            .map(model => model.name)
    ));

    const otherModels = Array.from(new Set(
        modelsData.filter(model => !model.name.toLowerCase().includes("granite"))
            .map(model => model.name)
    ));

    const getModelDetails = (name: string): Model | undefined => {
        return modelsData.find((model) => model.name === name);
    };

    const handleCompare = () => {
        if (selectedGranite && selectedOther) {
            setIsLoading(true);
            setTimeout(() => {
                setCompareClicked(true);
                setIsLoading(false);
            }, 2000);
        }
    };

    const handleClear = () => {
        setSelectedGranite(null);
        setSelectedOther(null);
        setCompareClicked(false);
        setSolidBackgrounds({});
        setSelectedQuestions({});
    };

    return (
        <div className="evaluation-comparison-wrap">
            <Grid fullWidth narrow className="page-content">
                <Column lg={16}>
                    <div className="heading-wrap">
                        <h3>Select Models for Comparison</h3>
                        <p>Server IP: {serverIP || "Fetching..."}</p> {/* Display fetched server IP */}
                    </div>
                </Column>
                <Column lg={16}>
                    <div className="compare-option-wrap">
                        <RadioButtonGroup
                            legendText="Compare with:"
                            name="compare-option"
                            defaultSelected="other"
                            onChange={(value) => setCompareOption(value as string)}
                            disabled={isLoading}
                        >
                            <RadioButton labelText="Compare with Other AI Models" value="other" id="other-radio" />
                            <RadioButton labelText="Compare with Other Granite Models" value="granite" id="granite-radio" />
                        </RadioButtonGroup>
                    </div>
                </Column>
                <Column lg={16}>
                    <Grid narrow>
                        <Column lg={6}>
                            <ComboBox
                                id="granite-model-combo-box"
                                items={graniteModels}
                                itemToString={(item) => (item ? item : '')}
                                onChange={({ selectedItem }) => setSelectedGranite(selectedItem as string)}
                                selectedItem={selectedGranite} 
                                titleText="Select a Granite Model"
                                placeholder="Choose a Granite model"
                                disabled={isLoading}
                            />
                        </Column>
                        <Column lg={6}>
                            <ComboBox
                                id="other-model-combo-box"
                                items={compareOption === "granite" ? graniteModels : otherModels}
                                itemToString={(item) => (item ? item : '')}
                                onChange={({ selectedItem }) => setSelectedOther(selectedItem as string)}
                                selectedItem={selectedOther} 
                                titleText="Select Other AI Model"
                                placeholder="Choose other AI model"
                                disabled={isLoading}
                            />
                        </Column>
                        <Column lg={4}>
                            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                                <Button onClick={handleCompare} disabled={!selectedGranite || !selectedOther || isLoading}>Compare</Button>
                                <Button onClick={handleClear} kind="danger" disabled={!selectedGranite && !selectedOther || isLoading}>Clear</Button>
                            </div>
                        </Column>
                    </Grid>
                </Column>
                {apiError && 
                    <Column lg={16}>
                        <div style={{ color: "red", textAlign: "center", marginTop: "20px" }}>
                            {apiError}
                        </div>
                    </Column>
                }
            </Grid>
        </div>
    );
};

export default ModelComparison;
