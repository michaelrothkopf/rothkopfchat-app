import { io } from 'socket.io-client';
import { serverInfo } from './ServerInfo';

// Connect to localhost temporarily for server testing
// const socket = io.connect('http://192.168.1.197:8149', {
//   path: '/chatserver'
// });

export const createSocket = () => {
  return io.connect(serverInfo.serverAddress, {
    path: '/chatserver'
  });
}

export const connData = {
  socket: null,
};