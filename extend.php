<?php

/*
 * This file is part of hertz-dev/flarum-ext-embed-video.
 */

namespace Hertz\EmbedVideo;

use Flarum\Extend;
use Flarum\Api\Serializer\DiscussionSerializer;
use Flarum\Api\Serializer\ForumSerializer;
use Flarum\Post\Event\Saving;
use Hertz\EmbedVideo\Api\Serializer\DiscussionSerializerAttributes;
use Hertz\EmbedVideo\Api\Serializer\ForumSerializerAttributes;
use Hertz\EmbedVideo\Command\PurgeCommand;
use Hertz\EmbedVideo\Formatter;
use Hertz\EmbedVideo\Post\Listener\SavingListener;

return [
    // 前端资源加载
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/less/admin.less'),

    // 语言包
    new Extend\Locales(__DIR__ . '/locale'),

    // BBCode 格式化器
    (new Extend\Formatter)
        ->configure(Formatter\Configure::class)
        ->render(Formatter\Render::class),

    // 监听帖子保存事件（用于权限检查或清理）
    (new Extend\Event)
        ->listen(Saving::class, SavingListener::class),

    // API 序列化扩展（将设置传递给前端）
    (new Extend\ApiSerializer(ForumSerializer::class))
        ->attributes(ForumSerializerAttributes::class),

    (new Extend\ApiSerializer(DiscussionSerializer::class))
        ->attributes(DiscussionSerializerAttributes::class),

    // 后台清理命令 (php flarum hertz:video-purge)
    (new Extend\Console())
        ->command(PurgeCommand::class),

    // 默认设置 (对应 Artplayer 的配置需求)
    (new Extend\Settings)
        // 播放器默认主题色 (OneHz 风格)
        ->default('hertz-dev-embed-video.admin.settings.theme', '#ffad00') 
        // 默认语言
        ->default('hertz-dev-embed-video.admin.settings.lang', 'zh-cn')
        // 是否开启画质切换
        ->default('hertz-dev-embed-video.admin.settings.quality_switching', true)
        // 是否开启 Mini 进度条
        ->default('hertz-dev-embed-video.admin.settings.mini_progress_bar', true)
        // 是否允许 Airplay
        ->default('hertz-dev-embed-video.admin.settings.airplay', true)
];