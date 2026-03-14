/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { APIV1Module } from './v1/apiv1.module.js';

@Module({
    imports: [APIV1Module],
    controllers: [],
    providers: [],
})
export class APIModule {}
