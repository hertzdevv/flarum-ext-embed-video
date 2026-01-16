<?php

namespace Hertz\EmbedVideo\Api\Serializer;

use Flarum\Api\Serializer\ForumSerializer;
use Flarum\Settings\SettingsRepositoryInterface;

class ForumSerializerAttributes
{
    /**
     * @var SettingsRepositoryInterface
     */
    protected $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
    }

    public function __invoke(ForumSerializer $serializer): array
    {
        // 获取当前用户
        $actor = $serializer->getActor();

        return [
            // 播放器配置
            'hertzEmbedVideoTheme' => (string) $this->settings->get('hertz-dev-embed-video.admin.settings.theme'),
            'hertzEmbedVideoLogo' => (string) $this->settings->get('hertz-dev-embed-video.admin.settings.logo'),
            'hertzEmbedVideoDefaultPoster' => (string) $this->settings->get('hertz-dev-embed-video.admin.settings.default_poster'),
            'hertzEmbedVideoLang' => (string) $this->settings->get('hertz-dev-embed-video.admin.settings.lang'),
            'hertzEmbedVideoAirplay' => (bool) $this->settings->get('hertz-dev-embed-video.admin.settings.airplay'),
            'hertzEmbedVideoQualitySwitching' => (bool) $this->settings->get('hertz-dev-embed-video.admin.settings.quality_switching'),
            'hertzEmbedVideoMiniProgressBar' => (bool) $this->settings->get('hertz-dev-embed-video.admin.settings.mini_progress_bar'),
            
            // 全局权限：当前用户是否有权发布视频
            // 这决定了发帖框里的“视频按钮”是否显示
            'canCreateVideo' => $actor->can('discussion.hertz-dev-embed-video.create'),
        ];
    }
}