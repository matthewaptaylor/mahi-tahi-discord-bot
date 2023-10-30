import { ActivityType, ShardingManager } from 'discord.js';
import { Request, Response, Router } from 'express';
import router from 'express-promise-router';
import { createRequire } from 'node:module';

import { Controller } from './controller.js';
import { CustomClient } from '../extensions/custom-client.js';
import { mapClass } from '../middleware/map-class.js';
import {
    GetShardsResponse,
    SetShardPresencesRequest,
    ShardInfo,
    ShardStats,
} from '../models/cluster-api/shards.js';
import { Logger } from '../services/logger.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');
let Logs = require('../../lang/logs.json');

export class ShardsController implements Controller {
    public path = '/shards';
    public router: Router = router();
    public authToken: string = Config.api.secret;

    constructor(private shardManager: ShardingManager) {}

    public register(): void {
        this.router.get('/', (req, res) => this.getShards(req, res));
        this.router.put('/presence', mapClass(SetShardPresencesRequest), (req, res) =>
            this.setShardPresences(req, res)
        );
    }

    private async getShards(req: Request, res: Response): Promise<void> {
        let shardDatas = await Promise.all(
            this.shardManager.shards.map(async shard => {
                let shardInfo: ShardInfo = {
                    id: shard.id,
                    ready: shard.ready,
                    error: false,
                };

                try {
                    let uptime = (await shard.fetchClientValue('uptime')) as number;
                    shardInfo.uptimeSecs = Math.floor(uptime / 1000);
                } catch (error) {
                    Logger.error(Logs.error.managerShardInfo, error);
                    shardInfo.error = true;
                }

                return shardInfo;
            })
        );

        let stats: ShardStats = {
            shardCount: this.shardManager.shards.size,
            uptimeSecs: Math.floor(process.uptime()),
        };

        let resBody: GetShardsResponse = {
            shards: shardDatas,
            stats,
        };
        res.status(200).json(resBody);
    }

    private async setShardPresences(req: Request, res: Response): Promise<void> {
        let reqBody: SetShardPresencesRequest = res.locals.input;

        await this.shardManager.broadcastEval(
            (client: CustomClient, context) => {
                return client.setPresence(context.type, context.name, context.url);
            },
            { context: { type: ActivityType[reqBody.type], name: reqBody.name, url: reqBody.url } }
        );

        res.sendStatus(200);
    }
}