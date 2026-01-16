<?php

namespace Hertz\EmbedVideo\Formatter;

use s9e\TextFormatter\Configurator;

class Configure
{
    public function __invoke(Configurator $config)
    {
        // 关键：保留 id 和 type 属性以兼容旧帖子，但标记为可选 (?)
        // url 使用 {URL} 进行安全验证
        // qualities 使用 {ANYTHING} 因为它包含分号等特殊字符
        $config->BBCodes->addCustom(
            '[embed-video id="{TEXT?}" url="{URL}" type="{TEXT2?}" live="{TEXT3?}" qualities="{ANYTHING?}"]',
            
            // 输出新的 HTML 结构
            '<div class="hertz-video-container"
                data-url="{URL}"
                data-live="{TEXT3}"
                data-qualities="{ANYTHING}">
            </div>'
        );
    }
}