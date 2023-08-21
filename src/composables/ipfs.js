import { create } from 'kubo-rpc-client'
const client = create('http://localhost:5001/api/v0')


export function useIpfs() {
    const add = (obj) => {
        return client.add(JSON.stringify(obj))
    }

    const get = async (address) => {
        for await (const buf of client.cat(address)) {
            const decoder = new TextDecoder('utf-8');
            return JSON.parse(decoder.decode(buf));
        }
    }


    return { add, get }
}