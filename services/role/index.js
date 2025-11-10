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

export function createChatStyle(data) {
    return request.post('/api/v1/server/story/createChatStyle', data)
}

export function getChatStyleList(params) {
    return request.get('/api/v1/server/story/getChatStyleList', params)
}

export function getPlotListByCharacterId(characterId) {
    return request.get(`/api/v1/server/plot/getPlotListByCharacterId?characterId=${characterId}`)
}

export function getCharacterDetail(characterId) {
    return request.get(`/api/v1/server/character/getCharacterDetail?characterId=${characterId}`)
}