import React, { useEffect, useState } from "react";
import { Column, Grid, ComboBox, Button, Checkbox, DatePickerSkeleton, DatePicker, DatePickerInput, RadioButton, RadioButtonGroup, Tag, Dropdown, CodeSnippet, Tooltip, Loading, Modal, Tile, CodeSnippetSkeleton, ButtonSkeleton, DropdownSkeleton, OrderedList, ListItem, ProgressBar } from "@carbon/react";
import "./_EvaluationComparison.scss";
import { format, isValid, parse } from "date-fns";
import { Alarm, Close, Download, FilterRemove, FilterReset, FlashFilled, Help, Hourglass } from "@carbon/react/icons";
import { se } from "date-fns/locale";


// GitHub configuration
const GITHUB_USERNAME = "IBM-OSS-Support";
const REPO_BRANCH = "gh-pages";
const GITHUB_INDEX_URL = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/IBM-Code-Assist-Web-UI/${REPO_BRANCH}/code-assist-webUI/code-assist-web/src/prompt-results/index.json`;
const GITHUB_BASE_URL = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/IBM-Code-Assist-Web-UI/${REPO_BRANCH}/code-assist-webUI/code-assist-web/src`;
const GITHUB_LOG_URL = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/IBM-Code-Assist-Web-UI/${REPO_BRANCH}/logs`;

interface Model {
    name: string;
    date: string;
    file_name: string;
    total_time: string
    prompt: { user: string; assistant: string; }[];
}
interface LogFile {
    name: string;
    date: string;
    rawDate: string;
  }

const ModelComparison = () => {
    const [selectedGranite, setSelectedGranite] = useState<string | null>(null);
    const [selectedOther, setSelectedOther] = useState<string | null>(null);
    const [compareClicked, setCompareClicked] = useState<boolean>(false);
    const [solidBackgrounds, setSolidBackgrounds] = useState<{ [modelName: string]: boolean }>({});
    const [selectedQuestions, setSelectedQuestions] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedDates, setSelectedDates] = useState<{ [modelName: string]: string | null }>({});
    const [modelsData, setModelsData] = useState<Model[]>([]);
    const [apiError, setApiError] = useState<string | null>(null);
    const [availableFiles, setAvailableFiles] = useState<string[]>([]);
    const [allFileNames, setAllFileNames] = useState<string[]>([]);
    const [noResultsFound, setNoResultsFound] = useState<boolean>(false);
    const [serverIP, setServerIP] = useState("localhost");
    const [serverPort, setServerPort] = useState<number>(5005);
    const [filteredFileNames, setFilteredFileNames] = useState<string[]>([]);
    const [selectedResults, setSelectedResults] = useState<{ [key: string]: string }>({});
    const [codeAssistData, setCodeAssistData] = useState<any>(null);
    const [modelScores, setModelScores] = useState<{[key: string]: string}>({});
    const [usingGitHub, setUsingGitHub] = useState(false);
    const [fastestTime, setFastestTime] = useState<number | null>(null);
    const [filteredPrompts, setFilteredPrompts] = useState<{ [key: string]: any[] }>({});
    const [logFiles, setLogFiles] = useState<LogFile[]>([]);
    const [selectedLog, setSelectedLog] = useState<string | null>(null);
    const [logContent, setLogContent] = useState<string | null>(null);
    const [logSummary, setLogSummary] = useState<Record<string, string>>({});
    const [isModalOpen, setIsModalOpen] = useState<string | null>(null);
    const [logSummaryByModel, setLogSummaryByModel] = useState<{ [key: string]: Record<string, string> }>({});
    const [progress, setProgress] = useState(0);
    const [progressSize, setProgressSize] = useState(728); // Default size in KB
    const [logFilesByModel, setLogFilesByModel] = useState<{ [key: string]: LogFile[] }>({});
    const [isDownloadingLogByModel, setIsDownloadingLogByModel] = useState<{ [key: string]: boolean }>({});
    const [downloadedLogFileByModel, setDownloadedLogFileByModel] = useState<{ [key: string]: string | null }>({});
    const [selectedLogByModel, setSelectedLogByModel] = useState<{ [key: string]: string | null }>({});
    const [logContentByModel, setLogContentByModel] = useState<{ [key: string]: string | null }>({});

    // Modified backend URL detection with GitHub fallback
    const getBackendURL = () => {
        if (window.location.hostname === "localhost") {
            return "http://localhost:5005";
        } else if (window.location.hostname === "ibm-oss-support.github.io") {
            setUsingGitHub(true);
            return (usingGitHub);
        } else {
            return "http://9.20.192.160:5005";
        }
    };

    // Unified data fetching
    useEffect(() => {
        const fetchDataSources = async () => {
            try {
                // Try GitHub first
                const githubResponse = await fetch(GITHUB_INDEX_URL);
                if (githubResponse.ok) {
                    const indexData = await githubResponse.json();
                    setAvailableFiles(Object.keys(indexData));
                    setUsingGitHub(true);
                    return;
                }
            } catch (githubError) {
                console.log('Falling back to local server');
            }
            
            // Fallback to local server
            try {
                const response = await fetch(`http://${serverIP}:${serverPort}/api/models`);
                if (!response.ok) throw new Error("Failed to fetch files");
                const files = await response.json();
                setAvailableFiles(files);
                setUsingGitHub(false);
            } catch (error) {
                console.error("Error fetching files:", error);
                setApiError("Failed to fetch available files from both GitHub and local server.");
            }
        };

        fetchDataSources();
    }, [serverIP, serverPort]);

    // Unified model data fetcher
    useEffect(() => {
        const fetchModelData = async () => {
            setIsLoading(true);
            setApiError(null);
            setNoResultsFound(false);
        
            // Helper: Extract the latest file for a model based on timestamp
            const getLatestFileName = (fileList: string[], modelName: string) => {
                const regex = new RegExp(`${modelName.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')}_([0-9]{8}T[0-9]{6})\\.json`);
                
                const sorted = fileList
                    .map(file => {
                        const match = file.match(regex);
                        if (!match) return null;
        
                        const timestamp = match[1];
                        const date = new Date(
                            Number(timestamp.slice(0, 4)),
                            Number(timestamp.slice(4, 6)) - 1,
                            Number(timestamp.slice(6, 8)),
                            Number(timestamp.slice(9, 11)),
                            Number(timestamp.slice(11, 13)),
                            Number(timestamp.slice(13, 15))
                        );
        
                        return { file, date };
                    })
                    .filter(Boolean)
                    .sort((a, b) => b!.date.getTime() - a!.date.getTime());
        
                return sorted.length > 0 ? sorted[0]!.file : null;
            };
        
            try {
                const responses = await Promise.all(
                    availableFiles.map(async modelName => {
                        try {
                            if (window.location.hostname === "ibm-oss-support.github.io") {
                                // GitHub mode
                                const indexResponse = await fetch(GITHUB_INDEX_URL);
                                const filesIndex: Record<string, string[]> = await indexResponse.json();
                            
                                const modelFiles = filesIndex[modelName];
                                if (!modelFiles || modelFiles.length === 0) {
                                    throw new Error(`No files found for model: ${modelName}`);
                                }

                                // Fetch ALL files for this model
                                const validFiles = modelFiles
                                    .filter(file => 
                                        typeof file === 'string' && 
                                        file.trim() !== '' && 
                                        file.endsWith('.json')
                                    )
                            
                                // Fetch all files instead of just the latest
                                const fileResponses = await Promise.all(
                                    validFiles.map(async fileName => {
                                        const fileUrl = `${GITHUB_BASE_URL}/prompt-results/${fileName}`;
                                        const response = await fetch(fileUrl);
                                        if (!response.ok) throw new Error(`Failed to fetch ${fileUrl}`);
                                        return response.json();
                                    })
                                );
                            
                                const allValidFiles = validFiles
                                    .map(file => file.split('/').pop() || file); // Extract only the file name

                                // Add all valid files to allFileNames
                                setAllFileNames(prev => [
                                    ...new Set([
                                        ...prev,
                                        ...allValidFiles
                                    ])
                                ]);
                            
                                return fileResponses;
                            } else {
                                // Local development mode
                                let fileNames = await fetch(`http://${serverIP}:${serverPort}/api/models/${modelName}/files`)
                                    .then(r => r.json())
                                    .then(files => files.filter((f: any) => typeof f === 'string' && f.trim() !== ''));
        
                                fileNames = fileNames.flat();
        
                                const fileResponses = await Promise.all(
                                    fileNames.map(async (fileName: string) => {
                                        return fetch(`http://${serverIP}:${serverPort}/api/models/${modelName}/files/${fileName}`)
                                            .then((r: Response) => r.json() as Promise<string[]>);
                                    })
                                );
        
                                setAllFileNames(prev => {
                                    const newFiles = fileNames
                                        .filter((f: string) => 
                                            typeof f === 'string' && 
                                            f.trim() !== '' && 
                                            !prev.includes(f)
                                        );
                                    return [...prev, ...newFiles];
                                });
                                console.log(`local All files for ${modelName}:`, allFileNames);
                                
                                return fileResponses.flat();
                            }
                        } catch (error) {
                            console.error(`Error fetching ${modelName} data:`, error);
                            return [];
                        }
                    })
                );
        
                const allModels = responses.flatMap(response =>
                    Object.values(response).flatMap(entry =>
                        Array.isArray(entry) ? entry : [entry]
                    )
                );
        
                setModelsData(allModels);
        
                if (usingGitHub) {
                    setAllFileNames(prev => [
                        ...new Set([
                            ...prev,
                            ...allModels.map(m => m.file_name)
                                .filter(f => typeof f === 'string' && f.trim() !== '')
                        ])
                    ]);
                }
        
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
    }, [availableFiles, serverIP, serverPort, selectedDates, usingGitHub]);


    // Prepare model lists
    const flattenedModels = modelsData.flatMap(item => Object.values(item).flat());

    const graniteModels = Array.from(new Set(
        flattenedModels
            .filter(model => model.name && model.name.toLowerCase().includes("granite"))
            .map(model => model.name)
    ));


    const otherModels = Array.from(new Set(
        flattenedModels
            .filter(model => model.name && !model.name.toLowerCase().includes("granite"))
            .map(model => model.name)
    ));

    console.log("Granite Models:", graniteModels);
    console.log("Other Models:", otherModels);


    // Add null/undefined checks and safe defaults
    const parseFileName = (fileName?: string) => {
        // Add fallback for undefined/empty filename
        if (!fileName || typeof fileName !== 'string') {
        return {
            modelName: 'Invalid Filename',
            timestamp: '00000000T000000',
            fullName: 'invalid_filename.json'
        };
        }
    
        const match = fileName.match(/^(.+?)_(\d{8}T\d{6})\.json$/);
        
        return match ? {
        modelName: match[1], // "granite3.1:8b"
        timestamp: match[2], // "20250302T101520"
        fullName: fileName
        } : {
        modelName: 'Invalid Format',
        timestamp: '00000000T000000',
        fullName: fileName
        };
    };
  
  const getModelBaseName = (fileName: string) => {
    const parts = fileName.split('_');
    if (parts.length < 2) return fileName;
    return parts[0].split(':')[0].replace(/\d+\.\d+/g, ''); // "granite"
  };
  
    // Updating getModelDetails function
    const getModelDetails = (name: string): { model: Model | undefined; modelJsonFiles: string[] } => {
        if (!modelsData || !Array.isArray(allFileNames) || allFileNames.length === 0) {
          return { model: undefined, modelJsonFiles: [] };
        }
      
        // Add null check for parsed files
        const modelJsonFiles = allFileNames
          .map(fileName => parseFileName(fileName))
          .filter((file): file is NonNullable<ReturnType<typeof parseFileName>> => !!file)
          .filter(file => {
            const baseName = getModelBaseName(file.modelName);
            return baseName.toLowerCase() === name.toLowerCase();
          })    
          .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
          .map(file => file.fullName);
      
        // Add fallback for undefined modelData
        const modelData = (flattenedModels.find(m => m?.name === name) || {}) as Model;
      
        return { 
          model: modelData.name ? modelData : undefined,
          modelJsonFiles 
        };
    };      
    
    // update filtered files when dates change
    useEffect(() => {
        const updateFilteredFiles = () => {
          const newFilteredFiles: string[] = [];
          [selectedGranite, selectedOther].forEach(modelName => {
            if (modelName && selectedDates[modelName]) {
              const filtered = allFileNames.filter(fileName => {
                const parsed = parseFileName(fileName);
                if (!parsed) return false;
                const fileDate = parsed.timestamp.substr(0, 8); // "20250302"
                return fileDate === selectedDates[modelName]?.replace(/-/g, '');
              });
              newFilteredFiles.push(...filtered);
            }
          });
          setFilteredFileNames(newFilteredFiles);
        };
      
        updateFilteredFiles();
      }, [selectedDates, selectedGranite, selectedOther, allFileNames]);

    // Add this after line 153 in your EvaluationComparison.tsx file
    const countFilesForModel = (modelName: string) => {
        if (!Array.isArray(allFileNames)) return 0;
        
        return allFileNames
            .filter(fileName => {
                // Validate filename before processing
                if (typeof fileName !== 'string' || fileName.trim() === '') {
                    return false;
                }
                
                const parts = fileName.split('_');
                return parts.length > 0 && parts[0] === modelName.split('_')[0];
            })
            .length;
    };

    // Cleanup effect to remove empty strings from allFileNames
    useEffect(() => {
        setAllFileNames(prev => 
            prev.filter(f => typeof f === 'string' && f.trim() !== '')
        );
    }, []);


    // Update the useEffect that processes the models to determine the fastest time
    useEffect(() => {
        if (modelsData.length > 0) {
            // Find the fastest model
            const times = modelsData
                .filter(model => model.total_time)
                .map(model => Number(model.total_time));
                
            if (times.length > 0) {
                const fastest = Math.min(...times);
                setFastestTime(fastest);
            }
        }
    }, [modelsData]);
    

    // To handle auto-selection of single results
    useEffect(() => {
        [selectedGranite, selectedOther].forEach((modelName, index) => {
          if (!modelName) return;
      
          const { modelJsonFiles } = getModelDetails(modelName);
          const hasExistingSelection = !!selectedResults[`${modelName}-${index}`];
      
          if (!hasExistingSelection && modelJsonFiles && modelJsonFiles.length > 0) {
            const latestFile = modelJsonFiles[modelJsonFiles.length - 1];
      
            setSelectedResults(prev => ({
              ...prev,
              [`${modelName}-${index}`]: latestFile
            }));
          }
        });
      }, [selectedGranite, selectedOther, selectedDates]);
      
    
    console.log("availableFiles", availableFiles, "modelsData:", modelsData);
    console.log("Potentially problematic models:", modelsData.filter(model => !model.name));

    // for fetching pass@1 score fron code-assist-data.json file
    useEffect(() => {
        const fetchCodeAssistData = async () => {
            try {
                const backendURL = getBackendURL();
                const response = await fetch(`${GITHUB_BASE_URL}/code-assist-data.json`);
                const data = await response.json();
                setCodeAssistData(data);
                
                // Create score mapping
                const scores: {[key: string]: string} = {};
                Object.values(data).forEach((modelGroup: any) => {
                    modelGroup.forEach((model: any) => {
                        const validScores = model.Data.filter((d: any) => d["Pass@1"] && d["Pass@1"] !== "Not applicable")
                            .map((d: any) => parseFloat(d["Pass@1"]));
                        
                        if (validScores.length > 0) {
                            const averageScore = validScores.reduce((sum: number, score: number) => sum + score, 0) / validScores.length;
                            const percentage = Math.min(Math.max(averageScore * 100, 0), 100);
                            scores[model.Name] = `${percentage.toFixed(1)}%`;
                        }
                    });
                });
                setModelScores(scores);
            } catch (error) {
                console.error("Error fetching code assist data:", error);
            }
        };

        fetchCodeAssistData();
    }, []);

    // To Recalculate filteredPrompts
    // useEffect(() => {
    //     const updateFilteredPrompts = () => {
    //         const updatedPrompts: { [key: string]: any[] } = {};
    
    //         Object.keys(selectedResults).forEach((modelName) => {
    //             const selectedFileName = selectedResults[modelName];
    //             const model = modelsData.flatMap((entry) =>
    //                 Object.values(entry).flat()
    //             ).find((m) =>
    //                 m.name && modelName &&
    //                 m.name.toLowerCase().trim() === modelName.toLowerCase().trim() &&
    //                 m.file_name === selectedFileName && selectedFileName
    //             );
    
    //             if (model && selectedFileName) {
    //                 const parsedFile = parseFileName(selectedFileName);
    //                 if (parsedFile) {
    //                     const prompts = model.prompt.filter((prompt: { user: string; assistant: string }) => {
    //                         const promptDate = parsedFile.timestamp.substring(0, 8); // Extract date from the selected file
    //                         const createdAtDate = model.date.substring(0, 8); // Extract date from the model's date
    //                         return promptDate === createdAtDate;
    //                     });
    
    //                     updatedPrompts[modelName] = prompts;
    //                 }
    //             }
    //         });
    
    //         setFilteredPrompts(updatedPrompts);
    //     };
    
    //     updateFilteredPrompts();
    // }, [selectedResults, modelsData]);


    // To Fetch Log Files
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
            "llama_model_loader: - kv   2:                               general.name str",
            "llm_load_print_meta: model size",
            "ggml_metal_init: found device",
            "ggml_metal_init: GPU name",
            "ggml_metal_init: recommendedMaxWorkingSetSize",
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

    const fetchLogFiles = async (resultFileName: string, resultKey: string) => {
        try {
            console.log("Fetching log files for:", resultFileName); // Debugging
            const logsJsonUrl = `${GITHUB_LOG_URL}/logs.json`;
            const response = await fetch(logsJsonUrl);
            if (!response.ok) throw new Error("Failed to fetch log files");
            const files: string[] = await response.json();
    
            // Extract the model name from the result file name
            const modelName = resultFileName.split("_")[0];
            console.log("Extracted model name:", modelName); // Debugging
    
            // Filter files based on the model name and format
            const matchingFiles: LogFile[] = files
                .filter(file => file.includes(modelName) && file.match(`${modelName}_ollama_server_\\d{8}_\\d{6}\\.log`))
                .map(file => {
                    const match = file.match(/_(\d{8}_\d{6})/);
                    const { formatted, raw } = match ? formatDate(match[1]) : { formatted: "Unknown Date", raw: "0" };
                    return { name: file, date: formatted, rawDate: raw };
                });
    
            console.log("Matching log files:", matchingFiles); // Debugging
    
            // Sort files by date (newest first)
            const sortedFiles = matchingFiles.sort((a, b) =>
                new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime()
            );
    
            setLogFilesByModel((prev) => ({
                ...prev,
                [resultKey]: sortedFiles,
            }));
        } catch (error) {
            console.error("Error fetching log files:", error);
        }
    };

    const fetchLogContent = async (fileName: string, resultKey: string) => {
        try {
            setProgress(0); // Reset progress
            setDownloadedLogFileByModel((prev) => ({
                ...prev,
                [resultKey]: null,
            }));
            setIsDownloadingLogByModel((prev) => ({
                ...prev,
                [resultKey]: true,
            }));
            setSelectedLogByModel((prev) => ({
                ...prev,
                [resultKey]: fileName,
            }));
    
            const logFileUrl = `${GITHUB_LOG_URL}/${fileName}`;
            console.log("Fetching log file from URL:", logFileUrl); // Debugging
    
            const response = await fetch(logFileUrl, { method: "HEAD" });
            if (!response.ok) throw new Error("Failed to fetch log file metadata");
    
            // Get the file size from the Content-Length header
            const contentLength = response.headers.get("Content-Length");
            const fileSizeInKB = contentLength ? Math.ceil(Number(contentLength) / 1024) : 728; // Default to 728 KB if unavailable
            setProgressSize(fileSizeInKB);
    
            // Fetch the actual file content
            const fileResponse = await fetch(logFileUrl);
            if (!fileResponse.ok) throw new Error("Failed to fetch log content");
            const content = await fileResponse.text();
    
            // Extract log summary
            const summary = extractLogValues(content);
            setLogSummaryByModel((prev) => ({
                ...prev,
                [resultKey]: summary, // Store the log summary for the specific resultKey
            }));
    
            setLogContentByModel((prev) => ({
                ...prev,
                [resultKey]: content,
            }));
    
            // Animate progress
            const interval = setInterval(() => {
                setProgress((prev) => {
                    const advance = Math.random() * 10; // Simulate progress increment
                    if (prev + advance < fileSizeInKB) {
                        return prev + advance;
                    } else {
                        clearInterval(interval);
                        setIsDownloadingLogByModel((prev) => ({
                            ...prev,
                            [resultKey]: false,
                        }));
                        setDownloadedLogFileByModel((prev) => ({
                            ...prev,
                            [resultKey]: fileName,
                        }));
                        return fileSizeInKB;
                    }
                });
            }, 500); // Update every 500ms
        } catch (error) {
            console.error("Error fetching log content:", error);
            setLogContentByModel((prev) => ({
                ...prev,
                [resultKey]: "⚠️ Failed to load content.",
            }));
            setIsDownloadingLogByModel((prev) => ({
                ...prev,
                [resultKey]: false,
            }));
        }
    };

    useEffect(() => {
        Object.entries(selectedResults).forEach(([resultKey, selectedFileName]) => {
            if (selectedFileName) {
                console.log(`Fetching log files for pre-populated result: ${selectedFileName}`);
                fetchLogFiles(selectedFileName, resultKey);
            }
        });
    }, [selectedResults]);
    
    const downloadLog = (format: "json" | "csv" | "log", resultKey: string) => {
        const selectedLog = selectedLogByModel[resultKey];
        const logContent = logContentByModel[resultKey];
        if (!selectedLog || !logContent) return;
    
        let blob: Blob;
        let filename = selectedLog;
    
        if (format === "json") {
            blob = new Blob([JSON.stringify({ content: logContent }, null, 2)], {
                type: "application/json",
            });
            filename = filename.replace(".log", ".json");
        } else if (format === "csv") {
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
    
    // Function to Fetch Pass@1 Scores
    const fetchPassAt1Scores = async () => {
        try {
            setIsLoading(true);
            const url = "https://datasets-server.huggingface.co/rows?dataset=bigcode%2Fbigcodebench-results&config=default&split=train&offset=0&length=100";
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            
            const jsonData = await response.json();
            const scores: { [key: string]: string } = {};
    
            jsonData.rows.forEach((row: any) => {
                const modelName = row.row.model || "Unknown";
                const completePrompt = row.row.complete ?? 0;
                const instructPrompt = row.row.instruct ?? 0;
                const averageScore = ((completePrompt + instructPrompt) / 2);
                scores[modelName.trim()] = `${averageScore.toFixed(2)}%`;
            });
    
            console.log("Fetched Pass@1 Scores:", scores); // Debugging
            setModelScores(scores);
        } catch (error) {
            console.error("Error fetching Pass@1 scores:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPassAt1Scores();
    }, []);
    useEffect(() => {
        console.log("Log Summary:", logSummary);
    }, [logSummary]);

    const normalizeGraniteModelName = (modelName: string): string => {
        return modelName
            .replace(/:/g, "-") // Replace ":" with "-"
            .split("-") // Split by "-"
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
            .join("-"); // Join back with "-"
    };

    const getScoreAndTagType = (modelName: string) => {
        const normalizedModelName = normalizeGraniteModelName(modelName || '');
        console.log("Normalized Model Name:", normalizedModelName);
        console.log("Model Scores Keys:", Object.keys(modelScores));
    
        const matchingKey = Object.keys(modelScores).find((key) =>
            key.toLowerCase().includes(normalizedModelName.toLowerCase()) // Partial match
        );
    
        console.log("Matching Key in Model Scores:", matchingKey);
    
        const currentModelScoreRaw = matchingKey ? modelScores[matchingKey]?.split("%")[0]?.trim() : undefined;
        const comparingModelName = selectedGranite === modelName ? selectedOther : selectedGranite;
        const comparingKey = Object.keys(modelScores).find((key) =>
            key.toLowerCase().includes(normalizeGraniteModelName(comparingModelName ?? '').toLowerCase())
        );
        
        if (!comparingKey) {
            console.warn(`No matching key found in modelScores for: ${normalizeGraniteModelName(comparingModelName ?? '')}`);
        }
    
        const comparingModelScoreRaw = comparingKey ? modelScores[comparingKey]?.split("%")[0]?.trim() : undefined;
    
        console.log("Current Model Score Raw:", currentModelScoreRaw);
        console.log("Comparing Model Score Raw:", comparingModelScoreRaw);
    
        const currentScore = currentModelScoreRaw ? parseFloat(currentModelScoreRaw) : NaN;
        const comparingScore = comparingModelScoreRaw ? parseFloat(comparingModelScoreRaw) : NaN;
    
        let tagType: 'green' | 'red' | 'cyan' | 'outline';
    
        if (isNaN(currentScore) || isNaN(comparingScore)) {
            tagType = 'outline'; // Show outline if either score is unavailable
        } else if (currentScore > comparingScore) {
            tagType = 'green'; // Current model has a higher score
        } else if (currentScore < comparingScore) {
            tagType = 'red'; // Current model has a lower score
        } else {
            tagType = 'cyan'; // Scores are equal
        }
    
        const formattedScore = !isNaN(currentScore) ? `${currentScore.toFixed(2)}%` : 'N/A';
    
        return { formattedScore, tagType };
    };

    const handleCompare = () => {
        if (selectedGranite && selectedOther) {
          setIsLoading(true);
          setTimeout(() => {
            setCompareClicked(true);
            // fetchPassAt1Scores();
            getScoreAndTagType(selectedGranite || selectedOther || '');
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
        setSelectedDates({});
        setNoResultsFound(false);
        setSelectedResults({});
    };

    const formatPromptWithCodeTags = (prompt: string): React.ReactNode => {
        // Remove <user> and <assistant> tags from the prompt
        const cleanedPrompt = prompt.replace(/<\/?(user|assistant)>/g, '');
        const regex = /```(.*?)```/gs;
        let lastIndex = 0;
        const parts: React.ReactNode[] = [];
    
        cleanedPrompt.replace(regex, (match, codeBlock, offset) => {
            // Add text before code block
            parts.push(
                cleanedPrompt.slice(lastIndex, offset).split("\n").map((line, index) => (
                    <React.Fragment key={`${offset}-text-${index}`}>
                        {line}
                        <br />
                    </React.Fragment>
                ))
            );
    
            // Add code block
            parts.push(
                // <code key={offset} style={{ 
                //     backgroundColor: "#101010", 
                //     padding: "2px 10px", 
                //     borderRadius: "4px", 
                //     display: "block", 
                //     wordBreak: "break-word",
                //     margin: "8px 0",
                //     overflowX: "auto",
                //     letterSpacing: "0.025em",
                //     WebkitOverflowScrolling: "touch"
                // }}>
                <CodeSnippet key={offset} type="multi" feedback="Copied to clipboard">
                    {codeBlock.split("\n").map((line: string, index: number) => (
                        <React.Fragment key={`${offset}-code-${index}`}>
                            <span>{line}</span>
                            <br />
                        </React.Fragment>
                    ))}
                </CodeSnippet>
                // </code>
            );
    
            lastIndex = offset + match.length;
            return match;
        });
    
        // Add remaining text after last code block
        parts.push(
            cleanedPrompt.slice(lastIndex).split("\n").map((line, index) => (
                <React.Fragment key={`end-text-${index}`}>
                    {line}
                    <div></div>
                </React.Fragment>
            ))
        );
    
        return <>{parts}</>;
    };

    return (
        <div className="evaluation-comparison-wrap">
            <Grid fullWidth narrow className="page-content">
                <Column sm={4} md={8} lg={16}>
                    <div className="heading-wrap">
                        <h3>Select Models for Comparison</h3>
                    </div>
                </Column>
                <Column sm={4} md={8} lg={16}>
                    <div className="compare-option-wrap">
                        {/* <RadioButtonGroup
                            legendText="Compare with:"
                            name="compare-option"
                            defaultSelected="other"
                            onChange={(value) => setCompareOption(value as string)}
                            disabled={isLoading}
                        >
                            <RadioButton labelText="Compare with Other AI Models" value="other" id="other-radio" />
                            <RadioButton labelText="Compare with Other Granite Models" value="granite" id="granite-radio" />
                        </RadioButtonGroup> */}
                        <Grid narrow>
                            <Column sm={4} md={4} lg={6}>
                                <ComboBox
                                    key={selectedGranite}
                                    id="granite-model-combo-box"
                                    items={[...graniteModels, ...otherModels]}  // Combine both lists
                                    itemToString={(item) => (item ? item : '')}
                                    onChange={({ selectedItem }) => setSelectedGranite(selectedItem as string)}
                                    selectedItem={selectedGranite} 
                                    titleText="Select First Model"
                                    placeholder="Choose any model"
                                    disabled={isLoading}
                                    shouldFilterItem={({ item, inputValue }) => 
                                        item.toLowerCase().includes(inputValue?.toLowerCase() || '')
                                    }
                                />
                            </Column>
                            <Column sm={4} md={4} lg={6}>
                                <ComboBox
                                    key={selectedOther}
                                    id="other-model-combo-box"
                                    items={[...graniteModels, ...otherModels]}  // Combine both lists
                                    itemToString={(item) => (item ? item : '')}
                                    onChange={({ selectedItem }) => setSelectedOther(selectedItem as string)}
                                    selectedItem={selectedOther} 
                                    titleText="Select Second Model"
                                    placeholder="Choose any model"
                                    disabled={isLoading}
                                    shouldFilterItem={({ item, inputValue }) => 
                                        item.toLowerCase().includes(inputValue?.toLowerCase() || '')
                                    }
                                />

                            </Column>
                            <Column sm={4} md={8} lg={4}>
                                <div style={{ marginTop: "1.6rem", display: "flex", gap: "0.8rem" }}>
                                    <Button onClick={handleCompare} disabled={!selectedGranite || !selectedOther || isLoading}>Compare</Button>
                                    <Button onClick={handleClear} kind="danger" disabled={!selectedGranite && !selectedOther || isLoading}>Clear</Button>
                                </div>
                            </Column>
                        </Grid>
                    </div>
                </Column>

                {isLoading && 
                    <Column sm={4} md={8} lg={16}>
                        <div className="skeleton-wrap" style={{ display: "flex", width: "300px", height: "560px", alignItems: "center", justifyContent: "center", margin: "4rem auto 0" }}>
                            <DatePickerSkeleton range />
                        </div>
                    </Column>
                }

                {apiError && 
                    <Column sm={4} md={8} lg={16}>
                        <div style={{ color: "red", textAlign: "center", marginTop: "20px" }}>
                            {apiError}
                        </div>
                    </Column>
                }

                {compareClicked && selectedGranite && selectedOther && !isLoading ? (
                    <>
                        <Column sm={4} md={8} lg={16}>
                            <div style={{ display: "flex", justifyContent: "space-around", marginTop: "20px" }}>
                                {[selectedGranite, selectedOther].map((modelName, index) => {
                                    console.log("1.modelName:::>>", modelName);

                                    const model = getModelDetails(modelName);

                                    console.log("modelmodel::", model);

                                    // const fastestTime = Math.min(
                                    //     ...(model.model?.total_time !== undefined 
                                    //       ? [Number(model.model.total_time)]
                                    //       : [])
                                    //   );

                                // Initialize fastestTime if it's not set or is greater than the current model's time
                                    if (model?.model?.total_time && model.model?.total_time !== undefined) {
                                        const currentModelTime = Number(model.model.total_time);
                                        
                                        // Check if the current model time is a valid number
                                        if (!isNaN(currentModelTime) && (fastestTime === null || currentModelTime < fastestTime)) {
                                        setFastestTime(currentModelTime); // Update to the smallest time
                                        }
                                    }
                                    
                                    // Check if current model is the fastest
                                    const isFastest = model?.model?.total_time 
                                        ? Number(model.model.total_time) === fastestTime
                                        : false;

                                    console.log(
                                        `model :: time: ${model?.model?.total_time}, isFastest: ${isFastest}`
                                    );

                                    if (model) {
                                        const numberOfFiles = countFilesForModel(model.model?.name || '');
                                        console.log(`countFilesForModel for ${model}: ${numberOfFiles}`);
                                    }

                                    if (!model) return null;
                                    const resultKey = `${model?.model?.name}-${index}`;
                                    const questionKey = resultKey;
                                    const selectedFileName = selectedResults[resultKey];
                                    const selectedQuestion = selectedQuestions[questionKey] || "All";

                                    const questionOptions: string[] = ["All"];

                                    if (selectedFileName) {
                                        const matchingModel = modelsData
                                        .flatMap(entry => Object.values(entry).flat())
                                        .find(m => m.name === model?.model?.name && m.file_name === selectedFileName);
                                    
                                        if (matchingModel?.prompt) {
                                        matchingModel.prompt.forEach((prompt: any, idx: number) => {
                                            const userPrompt = prompt.user.replace(/<\/?(user|assistant)>/g, '').trim();
                                            const snippet = userPrompt.length > 100 ? userPrompt.slice(0, 100) + '...' : userPrompt;
                                            questionOptions.push(`Chat ${idx + 1}: ${snippet}`);
                                        });
                                        }
                                    }

                                    const filteredPrompts = modelsData
                                        .flatMap((entry) => Object.values(entry).flat())
                                        .filter((m) => m.name === model?.model?.name)
                                        .flatMap((m) => {
                                            const selectedFileName = selectedResults[`${model?.model?.name}-${index}`];
                                            if (selectedFileName && m.file_name === selectedFileName) {
                                                // Ensure the selected file's model name matches the current model name
                                                const parsedFile = parseFileName(selectedFileName);
                                                if (parsedFile?.modelName === model?.model?.name) {
                                                    return m.prompt || [];
                                                }
                                            }
                                            // If no result is selected, show the latest prompts
                                            if (!selectedFileName) {
                                                const latestFileName = model?.modelJsonFiles?.[model?.modelJsonFiles?.length - 1];
                                                if (latestFileName && m.file_name === latestFileName) {
                                                    return m.prompt || [];
                                                }
                                            }
                                            return [];
                                        })
                                        .filter((prompt) => {
                                            const modelName = model?.model?.name ?? '';

                                            console.log("modelName:::", modelName, "modelJsonFiles", model?.modelJsonFiles);

                                            // If no date is selected for this model, show all prompts
                                            if (!selectedDates[modelName]) {
                                                return true;
                                            }

                                            const createdAtDate = model?.model?.date ? new Date(
                                                Number(model?.model?.date.substring(0, 4)),
                                                Number(model?.model?.date.substring(4, 6)) - 1,
                                                Number(model?.model?.date.substring(6, 8)),
                                                Number(model?.model?.date.substring(9, 11)),
                                                Number(model?.model?.date.substring(11, 13))
                                            ) : null;

                                            console.log(`filteredPrompts -- createdAtDate for ${model?.model?.name}:`, createdAtDate);

                                            if (!createdAtDate || isNaN(createdAtDate.getTime())) return false;

                                            const formattedDate = createdAtDate.toLocaleDateString('en-GB').split('/').reverse().join('-');  // Convert to DD-MM-YYYY

                                            console.log(`filteredPrompts -- formattedDate for ${model?.model?.name}:`, formattedDate, `selectedDates[modelName]:`, selectedDates[modelName]);

                                            const getModelName = (): string | undefined => {
                                                return model?.model?.name;
                                            };

                                            return formattedDate === selectedDates[getModelName() ?? '']; // Ensure date formats match
                                        });

                                    // Store all selected files' prompts
                                    const allSelectedPrompts = Object.keys(selectedResults).reduce((acc, modelName) => {
                                        const selectedFileName = selectedResults[modelName];
                                        const model = modelsData.flatMap((entry) =>
                                            Object.values(entry).flat()
                                        ).find((m) =>
                                            m.name && modelName &&
                                            m.name.toLowerCase().trim() === modelName.toLowerCase().trim() &&
                                            m.file_name === selectedFileName && selectedFileName
                                        );
                                        console.log("allSelectedPrompts::", modelName, selectedFileName, model);
                                        

                                        if (model && selectedFileName) {
                                            const parsedFile = parseFileName(selectedFileName);
                                            if (parsedFile) {
                                                const prompts = model.prompt.filter((prompt: { user: string; assistant: string }) => {
                                                    // Match the selected file's timestamp with the prompt's creation date
                                                    const promptDate = parsedFile.timestamp.substring(0, 8); // Extract date from the selected file
                                                    const createdAtDate = model.date.substring(0, 8); // Extract date from the model's date
                                                    return promptDate === createdAtDate;
                                                });

                                                // Add the prompts to the accumulator with the JSON file name as the key
                                                acc[selectedFileName] = prompts;
                                            }
                                        }

                                        return acc;
                                    }, {} as { [key: string]: any[] });

                                    console.log("All Selected Prompts:", allSelectedPrompts);
                                    

                                    // Assuming you have access to the prompt's creation date (string or Date)
                                    // Grab the raw date
                                    const promptCreateRaw = model?.model?.date;

                                    // Convert safely to a Date object
                                    const parsedDate = promptCreateRaw
                                    ? parse(promptCreateRaw, "yyyyMMdd'T'HHmmss", new Date())
                                    : null;

                                    // Format only if valid
                                    const formattedPromptDate = parsedDate && isValid(parsedDate)
                                    ? format(parsedDate, 'dd MMM yyyy hh:mmaaa')
                                    : format(new Date(), 'dd MMM yyyy hh:mmaaa');


                                    console.log(`Model: ${model?.model?.name}, Selected Date: ${formattedPromptDate}`);
                                    console.log(`Prompts:`, model?.model?.prompt);
                                    console.log(`Filtered Prompts:`, filteredPrompts);

                                    const formatMillisecondsToTime = (ms: number): string => {
                                        const totalSeconds = Math.floor(ms / 1000);
                                        const hours = Math.floor(totalSeconds / 3600);
                                        const minutes = Math.floor((totalSeconds % 3600) / 60);
                                        const seconds = totalSeconds % 60;
                                    
                                        const parts = [];
                                        if (hours > 0) parts.push(`${hours} hr`);
                                        if (minutes > 0) parts.push(`${minutes} min`);
                                        if (seconds > 0 || parts.length === 0) parts.push(`${seconds} sec`);
                                    
                                        return parts.join(' ');
                                    };

                                    // getScoreAndTagType Passing model name
                                    const { formattedScore, tagType } = getScoreAndTagType(model?.model?.name ?? '');
                                    
                                    return (
                                        <div id={`chat-outter-wrap-${model.model?.name}`} className="chat-outter-wrap" key={`${model?.model?.name}-${index}`} style={{borderColor: tagType === 'green' ? 'green' : '', boxShadow: tagType === 'green' ? '0 0 3px 2px rgba(107, 116, 107, 0.4)' : ''}}>
                                            
                                            { tagType === 'green'
                                                    ? (
                                                        <div className="ribbon">
                                                            <span className="ribbon4">Recommended</span>
                                                        </div>
                                                    ) 
                                                    : (null)
                                            }
                                            
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <h4 style={{ textTransform: "capitalize", marginBottom: "10px", marginTop: "0" }}>{`Model-${index+1} :`} {model?.model?.name} 
                                                    {/* {
                                                    tagType === 'green' 
                                                        ? (<span style={{ fontSize: '0.8rem', padding: '0.4rem', color: '#069d37', borderRadius: '10rem' }}>Recommended</span>)
                                                        : ('')
                                                    } */}
                                                </h4>
                                            </div>

                                            <p><strong>Description:</strong> Currently No Description Available.</p>
                                            
                                            <div className="score-wrapper">
                                                <strong>Pass@1 Score</strong>
                                                <Tag className="score-capsule" size="md" type={tagType}>
                                                    {formattedScore}
                                                </Tag>
                                                {/* <Tag className="score-capsule" size="md"  type={
                                                    modelScores[selectedGranite] && modelScores[selectedOther]
                                                        ? parseFloat(
                                                            modelScores[normalizeGraniteModelName(model?.model?.name ?? '')]?.split(":")[0]?.trim() || '0'
                                                        ) >
                                                        parseFloat(
                                                            modelScores[selectedGranite === model?.model?.name ? selectedOther : selectedGranite]?.split(":")[0]?.trim() || '0'
                                                        )
                                                            ? 'green' // Current model has a higher score
                                                            : parseFloat(
                                                                modelScores[normalizeGraniteModelName(model?.model?.name ?? '')]?.split(":")[0]?.trim() || '0'
                                                            ) <
                                                            parseFloat(
                                                                modelScores[selectedGranite === model?.model?.name ? selectedOther : selectedGranite]?.split(":")[0]?.trim() || '0'
                                                            )
                                                            ? 'red' // Current model has a lower score
                                                            : 'cyan' // Scores are equal
                                                        : 'outline' // Default color if scores are not available
                                                }>
                                                    {(() => {
                                                        const modelName = model?.model?.name?.trim();
                                                        const normalizedModelName = normalizeGraniteModelName(modelName || '');
                                                        const scoreEntry = Object.entries(modelScores).find(([key]) => key.toLowerCase().includes(normalizedModelName.toLowerCase()));
                                                        if (scoreEntry) {
                                                            const rawScore = scoreEntry[1]?.split(":")[0]?.trim();
                                                            const formattedScore = rawScore ? (parseFloat(rawScore) / 100).toFixed(2) + "%" : "N/A";
                                                            return formattedScore;
                                                        }
                                                        return "N/A";
                                                    })()}
                                                </Tag> */}
                                            </div>

                                            <div className="time-taken-wrap">
                                                <p>
                                                    <strong>
                                                        Total Response Time{" "} <span><Help width={"0.75rem"} height={"0.75rem"} /></span>
                                                        :
                                                    </strong>
                                                    <span
                                                        style={{
                                                            paddingLeft: "0.3rem",
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            gap: "0.25rem",
                                                        }}
                                                    >
                                                    {typeof model?.model?.total_time === "number" && !isNaN(model.model.total_time)
                                                        ? (
                                                            fastestTime !== null && (
                                                                <>
                                                                    <span>{formatMillisecondsToTime(Number(model.model.total_time))}</span>
                                                                    {fastestTime === model.model.total_time && (
                                                                        <span className="flash-icon">
                                                                            <FlashFilled size={14} color="#facc15" strokeWidth={2} />
                                                                        </span>
                                                                    )}
                                                                </>
                                                            )
                                                        )
                                                        : "--"
                                                        }
                                                    </span>
                                                </p>
                                            </div>

                                            <div className="filter-wrap" style={{ margin: "0.5rem 0"}}>
                                                {/* {(selectedResults[`${model?.model?.name}-${index}`] || model?.modelJsonFiles?.length === 1) && (
                                                    <div className="filter-btn-wrap">
                                                        <Button
                                                            renderIcon={FilterRemove} 
                                                            iconDescription="Reset Filter" 
                                                            hasIconOnly
                                                            kind="danger--ghost"
                                                            size="md"
                                                            onClick={() => {
                                                                const compositeKey = `${model?.model?.name}-${index}`;
                                                                setSelectedQuestions(prev => ({ ...prev, [compositeKey]: "All" }));
                                                                setSelectedResults(prev => ({ ...prev, [compositeKey]: '' }));
                                                                setSelectedDates(prev => ({ ...prev, [modelName]: null }));
                                                            }}
                                                            disabled={
                                                                !selectedResults[`${model?.model?.name}-${index}`] &&
                                                                !selectedDates[model?.model?.name as string]
                                                            }
                                                            style={{ 
                                                                marginTop: "0.8rem",
                                                                padding: "0.5rem 1rem",
                                                                width: "3rem",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                float: "right",
                                                                display: !selectedResults[`${model?.model?.name}-${index}`] ? "none" : "block"
                                                            }}
                                                        />
                                                    </div>
                                                )} */}
                                                <Grid fullWidth narrow>
                                                    <Column lg={8} md={8} sm={4}>
                                                        <ComboBox
                                                            key={`result-combo-${index}-${modelName}`}
                                                            id={`result-combo-box-${index}-${model?.model?.name}-${Math.random().toString(36).substr(2, 9)}`}
                                                            className="result-combo-box"
                                                            items={model?.modelJsonFiles || []}
                                                            itemToString={(item) => {
                                                                if (!item) return 'Select Result';
                                                                const parsed = parseFileName(item);
                                                                if (!parsed) return item;

                                                                // Format timestamp to DD-MM-YYYY HH:MM am/pm
                                                                const datePart = parsed.timestamp.substring(0, 8);
                                                                const timePart = parsed.timestamp.substring(9);
                                                                const year = datePart.substring(0, 4);
                                                                const month = datePart.substring(4, 6);
                                                                const day = datePart.substring(6, 8);

                                                                const hours = parseInt(timePart.substring(0, 2));
                                                                const minutes = timePart.substring(2, 4);
                                                                const ampm = hours >= 12 ? 'pm' : 'am';
                                                                const twelveHour = hours % 12 || 12;

                                                                return `${parsed.modelName}-${day}-${month}-${year} ${twelveHour}:${minutes}${ampm}`;
                                                            }}
                                                            onChange={({ selectedItem }) => {
                                                                const resultKey = `${model?.model?.name}-${index}`;
                                                                setSelectedResults((prev) => ({
                                                                    ...prev,
                                                                    [resultKey]: selectedItem as string,
                                                                }));
                                                                
                                                                const selectedFileName = selectedItem as string;
                                                                const filteredPrompts = modelsData
                                                                    .flatMap((entry) => Object.values(entry).flat())
                                                                    .filter((model) => model.file_name === selectedFileName)
                                                                    .flatMap((model) => model.prompt || []);
                                                            
                                                                setFilteredPrompts((prev) => ({
                                                                    ...prev,
                                                                    [resultKey]: filteredPrompts, // Make this unique too
                                                                }));

                                                                fetchLogFiles(selectedFileName, resultKey); // Fetch log files for the specific model
                                                            
                                                                console.log(`Filtered Prompts for ${resultKey}:`, filteredPrompts);
                                                            }}                                                        
                                                            selectedItem={selectedResults[`${model?.model?.name}-${index}`] || null}
                                                            titleText="Select a Result"
                                                            placeholder="Choose a result version"
                                                            shouldFilterItem={({ item, inputValue }) =>
                                                                item.toLowerCase().includes(inputValue?.toLowerCase() || '')
                                                            }
                                                            disabled={!model?.modelJsonFiles?.length}
                                                        />
                                                    </Column>
                                                    <Column lg={8} md={8} sm={4}>
                                                        <Dropdown
                                                            key={`question-combo-${index}-${modelName}`}
                                                            id={`question-combo-box-${index}-${model?.model?.name}-${Math.random().toString(36).substr(2, 9)}`}
                                                            className="question-combo-box"
                                                            items={questionOptions}
                                                            itemToString={(item) => (item ? item : '')}
                                                            onChange={({ selectedItem }) => { 
                                                                setSelectedQuestions((prev) => ({
                                                                    ...prev,
                                                                    [questionKey || 'default_key']: selectedItem as string,
                                                                }));
                                                        
                                                                // Extract the prompt text from the selected question
                                                                // const promptText = selectedItem?.split(": ")[1] || "";
                                                                // fetchLogFiles(promptText); // Fetch log files matching the prompt text
                                                            }}
                                                            selectedItem={selectedQuestion}
                                                            titleText="Select a Question"
                                                            label="Choose a question"
                                                        />
                                                    </Column>
                                                    {/* <Column lg={8} md={8} sm={4}> */}
                                                        {/* {selectedQuestions[`${model?.model?.name}-${index}`] !== "All" && (
                                                            <>
                                                                {selectedQuestions[`${model?.model?.name}-${index}`] && (
                                                                    isLoading || logFiles.length === 0 ? (
                                                                        <div className="skeleton-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "1rem 0 0" }}>
                                                                            <DropdownSkeleton />
                                                                        </div>
                                                                    ) : (
                                                                        <Dropdown
                                                                            id="log-dropdown"
                                                                            className="log-combo-box"
                                                                            titleText="Select a Log File"
                                                                            label="Choose a Log File"
                                                                            items={logFiles} // Use the filtered log files
                                                                            itemToString={(item) => (item ? item.name : "")}
                                                                            onChange={({ selectedItem }) => {
                                                                                if (selectedItem) {
                                                                                    fetchLogContent(selectedItem.name);
                                                                                }
                                                                            }}
                                                                        />
                                                                    )
                                                                )}
                                                            </>
                                                        )} */}
                                                        {selectedResults[`${model?.model?.name}-${index}`] && (
                                                            <>
                                                                {
                                                                    isLoading || !logFilesByModel[resultKey] ? (
                                                                        <Column lg={8} md={8} sm={4}>
                                                                            <div className="skeleton-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "1rem 0 0" }}>
                                                                                <DropdownSkeleton />
                                                                            </div>
                                                                        </Column>
                                                                    ) : logFilesByModel[resultKey]?.length === 0 ? (
                                                                        <Column lg={8} md={8} sm={4}>
                                                                            <div style={{ margin: "1rem 0", color: "#999" }}>
                                                                                No log files available.
                                                                            </div>
                                                                        </Column>
                                                                    ) : (
                                                                        <>
                                                                            <Column lg={8} md={8} sm={4}>
                                                                                {!isDownloadingLogByModel[resultKey] && !downloadedLogFileByModel[resultKey] && (
                                                                                    <Dropdown
                                                                                    id="log-dropdown"
                                                                                    className="log-combo-box"
                                                                                    titleText="Select a Log File"
                                                                                    label="Choose a Log File"
                                                                                    items={logFilesByModel[resultKey] || []}
                                                                                    itemToString={(item) => {
                                                                                        if (!item) return "";
                                                                                        return item.name.replace(/^logs\//, ""); // Remove "logs/" prefix
                                                                                    }}
                                                                                    onChange={({ selectedItem }) => {
                                                                                        if (selectedItem) {
                                                                                            fetchLogContent(selectedItem.name.replace(/^logs\//, ""), resultKey);
                                                                                        }
                                                                                    }}
                                                                                    />
                                                                                )}

                                                                                {isDownloadingLogByModel[resultKey] && (
                                                                                    <div style={{ marginTop: "1rem" }}>
                                                                                        <ProgressBar
                                                                                            label="Downloading Log File"
                                                                                            value={progress}
                                                                                            max={progressSize}
                                                                                            status={progress >= progressSize ? "finished" : "active"}
                                                                                            helperText={
                                                                                                progress === 0
                                                                                                    ? "Fetching log..."
                                                                                                    : progress >= progressSize
                                                                                                    ? "Download complete"
                                                                                                    : `${progress.toFixed(1)}KB of ${progressSize}KB`
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                            </Column>
                                                                            
                                                                            <Column lg={16} md={8} sm={4}>
                                                                            {!isDownloadingLogByModel[resultKey] && downloadedLogFileByModel[resultKey] && (
                                                                                <div className="download-log-wrap" style={{ marginTop: "1rem", display: "flex", alignItems: "flex-start", flexDirection: "column" }}>
                                                                                    <h5>Downloaded:</h5>
                                                                                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                                                                        <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 500, display: "flex", alignItems: "center" }}>
                                                                                            {downloadedLogFileByModel[resultKey]}
                                                                                            <Close
                                                                                                className="close-icon"
                                                                                                size={22}
                                                                                                style={{ marginLeft: "0.5rem", cursor: "pointer" }}
                                                                                                onClick={() => {
                                                                                                    setDownloadedLogFileByModel((prev) => ({
                                                                                                        ...prev,
                                                                                                        [resultKey]: null, // Clear the downloaded file for the specific resultKey
                                                                                                    }));
                                                                                                    setSelectedLog(null); // Clear the selected log
                                                                                                    setLogContent(null); // Clear the log content
                                                                                                    setLogSummary({}); // Clear the log summary
                                                                                                    setProgress(0); // Reset the progress
                                                                                                }}
                                                                                            />
                                                                                        </p>
                                                                                        <Button kind="ghost" size="sm" onClick={() => setIsModalOpen(resultKey)}>View File</Button>
                                                                                        <Button kind="ghost" size="sm" onClick={() => downloadLog("log", resultKey)}>Download</Button>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            </Column>
                                                                        </>
                                                                    )
                                                                }
                                                            </>
                                                        )}
                                                     {/* </Column> */}
                                                </Grid>
                                            </div>
                                            <p>
                                                <strong>Prompt:</strong>
                                            </p>

                                            <div>
                                                <Checkbox
                                                    id={`solid-background-toggle-${model?.model?.name}`}
                                                    className="solid-background-toggle"
                                                    labelText="Remove Prompt Background Wallpaper"
                                                    checked={model && model.model ? solidBackgrounds[model.model.name] || false : false}
                                                    onChange={() => {
                                                        const modelName = model?.model?.name ?? 'default';
                                                        setSolidBackgrounds(prev => ({
                                                            ...prev, [modelName]: !prev[modelName]
                                                        }));
                                                    }}
                                                    style={{ float: "right" }}
                                                />
                                            </div>

                                            <div className={solidBackgrounds[model?.model?.name ?? 'default'] ? "chat-screen solid-bg" : "chat-screen"}>
                                                <div className="date-capsule-wrap">
                                                    <Tag className="date-capsule" type="warm-gray">
                                                        {selectedDates[model?.model?.name ?? 'default']
                                                        ? format(new Date(selectedDates[model?.model?.name ?? 'default'] || ''), 'dd-MM-yyyy h:mmaaa')
                                                        : formattedPromptDate}
                                                    </Tag>
                                                </div>
                                                {filteredPrompts && filteredPrompts.length === 0 ? (
                                                    <div style={{ color: "#fff", background: "#606060cc", borderRadius: "4px", padding: "0.7rem", textAlign: "center", marginTop: "20px" }}>
                                                        No results found. <br /><br /> Please select another model or Click reset filter button to see the latest prompt result.
                                                    </div>
                                                ) : (
                                                    <ul>
                                                        {selectedQuestion === "All" ? (
                                                            filteredPrompts && filteredPrompts.map((prompt, index) => (
                                                                <li key={index}>
                                                                    <div className="user-message-bubble">
                                                                        <strong>User</strong>
                                                                        {formatPromptWithCodeTags(prompt.user)}
                                                                    </div>
                                                                    <div className="assistant-message-bubble">
                                                                        <strong>Assistant</strong>
                                                                        <span>{formatPromptWithCodeTags(prompt.assistant)}</span>
                                                                        <div className="response-time">
                                                                            <span style={{ display: "flex" }} title="indicates time taken to complete that prompt (question)">
                                                                                <Alarm />: {formatMillisecondsToTime(prompt.time)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            ))
                                                        ) : (
                                                            filteredPrompts && filteredPrompts
                                                                .filter((_, index) => index === parseInt(selectedQuestion.split(" ")[1]) - 1)
                                                                .map((prompt, index) => (
                                                                    <li key={index}>
                                                                        <div className="user-message-bubble">
                                                                            <strong>User</strong>
                                                                            {formatPromptWithCodeTags(prompt.user)}
                                                                        </div>
                                                                        <div className="assistant-message-bubble">
                                                                            <strong>Assistant</strong>
                                                                            <span>{formatPromptWithCodeTags(prompt.assistant)}</span>
                                                                            <div className="response-time">
                                                                                <span style={{ display: "flex" }} title="indicates time taken to complete that prompt (question)">
                                                                                    <Alarm />: {formatMillisecondsToTime(prompt.time)}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </li>
                                                                ))
                                                            )}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Column>
                        <Column lg={16} md={16} sm={16}>
                            <div className="information-wrap">
                                <h4>Notes:</h4>
                                <OrderedList>
                                    <ListItem>Pass@1: The percentage of tasks where the model's top prediction matches the ground truth.</ListItem>
                                    <ListItem>Pass@1 Score is fetched using the BigCodeBench API.</ListItem>
                                    <ListItem>' <FlashFilled size={14} color="#facc15" strokeWidth={2} /> ' indicates, Quickest reply provided among Compared Models.</ListItem>
                                    <ListItem style={{ display: 'flex'}}>' <div className="ribbon"><span className="ribbon4">Recommended</span></div> ' indicates, User to choose better Model.</ListItem>
                                    <ListItem style={{ display: 'flex'}}>' <Alarm size={20} style={{ margin: "0 0.4rem"}}  /> ' indicates time taken to complete that prompt (question).</ListItem>
                                    <ListItem>' <Tag type="green"/> ' indicates better pass@1 score.</ListItem>
                                    <ListItem>' <Tag type="red" /> ' indicates worst pass@1 score.</ListItem>
                                    <ListItem>' <Tag type="outline">N/A</Tag> ' indicates pass@1 score is not available for that Model.</ListItem>
                                    <ListItem>Click on the "Reset Filter" button to reset the filter.</ListItem>
                                    <ListItem>Click on the "Remove Prompt Background Wallpaper" button to remove the background wallpaper.</ListItem>
                                    <ListItem>Click on the "Select a Result" dropdown to select a result version.</ListItem>
                                    <ListItem>Click on the "Select a Question" dropdown to select a question.</ListItem>
                                    <ListItem>Click on the "Select a Log File" dropdown to see the log file.</ListItem>
                                </OrderedList>
                            </div>
                        </Column>
                    </>
                ) : (
                    <Column sm={4} md={8} lg={16}>
                        {!isLoading && (
                            <div style={{ color: "#fff", background: "#262626", border: "0.4px solid #514f4f", borderRadius: "4px", padding: "0.7rem", textAlign: "center", boxShadow: "0 0 6px 1px rgb(0 0 17)",  margin: "1.2rem auto", width: "50%" }}>
                                <p>No comparison found. <br /> Please select models to compare.</p>
                            </div>
                        )}
                    </Column>
                )
                }
            </Grid>
            {isLoading ? (
                <></>
                // <div className="loader-wrap" style={{ padding: "1rem" }}>
                //     <Loading />
                // </div>
            ) : (
                <Modal
                    open={isModalOpen !== null}
                    modalHeading={`Log Content: ${selectedLogByModel[isModalOpen || ""]}`}
                    passiveModal
                    onRequestClose={() => setIsModalOpen(null)}
                    size="lg"
                    className="log-modal"
                >
                    {isModalOpen && (
                        <>
                            {isLoading ? (
                                <div
                                    className="skeleton-wrap"
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        width: "300px",
                                        height: "350px",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "4rem auto 0",
                                        padding: "1rem",
                                    }}
                                >
                                    <DatePickerSkeleton range />
                                    <DatePickerSkeleton range />
                                </div>
                            ) : (
                                <>
                                    {logContentByModel[isModalOpen] ? (
                                        <>
                                            {Object.keys(logSummaryByModel[isModalOpen] || {}).length > 0 && (
                                                <div>
                                                    <div
                                                        style={{
                                                            margin: "1rem 0",
                                                            display: "flex",
                                                            gap: "1rem",
                                                            justifyContent: "flex-end",
                                                        }}
                                                    >
                                                        <Button
                                                            kind="tertiary"
                                                            renderIcon={Download}
                                                            onClick={() => downloadLog("json", isModalOpen || "")}
                                                        >
                                                            Download JSON
                                                        </Button>{" "}
                                                        <Button
                                                            kind="tertiary"
                                                            renderIcon={Download}
                                                            onClick={() => downloadLog("csv", isModalOpen || "")}
                                                        >
                                                            Download CSV
                                                        </Button>{" "}
                                                    </div>
                                                    <Tile className="log-summary-tile">
                                                        <h4>Log Summary</h4>
                                                        <div className="log-summary-content">
                                                            {Object.entries(logSummaryByModel[isModalOpen] || {}).map(([key, value]) => {
                                                                const labelMap: Record<string, string> = {
                                                                    "general.basename str": "Basename:",
                                                                    "llama_model_loader: - kv   2:                               general.name str": "General Name:",
                                                                    "llm_load_print_meta: model size": "Model Size:",
                                                                    "ggml_metal_init: found device": "User Device:",
                                                                    "ggml_metal_init: GPU name": "GPU Name:",
                                                                    "ggml_metal_init: recommendedMaxWorkingSetSize":
                                                                    "Recommended GPU Memory:",
                                                                };
                                                                return (
                                                                    <p key={key} style={{ marginBottom: "0.5rem" }}>
                                                                        <strong style={{ color: "#08BDBA" }}>
                                                                            {labelMap[key] || key}
                                                                        </strong>{" "}
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
                                                {logContentByModel[isModalOpen] || "No content available"}
                                            </CodeSnippet>
                                        </>
                                    ) : (
                                        <div
                                            style={{
                                                color: "#999",
                                                textAlign: "center",
                                                marginTop: "2rem",
                                                fontSize: "1rem",
                                            }}
                                        >
                                            Log content is not available. Please try again.
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </Modal>
            )}
        </div>
    );
};



export default ModelComparison;
