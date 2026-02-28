import { v7 as uuidv7 } from "uuid"
import cacheClient from "./CacheClient.js"

interface SetDataProp<T> {
    key?: string
    data: T
}

interface SetDataResult<T> extends SetDataProp<T> {
    key: string
}

interface GetDataProp {
    key: string
}

interface DeleteDataProp {
    key: string
}

/**
 * Generate a random unique key using UUID v7
 * @returns string - generated unique key
 */
function generateRandomKey(): string {
    return uuidv7()
}

/**
 * Set data in cache
 * @param data Data to set in cache
 * @param key Key to identify the data in cache. Use GenerateRandomKey() to get a random unique key. 
 * @returns true when set is complete
 */
async function set<T>({ data, key }: SetDataProp<T>): Promise<SetDataResult<T>> {
    if (!key) key = generateRandomKey()
    
    await cacheClient.set<T>(key, data)
    return {
        key,
        data
    }
}

/**
 * Get data from cache
 * @param key Key to identify the data in cache 
 * @returns T | undefined - data if found, undefined if not found
 */
async function get<T>({ key }: GetDataProp): Promise<T | undefined> {
    const res = await cacheClient.get<T>(key)
    return res
}

/**
* Delete data from cache
* @param key Key to identify the data in cache
* @returns T | undefined - data if found, undefined if not found
*/
async function remove<T>({ key }: DeleteDataProp): Promise<T | undefined> {
    const data = await get<T>({ key })
    await cacheClient.delete(key)
    return data
}

export const TemporaryData = {
    remove, generateRandomKey, get, set
}

