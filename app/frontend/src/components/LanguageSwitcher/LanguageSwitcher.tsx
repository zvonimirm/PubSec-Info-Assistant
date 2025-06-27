import { useState, useEffect } from "react";
import usFlag from "./flags/us.svg"; // Import the SVG files
import hrFlag from "./flags/hr.svg";
import styles from './LanguageSwitcher.module.css';


interface Language {
    code: string;
    name: string;
    flag: string;
}

interface LanguageSwitcherProps {
    onLanguageChange?: (language: string) => void; // Callback prop to notify parent
}
const languages: Language[] = [
    { code: "en", name: "EN", flag: usFlag},
    { code: "hr", name: "HR", flag: hrFlag}
];

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ onLanguageChange }) => {

    useEffect(() => {
        const storedLang = localStorage.getItem("lang") || "hr";
        setLanguage(storedLang);
    }, []);

    const [language, setLanguage] = useState<string>(()=>{
        console.log("LanguageSwitcher language changed to:", localStorage.getItem("lang"));
        return localStorage.getItem("lang") || "hr"; // Default to "hr" if not set
    });

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newLanguage = event.target.value;
        setLanguage(newLanguage); // Update local state
        if (onLanguageChange) {
            onLanguageChange(newLanguage); // Notify parent of the change
        }
    };

    return (
        <div className={styles.mainContainer}>
            <select value={language} onChange={handleChange} className={styles.select}>
                {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.name}
                    </option>
                ))}
            </select>
            <img className={styles.image} src={languages.find((lang) => lang.code === language)?.flag} alt={language} />
        </div>
    );
};

export default LanguageSwitcher;
