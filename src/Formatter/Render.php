<?php

namespace Hertz\EmbedVideo\Formatter;

use Flarum\Http\RequestUtil;
use Flarum\Post\CommentPost;
use Psr\Http\Message\ServerRequestInterface;
use s9e\TextFormatter\Renderer;
use s9e\TextFormatter\Utils;

class Render
{
    public function __invoke(Renderer $renderer, &$context, string $xml, ServerRequestInterface $request = null): string
    {
        // 1. 基础检查：如果不是帖子或没有请求上下文，直接放行
        if (! ($context instanceof CommentPost)) {
            return $xml;
        }

        if (! $request) {
            return $xml;
        }

        $actor = RequestUtil::getActor($request);

        // 2. 作者本人始终可见
        if ($context->user_id === $actor->id) {
            return $xml;
        }

        // 3. 检查新的权限名称：hertz-dev-embed-video.view
        if ($actor->can('discussion.hertz-dev-embed-video.view', $context->discussion)) {
            return $xml;
        }

        // 4. 无权限时的处理：替换为提示信息
        // 使用 removeTag 可能会导致布局塌陷，建议替换为一段占位 HTML
        return Utils::replaceTag($xml, 'EMBED-VIDEO', function ($tag) {
            // 这里返回的 HTML 会显示给没有权限的用户
            // 配合 less/forum.less 中的 .video-no-permission 样式
            return '<div class="video-no-permission">
                        <i class="fas fa-lock"></i>
                        <span>无权观看此视频</span>
                    </div>';
        });
    }
}