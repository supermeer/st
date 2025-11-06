import request from '../request/http'

export function getCharacterType() {
    return request.get('/api/v1/server/character/getCharacterType')
}

export function getCharacterTag() {
    return request.get('/api/v1/server/character/getCharacterTag')
}

export function createCharacter(data) {
    return request.post('/api/v1/server/character/createCharacter', data)
}

export function getCharacterList(params) {
    // ifSystem
    // characterTypeId
    // characterTagId
    return request.get('/api/v1/server/character/getCharacterList', params)
}