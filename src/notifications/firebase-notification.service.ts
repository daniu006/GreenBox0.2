import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class FirebaseNotificationService implements OnModuleInit {
    private readonly logger = new Logger(FirebaseNotificationService.name);

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        this.initializeFirebase();
    }

    private initializeFirebase() {
        // Usamos el nombre simplificado que acabamos de copiar
        const firebaseCredentialsPath = 'firebase-credentials.json';

        if (admin.apps.length === 0) {
            try {
                const absolutePath = path.resolve(process.cwd(), firebaseCredentialsPath);
                const serviceAccount = require(absolutePath);

                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });
                this.logger.log('Firebase Admin initialized successfully');
            } catch (error) {
                this.logger.error('Failed to initialize Firebase Admin', error);
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
                        clickAction: 'FCM_PLUGIN_ACTIVITY', // Necesario para Capacitor
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
