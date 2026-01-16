<?php

namespace Hertz\EmbedVideo\Command;

use Flarum\Console\AbstractCommand;
use Flarum\Post\CommentPost;
use Flarum\Post\Post;
use Illuminate\Database\Eloquent\Collection;
use s9e\TextFormatter\Utils;

class PurgeCommand extends AbstractCommand
{
    protected function configure()
    {
        // 更新命令名称，使其符合新品牌
        // 运行方式: php flarum hertz:video-purge
        $this->setName('hertz:video-purge');
        $this->setDescription('Remove all Hertz Embed Video tags from posts.');
    }

    protected function fire()
    {
        $this->info('Starting to purge video tags from posts...');

        // 分批处理，避免内存溢出
        Post::where('type', 'comment')->chunk(50, function (Collection $items) {
            foreach ($items as $post) {
                if (! ($post instanceof CommentPost)) {
                    continue;
                }

                // 移除 EMBED-VIDEO 标签
                $newContent = Utils::removeTag($post->parsed_content, 'EMBED-VIDEO');

                // 只有当内容发生变化时才保存，减少数据库写入
                if ($newContent !== $post->parsed_content) {
                    $post->parsed_content = $newContent;
                    $post->save();
                    $this->info("Purged video from Post ID: {$post->id}");
                }
            }
        });

        $this->info('Operation complete.');
    }
}