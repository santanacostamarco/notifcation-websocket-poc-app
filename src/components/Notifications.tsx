"use client";

import { useEffect } from 'react';
import io from 'socket.io-client'
import icon from '@/app/favicon.ico'

const Notifications = () => {

  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      console.log("Permissão concedida para exibir notificações.");
    } else {
      console.log("Permissão negada para exibir notificações.");
    }
  });
  
  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('notification', (data) => {
      console.log('Received notification:', data);

      const options = {
        body: data.message,
        icon: icon.src,
      };
    
      const notification = new Notification("Título da Notificação", options);
    
      notification.onclick = () => {
        console.log("A notificação foi clicada!");
      };

    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
  <p> Notification </p>
  )
}

export default Notifications