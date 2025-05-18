import { exec } from "child_process";
import fs from "fs-extra";
import { v4 as uuidv4 } from "uuid";

export async function executeCode(language, code, input = "") {
    const tempDir = "./temp";
    await fs.ensureDir(tempDir);

    const fileId = uuidv4();
    let filePath, command;

    switch (language) {
        case "python":
            filePath = `${tempDir}/${fileId}.py`;
            command = `python3 ${filePath}`;
            break;
        case "cpp":
            filePath = `${tempDir}/${fileId}.cpp`;
            command = `g++ ${filePath} -o ${tempDir}/${fileId} && echo "${input}" | ${tempDir}/${fileId}`;
            break;
        case "java":
            filePath = `${tempDir}/${fileId}.java`;
            command = `javac ${filePath} && echo "${input}" | java -cp ${tempDir} ${fileId}`;
            break;
        default:
            throw new Error("Unsupported language!");
    }

    await fs.writeFile(filePath, code);
    
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            fs.remove(filePath);
            if (error) reject(stderr || error.message);
            else resolve(stdout);
        });
    });
}
