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

export function updateCharacter(data) {
    return request.post('/api/v1/server/character/updateCharacter', data)
}

export function deleteCharacter(data) {
    return request.post('/api/v1/server/character/deleteCharacter', data)
}

export function createPersona(data) {
    return request.post('/api/v1/server/story/createPersona', data)
}

export function updatePersona(data) {
    return request.post('/api/v1/server/story/updatePersona', data)
}

export function deleteDefaultPersona() {
    return request.post('/api/v1/server/story/deleteDefaultPersona')
}

export function getCharacterList(params) {
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

export function restorePlotChatStyle(data) {
    return request.post('/api/v1/server/plot/restorePlotChatStyle', data)
}

export function getStoryDetail(storyId) {
    return request.get(`/api/v1/server/story/getStoryDetail?storyId=${storyId}`)
}

export function getPlotDetail(plotId) {
    return request.get(`/api/v1/server/plot/getPlotDetail?plotId=${plotId}`)
}

export function getCurrentPlotByCharacterId(characterId) {
    return request.get(`/api/v1/server/plot/getCurrentPlotByCharacterId?characterId=${characterId}`)
}

export function getPersonaDetail(id) {
    return request.get(`/api/v1/server/story/getPersonaDetail?personaId=${id}`)
}

export function getHotSearchKeywords() {
    return request.get(`/api/v1/server/character/getHotSearchKeywords`)
}

export function getDefaultPersona() {
    return request.get(`/api/v1/server/story/getDefaultPersona`)
}

export function updateDefaultPersona(data) {
    return request.post(`/api/v1/server/story/updateDefaultPersona`, data)
}