/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [AuthModule],
    controllers: [],
    providers: [],
})
export class APIV1Module {}
