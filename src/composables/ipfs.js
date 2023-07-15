import { createHelia } from 'helia'
import { json } from '@helia/json'


export async function useIpfs() {
    const helia = await createHelia()
    const j = json(helia)

    const add = (obj) => {
        return j.add(obj)
    }

    const get = (address) => {
        return j.get(address)
    }

    return { add, get }
}