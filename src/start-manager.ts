import { ShardingManager } from 'discord.js';
import { createRequire } from 'node:module';
import 'reflect-metadata';

import Api from './api/Api.js';
import Job from './jobs/Job.js';
import { Manager } from './models/manager.js';
import HttpService from './services/HttpService.js';
import JobService from './services/JobService.js';
import Logger from './services/Logger.js';
import MasterApiService from './services/MasterApiService.js';
import { MathUtils } from './utils/math-utils.js';
import { ShardUtils } from './utils/shard-utils.js';

const require = createRequire(import.meta.url);
let Config = require('../config/config.json');
let Debug = require('../config/debug.json');
let Logs = require('../lang/logs.json');

async function start(): Promise<void> {
    Logger.info(Logs.info.appStarted);

    // Dependencies
    let httpService = new HttpService();
    let masterApiService = new MasterApiService(httpService);
    if (Config.clustering.enabled) {
        await masterApiService.register();
    }

    // Sharding
    let shardList: number[];
    let totalShards: number;
    try {
        if (Config.clustering.enabled) {
            let resBody = await masterApiService.login();
            shardList = resBody.shardList;
            let requiredShards = await ShardUtils.requiredShardCount(Config.client.token);
            totalShards = Math.max(requiredShards, resBody.totalShards);
        } else {
            let recommendedShards = await ShardUtils.recommendedShardCount(
                Config.client.token,
                Config.sharding.serversPerShard
            );
            shardList = MathUtils.range(0, recommendedShards);
            totalShards = recommendedShards;
        }
    } catch (error) {
        Logger.error(Logs.error.retrieveShards, error);
        return;
    }

    if (shardList.length === 0) {
        Logger.warn(Logs.warn.managerNoShards);
        return;
    }

    let shardManager = new ShardingManager('dist/start-bot.js', {
        token: Config.client.token,
        mode: Debug.override.shardMode.enabled ? Debug.override.shardMode.value : 'process',
        respawn: true,
        totalShards,
        shardList,
    });

    // Jobs
    let jobs: Job[] = [].filter(Boolean);

    let manager = new Manager(shardManager, new JobService(jobs));

    // API
    let api = new Api(shardManager);

    // Start
    await manager.start();
    await api.start();
    if (Config.clustering.enabled) {
        await masterApiService.ready();
    }
}

process.on('unhandledRejection', (reason, _promise) => {
    Logger.error(Logs.error.unhandledRejection, reason);
});

start().catch(error => {
    Logger.error(Logs.error.unspecified, error);
});
