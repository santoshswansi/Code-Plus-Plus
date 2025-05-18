import { LANGUAGE_NAME_TO_PISTON_LANGUAGE } from "@/constants";
import axios from "axios";

export const runCode = async (language, code, input = "") => {
    try {
        const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
            language: LANGUAGE_NAME_TO_PISTON_LANGUAGE[language],
            version: "*", 
            files: [{ content: code }],
            stdin: input,
        });

        if(response.data.run.stderr) return response.data.run.stderr;
        return response.data.run.stdout;
    }catch(error){
        return error?.message || "Failed to execute the code";
    }
};
