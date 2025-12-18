import {ref, onUnmounted} from "vue";
import type { Ref } from "vue";


export interface UseWebSocketResult {
    ws: Ref<WebSocket | null>
    messages: Ref<string[]>
    connect: () => void
    send: (data : string) => void
    close: () => void
}

export function useWebSocket(url : string, onMessage ?: (msg: string) => void) : UseWebSocketResult {
    const ws = ref <WebSocket | null> (null)
    const messages = ref <string[]> ( [] )

    const connect = () : void => {
        ws.value = new WebSocket(url)

        ws.value.onmessage = (event : MessageEvent) => {
            const msg = event.data as string
            messages.value.push(msg)
            onMessage?.(msg)
        }

        ws.value.onopen = () => {
            console.log('WebSocket connected')
        }

        ws.value.onclose = () => {
            console.log('WebSocket disconnected')
        }

        ws.value.onerror = (error: Event) => {
            console.error('WebSocket error', error)
        }
    }

    const send = (data : string) : void => {
        if (ws.value && ws.value.readyState === WebSocket.OPEN) {
            ws.value.send(data)
        } else {
            console.error('WebSocket not connected')
        }
    }

    const close = () : void => {
        if (ws.value) {
            ws.value.close()
            ws.value = null
        }
    }
    onUnmounted(() => close())



    return {
        ws,
        messages,
        connect,
        send,
        close
    }
}