import request from '../request/http'

export function getVoiceList() {
    return request.get('/api/v1/server/tts/getVoiceList')
}

export function setCharacterVoice(data) {
    return request.post('/api/v1/server/tts/setCharacterVoice', data)
}

export function ttsMessage(data) {
    return request.post('/api/v1/server/tts/ttsMessage', data)
}

