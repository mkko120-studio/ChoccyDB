import fsp from "fs/promises"
import fs from "fs"
import readline from "readline/promises"
import replace from "line-replace"

/**
 * Main class required by the module to work
 */
class ChoccoDB {
    private path: string = ""

    constructor(path: string) {
        if (this.path.length > 0) {
            this.path = path;
            fsp.stat(
                path
            ).then(stats => {
                if (stats.isDirectory()) throw new Error("Not a file! Specified path is a directory!")
            }).catch(e => {
                if (e.code && e.code === 'ENOENT') fsp.writeFile(path, "", {encoding: "utf-8", flag: "w+"}).catch(console.error);
                else console.error(e);
            })
        } else throw new Error("Invalid path")
    }

//#region get
    /*
        file format:

        example.cdb
        ```
        key: value
        key: {"key":"value"}
        key: True|False
        ```

        its always a key-value string pair
    */
  

    public async get(key: string): Promise<String | undefined> {
        return new Promise(async (resolve, reject) => {
            try {
                let found: boolean = false;
                readline.createInterface({
                    input: fs.createReadStream(this.path),
                    crlfDelay: Infinity
                }).on("line", line => {
                    if (line.startsWith(key)) {
                        resolve(line.substring(0, key.length + 1).trim())
                        found = true;
                    }
                }).once("close", () => {
                    if (!found) {
                        resolve(undefined)
                    }
                })
            } catch (e) {
                reject(e)
            }
        })
    }

    //#endregion
//#region set
    /**
     * Function for inserting into file database 
     * @param key key to look for if replacing
     * @param value value to place against a key
     * @returns a void promise
     */
    public async set(key: string, value: any): Promise<void> {
        const linecounter = ((i = 0) => () => ++i)(); 
        let found = false;
        const newline = key + ": " + value + "\n"
        return new Promise((resolve, reject) => {
            try {
                const rl = readline.createInterface({
                    input: fs.createReadStream(this.path),
                    crlfDelay: Infinity
                })
                rl.on('line', (line, lineno = linecounter()) => {
                    if (line.startsWith(key)) {
                        found = true;
                        replace({
                            file: this.path,
                            line: lineno,
                            text: newline,
                            addNewLine: false
                        })
                        rl.close()
                        rl.removeAllListeners()
                    }
                })
                rl.once("close", () => {
                    if (!found) {
                        fsp.appendFile(this.path, newline, {encoding: "utf-8", flag: "w+"}).catch(reject)
                    }
                    resolve()
                })
            } catch (e) {
                reject(e)
            }
        })
    }
    //#endregion
//#region has
    public async has(key: string): Promise<boolean> {
        return new Promise((resolve, rejects) => {
            let found = false
            try {
                const rl = readline.createInterface({
                    input: fs.createReadStream(this.path),
                    crlfDelay: Infinity
                })
                rl.on("line", line => {
                    if (line.startsWith(key)) {
                        found = true
                        rl.close()
                        rl.removeAllListeners()
                    }
                })
                rl.once("close", () => {
                    resolve(found)
                })
            } catch (e) {
                rejects(e)
            }
        })
    }
    //#endregion
//#region remove
    public async remove(key: string): Promise<void> {
        const linecounter = ((i = 0) => () => ++i)(); 
        return new Promise((resolve, reject) => {
            this.has(key).then(has => {
                if (has)
                    try {
                        const rl = readline.createInterface({
                            input: fs.createReadStream(this.path),
                            crlfDelay: Infinity
                        })
                        rl.on('line', (line, lineno = linecounter()) => {
                            if (line.startsWith(key)) {
                                replace({
                                    file: this.path,
                                    line: lineno,
                                    text: "",
                                    addNewLine: false
                                })
                                rl.close()
                                rl.removeAllListeners()
                            }
                        })
                        rl.once("close", () => {
                            resolve()
                        })
                } catch (e) {
                    reject(e)
                }
            }).catch(reject)
        })
    }
    //#endregion
    
}

export default ChoccoDB;