<?php

namespace Hertz\EmbedVideo\Post\Listener;

use Flarum\Foundation\ValidationException;
use Flarum\Post\CommentPost;
use Flarum\Post\Event\Saving;
use Illuminate\Support\Arr;
use s9e\TextFormatter\Utils;
use Symfony\Contracts\Translation\TranslatorInterface;

class SavingListener
{
    /**
     * @var TranslatorInterface
     */
    protected $translator;

    public function __construct(TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }

    public function handle(Saving $event)
    {
        // 1. 基础检查：必须是帖子内容保存事件
        if (! ($event->post instanceof CommentPost)) {
            return;
        }

        if (! Arr::has($event->data, 'attributes.content')) {
            return;
        }

        // 2. 性能优化：快速检查 (Fast Fail)
        // 如果 XML 内容里连 "EMBED-VIDEO" 这个词都没有，直接跳过，不需要解析 XML
        if (! str_contains($event->post->parsed_content, 'EMBED-VIDEO')) {
            return;
        }

        // 3. 严格检查：确认标签确实存在且被解析
        // 原理：尝试移除标签，如果内容变短了，说明标签存在
        $oldContent = $event->post->parsed_content;
        $newContent = Utils::removeTag($oldContent, 'EMBED-VIDEO');

        if ($oldContent === $newContent) {
            return; // 说明虽然包含关键字，但不是有效标签
        }

        // 4. 权限检查
        // 使用新的权限键名: discussion.hertz-dev-embed-video.create
        if ($event->actor->cannot('discussion.hertz-dev-embed-video.create', $event->post->discussion)) {
            // 抛出无权异常，使用新的翻译键名
            throw new ValidationException([
                'hertzEmbedVideo' => $this->translator->trans('hertz-dev-embed-video.forum.cannot_create')
            ]);
        }
    }
}