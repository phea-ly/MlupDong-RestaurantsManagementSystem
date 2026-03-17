import { ref, onMounted, onUnmounted } from 'vue'

const now = ref(Date.now())
let timer = null
let subscribers = 0

function start() {
  if (!timer) {
    timer = setInterval(() => {
      now.value = Date.now()
    }, 1000)
  }
}

function stop() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

export function useNow() {
  onMounted(() => {
    subscribers += 1
    start()
  })

  onUnmounted(() => {
    subscribers -= 1
    if (subscribers <= 0) {
      subscribers = 0
      stop()
    }
  })

  return now
}
