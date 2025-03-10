import React, { useEffect, useState } from "react";
import { Column, Grid, ComboBox, Button, Checkbox, DatePickerSkeleton, DatePicker, DatePickerInput, RadioButton, RadioButtonGroup } from "@carbon/react";
import "./_EvaluationComparison.scss";

const ModelComparison = () => {
    const [selectedGranite, setSelectedGranite] = useState<string | null>(null);
    const [selectedOther, setSelectedOther] = useState<string | null>(null);
    const [compareClicked, setCompareClicked] = useState<boolean>(false);
    const [solidBackgrounds, setSolidBackgrounds] = useState<{ [modelName: string]: boolean }>({});
    const [selectedQuestions, setSelectedQuestions] = useState<{ [modelName: string]: string }>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedDates, setSelectedDates] = useState<{ [modelName: string]: string | null }>({});
    const [compareOption, setCompareOption] = useState<string>("other"); // 'granite' or 'other'
    const [modelsData, setModelsData] = useState<any[]>([]); // State to store fetched models data
    const [apiError, setApiError] = useState<string | null>(null); // State to handle API errors
    const [availableFiles, setAvailableFiles] = useState<string[]>([]); // State to store available files
    const [serverIP, setServerIP] = useState("localhost");
    const [serverPort, setServerPort] = useState<number>(5001); // Default to 5001

    interface Model {
        name: string;
        desc: string;
        prompt: { user: string; assistant: string; }[];
    }

    const getBackendURL = () => {
        // Use the frontend's origin to determine backend URL
        if (window.location.hostname === "localhost") {
            console.log("🛠 Local development");
            return "http://localhost:5001"; // Local development
        } else {
            console.log("🚀 Fyre Machine");
            return "http://9.20.192.160:5001"; // Fyre Machine IP
        }
    };
    
    const fetchServerIP = async () => {
        try {
            const backendURL = getBackendURL();
            const response = await fetch(`${backendURL}/server-ip`);
            const data = await response.json();
    
            if (data.ip) {
                console.log("✅ Server IP:", data.ip);
                return data.ip;
            } else {
                console.warn("⚠️ No IP found in response:", data);
                return "localhost";
            }
        } catch (error) {
            console.error("❌ Error fetching server IP:", error);
            return "localhost";
        }
    };

    // Fetch server IP on component mount
    useEffect(() => {
        console.log(process.env.REACT_APP_MACHINE_IP, "Fetching server IP...", serverIP, "serverPort", serverPort);
        fetchServerIP().then(ip => setServerIP(ip));
    }, [serverIP, serverPort]);

    useEffect(() => {
        fetchServerIP().then(ip => setServerIP(ip));
    }, []);

    // Fetch available files on component mount
    useEffect(() => {
        const fetchFileNames = async () => {
            try {
                const response = await fetch(`http://${serverIP}:${serverPort}/api/files`);
                if (!response.ok) throw new Error("Failed to fetch files");
                const files = await response.json();
                setAvailableFiles(files);
            } catch (error) {
                console.error("Error fetching files:", error);
                setApiError("Failed to fetch available files. Please try again later.");
            }
        };
        if (serverIP !== "localhost") {
            fetchFileNames();
        }
    }, [serverIP, serverPort]);

    // Fetch models data when compare option changes
    useEffect(() => {
        const fetchModelData = async () => {
            setIsLoading(true);
            setApiError(null);
            try {
                // Fetch data from all files
                const responses = await Promise.all(
                    availableFiles.map(file => 
                        fetch(`http://${serverIP}:${serverPort}/api/files/${file}`)
                            .then(r => r.json())
                    )
                );

                // Flatten the responses into a single array
                const allModels = responses.flatMap(response => 
                    Object.values(response).flat()
                );
                
                setModelsData(allModels);
            } catch (error) {
                console.error("Error fetching models:", error);
                setApiError("Failed to fetch models. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        if (availableFiles.length > 0) {
            fetchModelData();
        }
    }, [availableFiles, serverIP, serverPort]);

    // Prepare model lists
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
            }, 2000); // Simulate a delay for loading
        }
    };

    const handleClear = () => {
        setSelectedGranite(null);
        setSelectedOther(null);
        setCompareClicked(false);
        setSolidBackgrounds({});
        setSelectedQuestions({});
    };

    const formatPromptWithCodeTags = (prompt: string): React.ReactNode => {
        const regex = /'''(.*?)'''/gs;
        let lastIndex = 0;
        const parts: React.ReactNode[] = [];

        prompt.replace(regex, (match, codeBlock, offset) => {
            parts.push(
                prompt.slice(lastIndex, offset).split("\n").map((line, index) => (
                    <React.Fragment key={`${offset}-text-${index}`}>
                        {line}
                        <br />
                    </React.Fragment>
                ))
            );

            parts.push(
                <code key={offset} style={{ backgroundColor: "#101010", padding: "2px 10px", borderRadius: "4px", display: "block" }}>
                    {codeBlock.split("\n").map((line: string, index: number) => (
                        <React.Fragment key={`${offset}-code-${index}`}>
                            {line}
                            <br />
                        </React.Fragment>
                    ))}
                </code>
            );

            lastIndex = offset + match.length;
            return match;
        });

        parts.push(
            prompt.slice(lastIndex).split("\n").map((line, index) => (
                <React.Fragment key={`end-text-${index}`}>
                    {line}
                    <br />
                </React.Fragment>
            ))
        );

        return <>{parts}</>;
    };

    return (
        <div className="evaluation-comparison-wrap">
            <Grid fullWidth narrow className="page-content">
                <Column lg={16}>
                    <div className="heading-wrap">
                        <h3>Select Models for Comparison</h3>
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
                                key={selectedGranite}
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
                                key={selectedOther}
                                id="other-model-combo-box"
                                items={compareOption === "granite" ? graniteModels : otherModels}
                                itemToString={(item) => (item ? item : '')}
                                onChange={({ selectedItem }) => setSelectedOther(selectedItem as string)}
                                selectedItem={selectedOther} 
                                titleText={compareOption === "granite" ? "Select Another Granite Model" : "Select Other AI Model"}
                                placeholder={compareOption === "granite" ? "Choose another Granite model" : "Choose other AI model"}
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

                {isLoading && 
                    <Column lg={16}>
                        <div className="skeleton-wrap" style={{ display: "flex", width: "300px", height: "560px", alignItems: "center", justifyContent: "center", margin: "4rem auto 0" }}>
                            <DatePickerSkeleton range />
                        </div>
                    </Column>
                }
                {apiError && 
                    <Column lg={16}>
                        <div style={{ color: "red", textAlign: "center", marginTop: "20px" }}>
                            {apiError}
                        </div>
                    </Column>
                }
                {compareClicked && selectedGranite && selectedOther && !isLoading && modelsData && (
                    <Column lg={16}>
                        <div style={{ display: "flex", justifyContent: "space-around", marginTop: "20px" }}>
                            {[selectedGranite, selectedOther].map((modelName) => {
                                const model = getModelDetails(modelName);
                                if (!model) return null;

                                const questionNumbers = ["All", ...model.prompt.map((_, index) => `Question ${index + 1}`)];
                                const selectedQuestion = selectedQuestions[model.name] || "All";

                                return (
                                    <div key={model.name} style={{ flex: 1, padding: "10px", border: "1px solid #ddd", borderRadius: "8px", margin: "0 5px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <h4 style={{ textTransform: "capitalize", marginBottom: "10px", marginTop: "0" }}>{model.name}</h4>
                                        </div>
                                        
                                        <p><strong>Description:</strong> {model.desc}</p>

                                        <div style={{ margin: "0.5rem 0"}}>
                                            <Grid fullWidth narrow>
                                                <Column lg={8} md={8} sm={4}>
                                                    <ComboBox
                                                        id={`question-combo-box-${model.name}`}
                                                        className="question-combo-box"
                                                        items={questionNumbers}
                                                        itemToString={(item) => (item ? item : '')}
                                                        onChange={({ selectedItem }) => setSelectedQuestions((prev) => ({ ...prev, [model.name]: selectedItem as string }))}
                                                        selectedItem={selectedQuestion}
                                                        titleText="Select a Question"
                                                    />
                                                </Column>
                                                <Column lg={8} md={8} sm={4}>
                                                    <DatePicker 
                                                        datePickerType="single"
                                                        className="question-date-picker"
                                                        maxDate={new Date().setDate(new Date().getDate())}
                                                        onChange={(eventOrDates) => {
                                                            const dateValue = Array.isArray(eventOrDates) ? eventOrDates[0] : eventOrDates;
                                                            setSelectedDates((prev) => ({ ...prev, [model.name]: dateValue ? dateValue.toISOString() : null }));
                                                        }}
                                                    >
                                                        <DatePickerInput
                                                            id={`date-picker-${model.name}`}
                                                            placeholder="mm/dd/yyyy"
                                                            labelText="Select a Date"
                                                            defaultValue={selectedDates[model.name] || ""}
                                                        />
                                                    </DatePicker>
                                                </Column>
                                            </Grid>
                                        </div>
                                        
                                        <p>
                                            <strong>Prompt:</strong>
                                        </p>
                                        <div>
                                            <Checkbox
                                                id={`solid-background-toggle-${model.name}`}
                                                className="solid-background-toggle"
                                                labelText="Remove Prompt Background Wallpaper"
                                                checked={solidBackgrounds[model.name] || false}
                                                onChange={() => setSolidBackgrounds((prev) => ({ ...prev, [model.name]: !prev[model.name] }))}
                                                style={{ float: "right" }}
                                            />
                                        </div>
                                        <div className={solidBackgrounds[model.name] ? "chat-screen solid-bg" : "chat-screen"}>
                                            <ul>
                                                {selectedQuestion === "All" ? (
                                                    model.prompt.map((prompt, index) => (
                                                        <li key={index}>
                                                            <div className="user-message-bubble">
                                                                <strong>User</strong>
                                                                {formatPromptWithCodeTags(prompt.user)}
                                                            </div>
                                                            <div className="assistant-message-bubble">
                                                                <strong>Assistant</strong>
                                                                {formatPromptWithCodeTags(prompt.assistant)}
                                                            </div>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li>
                                                        <div className="user-message-bubble">
                                                            <strong>User</strong>
                                                            {formatPromptWithCodeTags(model.prompt[parseInt(selectedQuestion.split(" ")[1]) - 1].user)}
                                                        </div>
                                                        <div className="assistant-message-bubble">
                                                            <strong>Assistant</strong>
                                                            {formatPromptWithCodeTags(model.prompt[parseInt(selectedQuestion.split(" ")[1]) - 1].assistant)}
                                                        </div>
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Column>
                )}
            </Grid>
        </div>
    );
};

export default ModelComparison;