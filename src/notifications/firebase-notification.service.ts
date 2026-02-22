
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseNotificationService implements OnModuleInit {
    private readonly logger = new Logger(FirebaseNotificationService.name);
    private firebaseReady = false;

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        this.initializeFirebase();
    }

    private initializeFirebase() {
        if (admin.apps.length > 0) {
            this.firebaseReady = true;
            return;
        }

        try {
            const firebaseConfigBase64 = this.configService.get<string>('FIREBASE_CONFIG_BASE64');

            if (!firebaseConfigBase64) {
                // ⚠️ Log del error pero NO lanzar excepción para no crashear el servidor
                this.logger.error('FIREBASE_CONFIG_BASE64 no está configurada. Las notificaciones push estarán deshabilitadas.');
                this.firebaseReady = false;
                return;
            }

            // Decodificar el Base64 y parsear el JSON
            const firebaseConfigJson = Buffer.from(firebaseConfigBase64, 'base64').toString('utf-8');
            const serviceAccount = JSON.parse(firebaseConfigJson);

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });

            this.firebaseReady = true;
            this.logger.log('✅ Firebase Admin inicializado correctamente');
        } catch (error) {
            // ⚠️ NO re-lanzar el error — solo loguear y marcar como no disponible
            this.logger.error('Error inicializando Firebase Admin. Notificaciones push deshabilitadas.', error);
            this.firebaseReady = false;
        }
    }

    async sendPushNotification(
        token: string,
        title: string,
        body: string,
        data?: Record<string, string>,
    ) {
        if (!this.firebaseReady) {
            this.logger.warn('Firebase no está inicializado. Notificación omitida.');
            return null;
        }

        if (!token) {
            this.logger.warn('No token provided for notification');
            return;
        }

        try {
            const message: admin.messaging.Message = {
                token: token,
                notification: {
                    title,
                    body,
                },
                data: data,
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                        channelId: 'PushNotifications',
                        priority: 'high',
                        defaultSound: true,
                        clickAction: 'FCM_PLUGIN_ACTIVITY',
                    }
                }
            };

            const response = await admin.messaging().send(message);
            this.logger.log(`Successfully sent notification: ${response}`);
            return response;
        } catch (error) {
            this.logger.error(`Error sending notification to ${token}`, error);
            return null;
        }
    }
}