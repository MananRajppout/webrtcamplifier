import { useEffect } from "react"
import { useGlobalContext } from "@/context/GlobalContext"

const useSocketListen = (event, callback) => {
  const {socket} = useGlobalContext()

  useEffect(()=> {
    socket.on(event, callback)

    return () => {
      socket.off(event)
    }
  }, [event, callback, socket])
}

export default useSocketListen