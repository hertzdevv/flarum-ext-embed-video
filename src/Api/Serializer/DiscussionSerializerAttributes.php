<?php

namespace Hertz\EmbedVideo\Api\Serializer;

use Flarum\Api\Serializer\DiscussionSerializer;
use Flarum\Discussion\Discussion;

class DiscussionSerializerAttributes
{
    public function __invoke(DiscussionSerializer $serializer, Discussion $discussion, array $attributes)
    {
        return [
            // 传递当前用户是否有权观看此特定主题下的视频
            // 虽然 Render.php 已经在后端拦截了，但前端有时也需要这个状态来显示 UI
            'canHertzEmbedVideoView' => $serializer->getActor()->can('discussion.hertz-dev-embed-video.view', $discussion),
        ];
    }
}