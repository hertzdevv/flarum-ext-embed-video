import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import CommentPost from 'flarum/forum/components/CommentPost';
import ComposerPostPreview from 'flarum/forum/components/ComposerPostPreview';
import TextEditor from 'flarum/common/components/TextEditor';
import Tooltip from 'flarum/common/components/Tooltip';
import Button from 'flarum/common/components/Button';

import Artplayer from 'artplayer';
import Hls from 'hls.js';

// 初始化 Artplayer 的通用函数
function initPlayer(element) {
  const containers = element.querySelectorAll('.hertz-video-container');

  containers.forEach((el) => {
    // 防止重复初始化
    if (el.dataset.initialized) return;

    const url = el.dataset.url;
    const qualitiesStr = el.dataset.qualities || '';
    const theme = app.forum.attribute('hertzEmbedVideoTheme') || '#ffad00';
    const lang = app.forum.attribute('hertzEmbedVideoLang') || 'zh-cn';
    const defaultPoster = app.forum.attribute('hertzEmbedVideoDefaultPoster') || '';
    
    // 解析画质参数 (格式: SD;http://.../sd.m3u8,HD;http://.../hd.m3u8)
    let quality = [];
    if (qualitiesStr) {
      quality = qualitiesStr.split(',').map(item => {
        const parts = item.split(';');
        // 兼容性处理：防止格式错误导致崩溃
        if (parts.length < 2) return null;
        return { html: parts[0], url: parts[1] };
      }).filter(Boolean); // 过滤掉无效项

      // 如果有画质列表，默认选中第一个
      if (quality.length > 0) quality[0].default = true;
    }

    const art = new Artplayer({
      container: el,
      url: url,
      poster: defaultPoster,
      quality: quality,
      theme: theme,
      volume: 0.5,
      isLive: el.dataset.live === 'true',
      muted: false,
      autoplay: false,
      pip: true,
      autoSize: false,
      autoMini: true,
      setting: true,
      loop: false,
      flip: true,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: true,
      miniProgressBar: app.forum.attribute('hertzEmbedVideoMiniProgressBar'),
      airplay: app.forum.attribute('hertzEmbedVideoAirplay'),
      lang: lang === 'zh-cn' ? 'zh-cn' : 'en', // 简易语言映射
      
      // HLS (m3u8) 适配逻辑
      customType: {
        m3u8: function (video, url) {
          if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
          }
        },
      },
    });

    // 标记为已初始化
    el.dataset.initialized = 'true';
    // 将实例挂载到元素上，方便后续销毁
    el._artplayer = art;
  });
}

app.initializers.add('hertz-dev/flarum-ext-embed-video', () => {
  
  // 1. 在帖子列表中渲染播放器
  extend(CommentPost.prototype, 'oncreate', function () {
    initPlayer(this.element);
  });

  extend(CommentPost.prototype, 'onupdate', function () {
    initPlayer(this.element);
  });

  // 2. 在编辑器预览中渲染播放器
  extend(ComposerPostPreview.prototype, 'oncreate', function () {
    initPlayer(this.element);
  });

  extend(ComposerPostPreview.prototype, 'onupdate', function () {
    initPlayer(this.element);
  });

  // 3. 添加编辑器按钮
  extend(TextEditor.prototype, 'controlItems', function (items) {
    // 只有有权限的用户才显示按钮
    if (!app.forum.attribute('canCreateVideo')) {
        // 如果后端有做严格权限控制，这里可以根据需要隐藏
        // 但通常为了用户体验，可以让所有人都看到按钮，后端再拦截
    }

    items.add(
      'hertz-embed-video',
      <Tooltip text={app.translator.trans('hertz-dev-embed-video.admin.permissions.can_create_video')}>
        <Button
          icon="fas fa-play-circle"
          class="Button Button--icon"
          onclick={() => {
            // 插入新的 BBCode 格式
            this.attrs.composer.editor.insertAtCursor(
              `[embed-video url="" qualities="" live="false"]`
            );
          }}
        />
      </Tooltip>
    );
  });
});