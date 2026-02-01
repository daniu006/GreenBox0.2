import { Module, Global } from '@nestjs/common';
import { FirebaseNotificationService } from './firebase-notification.service';

@Global()
@Module({
    providers: [FirebaseNotificationService],
    exports: [FirebaseNotificationService],
})
export class NotificationsModule { }
