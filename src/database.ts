import fs from "fs/promises"


/**
 * Main class required by the module to work
 */
class ChoccoDB {
    private path: string = ""
    private data: any = {}

    constructor(path: string) {
        if (this.path.length > 0) {
            this.path = path;
            this.loadfile(this.path)
        } else throw new Error("Invalid path")
    }

    private async loadfile(path: string): Promise<void> {
        fs.stat(
            path
        ).then(stats => {
            if (stats.isDirectory()) throw new Error("Not a file! Specified path is a directory!")
        }).catch(e => {
            if (e.code && e.code === 'ENOENT') fs.writeFile(path, "{}", {encoding: "utf-8", flag: "w+"}).catch(console.error);
            else console.error(e);
        })
        
        fs.open(path, "w+").then(file => {
            let stream = file.createReadStream({encoding: "utf-8"})
            let chunks: any[] = [];
            let chunk;
            stream.on('readable', () => {
                while (null !== (chunk = stream.read())) {
                    chunks.push(chunk)
                }
            })
            stream.on('end', () => {
                if (chunks.join('').length > 2)
                    try {
                        this.data = JSON.parse(chunks.join(''))
                    } catch (e) {
                        throw new Error("File is corrupted!")
                    }
                else fs.writeFile(path, "{}", {encoding: "utf-8", mode: "w+"}).catch(console.error)
            })
        }).catch(console.error)
    }
    private async saveFile(path: string): Promise<void> {
        fs.stat(
            path
        ).then(stats => {
            if (stats.isDirectory()) throw new Error("Not a file! Specified path is a directory!")
        }).catch(e => {
            if (e.code && e.code === 'ENOENT') fs.writeFile(path, "{}", {encoding: "utf-8", flag: "w+"}).catch(console.error);
            else console.error(e);
        })

        fs.open(
            path, "w+"
        ).then(file => {
            let stream = file.createWriteStream({encoding: "utf-8"})
            stream.write(JSON.stringify(this.data))
        }).catch(console.error)
    }

    public async get(key: string): Promise<any> {
        return this.data[key]
    }

    public set(key: string, value: any): void {
        this.data[key] = value;
        this.saveFile(this.path)
    }

    public has(key: string): boolean {
        return this.data[key] != undefined
    }

    public remove(key: string): void {
        if (this.has(key))
            delete this.data[key]
    }
}

export default ChoccoDB;