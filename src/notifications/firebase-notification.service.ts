import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseNotificationService implements OnModuleInit {
    private readonly logger = new Logger(FirebaseNotificationService.name);

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        this.initializeFirebase();
    }

    private initializeFirebase() {
        if (admin.apps.length === 0) {
            try {
                // Obtener la configuración de Firebase desde variable de entorno
                const firebaseConfigBase64 = this.configService.get<string>('FIREBASE_CONFIG_BASE64');

                if (!firebaseConfigBase64) {
                    this.logger.error('FIREBASE_CONFIG_BASE64 environment variable is not set');
                    throw new Error('Firebase configuration not found');
                }

                // Decodificar el Base64 y parsear el JSON
                const firebaseConfigJson = Buffer.from(firebaseConfigBase64, 'base64').toString('utf-8');
                const serviceAccount = JSON.parse(firebaseConfigJson);

                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });

                this.logger.log('Firebase Admin initialized successfully from Base64 config');
            } catch (error) {
                this.logger.error('Failed to initialize Firebase Admin', error);
                throw error;
            }
        }
    }

    async sendPushNotification(
        token: string,
        title: string,
        body: string,
        data?: Record<string, string>,
    ) {
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