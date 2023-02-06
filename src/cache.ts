import ChoccoDB from "./database";

interface CacheStructure {
    key: string,
    value: any
}

class ChoccoLRUCache {

    private maxsize: number = 10;
    private cache: CacheStructure[] = []
    private db: ChoccoDB;

    constructor(size: number, db: ChoccoDB) {
        this.maxsize = size;
        this.db = db;
    }
    private appendCache(key: string, value: any) {
        const searchedElement = this.cache.find(obj => obj.key && obj.key === key)
        if (!!searchedElement) {
            let index = this.cache.indexOf({
                key: key,
                value: value
            })
            this.cache.splice(index, 1)
        }
        this.cache.push({
            key: key,
            value: value
        })
        if (this.cache.length > this.maxsize) this.cache.pop()
    }

    public get(key: string): Promise<any> {
        // resolves if there is data with given key
        // rejects if there is no data
        return new Promise(async (resolve, reject) => {
            const searchedElement = this.cache.find(obj => obj.key && obj.key === key)
            if (searchedElement) {
                this.appendCache(key, searchedElement)
                resolve(searchedElement)
            }
            else {
                const dbElement = await this.db.get(key)
                if (dbElement != undefined) {
                    this.appendCache(key, dbElement)
                    resolve(dbElement)
                }
                else reject(undefined)
            }
        })
    }

    public set(key: string, value: any): Promise<void> {
        return new Promise((resolve,reject) => {
            try {
                this.appendCache(key, value)
                this.db.set(key, value).catch(reject)
                resolve()
            } catch (e) {
                reject(e)
            }
            
        })
    }

    public has: (key: string) => Promise<boolean> = (key: string) => this.db.has(key);

    public remove: (key: string) => void = (key: string) => this.db.remove(key);

}

export default ChoccoLRUCache;