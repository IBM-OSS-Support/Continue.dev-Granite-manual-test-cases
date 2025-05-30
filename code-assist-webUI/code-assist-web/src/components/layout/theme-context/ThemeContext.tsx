import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeContextType = {
  themeType: 'g90' | 'g100' | 'g10';
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
// export const CHART_THEME = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialTheme = (): 'g90' | 'g100' | 'g10' => {
    const stored = localStorage.getItem('themeType');
    return stored === 'g10' || stored === 'g100' ? stored : 'g90';
  };

  const [themeType, setThemeType] = useState<'g90' | 'g100' | 'g10'>(getInitialTheme);

  useEffect(() => {
    localStorage.setItem('themeType', themeType);
  }, [themeType]);

  useEffect(() => {
    if (themeType === 'g10') {
        document.querySelector("body.dark")?.classList.remove("dark");
        const cdsG100Element = document.querySelector(".cds--g100");
        cdsG100Element?.classList.remove("cds--g100");
        cdsG100Element?.classList.add("cds--g10");
    } else {
        document.querySelector("body")?.classList.add("dark");
        const cdsG10Element = document.querySelector(".cds--g10");
        cdsG10Element?.classList.remove("cds--g10");
        cdsG10Element?.classList.add("cds--g100");
    }
  });

  const toggleTheme = () => {
    setThemeType((prevTheme) => (prevTheme === "g90" ? "g10" : "g90"));

    // Override the <Theme> component's theme if it exists
    const themeElement = document.querySelector(".cds--g100, .cds--g10");
    const dataCarbonThemeElement = document.querySelector(
      "[data-carbon-theme]"
    );
    if (themeElement) {
      if (themeElement.classList.contains("cds--g100")) {
        themeElement.classList.remove("cds--g100");
        themeElement.classList.add("cds--g10");
        document.querySelector("body.dark")?.classList.remove("dark");
        document.querySelector(".main-heading.dark")?.classList.remove("dark");
        document
          .querySelector(".compare-option-wrap.dark")
          ?.classList.remove("dark");
        document
          .querySelector(".no-comarison-found.dark")
          ?.classList.remove("dark");
        if (dataCarbonThemeElement) {
          dataCarbonThemeElement.setAttribute("data-carbon-theme", "g10");
        }
      } else if (themeElement.classList.contains("cds--g10")) {
        themeElement.classList.remove("cds--g10");
        themeElement.classList.add("cds--g100");
        document.querySelector("body")?.classList.add("dark");
        document.querySelector(".main-heading")?.classList.add("dark");
        document.querySelector(".compare-option-wrap")?.classList.add("dark");
        document.querySelector(".no-comarison-found")?.classList.add("dark");
        if (dataCarbonThemeElement) {
          dataCarbonThemeElement.setAttribute("data-carbon-theme", "g100");
        }
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ themeType, toggleTheme }}>
      {/* <CHART_THEME.Provider value={{ themeType, toggleTheme }}> */}
        {children}
      {/* </CHART_THEME.Provider> */}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
