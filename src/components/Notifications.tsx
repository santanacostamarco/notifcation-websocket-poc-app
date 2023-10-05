"use client";

import { useCallback, useEffect, useState } from 'react';
import io from 'socket.io-client'
import icon from '@/app/favicon.ico'

type NotificationProps = {
  id: string;
  date: Date;
  message: string;
  read: boolean
}

const Notifications = () => {
  const [notificationPermitionGranted, setNotifictionPermitionGranted] = useState(false)
  const [notificationHistory, setNotificationHistory] = useState<NotificationProps[]>([])

  const pushNotification = useCallback((notification: NotificationProps) => {
    setNotificationHistory(notificationHistory => [...notificationHistory, notification])
  }, [])

  const setRead = useCallback((notification: NotificationProps) => {
    setNotificationHistory(notificationHistory => notificationHistory.map(_notification => {
      if (notification.id === _notification.id) {
        return {
          ..._notification, 
          read: true
        }
      } 
      return _notification
    }))
  }, [])
  
  useEffect(() => {
    if (!("Notification" in window)) {
      console.log("Este navegador não suporta notificações.");
    }
    else {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          setNotifictionPermitionGranted(true)
        } else {
          setNotifictionPermitionGranted(false)
        }
      });
    }
  }, [])
    
  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('notification', (notification: Omit<NotificationProps, 'read'>) => {
      pushNotification({
        ...notification,
        read: false
      })

      if (notificationPermitionGranted) {
        const windowNotification = new Notification(
          "Nova notificação",  
          {
            body: notification.message,
            icon: icon.src,
            data: {
              ...notification
            },
          }
        );
      
        windowNotification.onclick = (event) => {
          const notification = event.currentTarget as Notification
          const notificationData = notification.data as NotificationProps

          setRead(notificationData)
        };
      }

    });

    return () => {
      socket.disconnect();
    };
  }, [notificationPermitionGranted, pushNotification, setRead]);

  return (
    <div> 
      <h1> Notificações </h1>
      {notificationPermitionGranted && <p>
        Permissão concedida para exibir notificações.
      </p>}
      {!notificationPermitionGranted && <div>
        <p>
        Permissão negada para exibir notificações.
        </p>
        <button>
          Permitir notificações
        </button>
      </div>}
      <ul>
        {notificationHistory.map(notification => (
          <li key={notification.id}>
            {notification.message}
            {notification.read ? " - lida" : ""}
            {!notification.read ? (
              <> {' '}
              <button onClick={() => {
                setRead(notification)
              }}>
                Marcar como Lida
              </button>
              </>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  
  )
}

export default Notifications