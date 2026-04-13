import request from '../request/http'

export function getVoiceList(params) {
    return request.get('/api/v1/server/tts/getVoiceList', params)
}

export function getVoiceTypes() {
    return request.get('/api/v1/server/tts/getVoiceTypes')
}

export function getVoiceTags() {
    return request.get('/api/v1/server/tts/getVoiceTags')
}

export function addFavoriteVoice(data) {
    return request.post('/api/v1/server/tts/addFavoriteVoice', data)
}
export function removeFavoriteVoice(data) {
    return request.post('/api/v1/server/tts/removeFavoriteVoice', data)
}
export function setCharacterVoice(data) {
    return request.post('/api/v1/server/tts/setCharacterVoice', data)
}

export function ttsMessage(data) {
    return request.post('/api/v1/server/plot/ttsMessage', data)
}

export function resetCharacterVoice(data) {
    return request.post('/api/v1/server/tts/resetCharacterVoice', data)
}


